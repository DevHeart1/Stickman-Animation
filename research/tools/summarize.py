"""Summarize per-frame metrics into cuts, shots, light/colour, motion, animation rate.
Usage: python -I summarize.py <workdir> v1 v2 ...  -> prints report, writes <workdir>/summary.json"""
import csv
import json
import os
import sys

import numpy as np

wd = sys.argv[1]
NATIVE_FPS = {"v1": 24, "v2": 30, "v3": 30, "v4": 24, "v5": 30, "v6": 24}
out = {}


def f(x, d=np.nan):
    try:
        return float(x)
    except (TypeError, ValueError):
        return d


for v in sys.argv[2:]:
    rows = list(csv.DictReader(open(os.path.join(wd, v, "metrics.csv"))))
    n = len(rows)
    col = lambda k: np.array([f(r.get(k)) for r in rows])
    L, Ls, sat, cf, warm, tint = col("L_mean"), col("L_std"), col("sat_mean"), col("colorful"), col("warm"), col("tint")
    p05, p95, dark, bright = col("L_p05"), col("L_p95"), col("dark_frac"), col("bright_frac")
    diff, hd, chg = col("diff"), col("hist_dist"), col("changed_frac")
    zoom, dx, dy = col("zoom"), col("dx"), col("dy")
    edge, sharp = col("edge_density"), col("sharp")

    # TikTok outro: first frame after which mean L stays < 15 (dark navy card)
    outro = n
    for i in range(n):
        if L[i] < 15 and np.all(L[i:] < 25):
            outro = i
            break
    # Cuts: big histogram jump or most pixels changed in one step
    cuts = [i for i in range(1, outro) if (hd[i] > 0.28 and chg[i] > 0.25) or chg[i] > 0.6]
    merged = []
    for c in cuts:
        if merged and c - merged[-1] <= 2:
            continue
        merged.append(c)
    bounds = [0] + merged + [outro]
    shots = []
    for a, b in zip(bounds[:-1], bounds[1:]):
        if b - a < 1:
            continue
        seg = slice(a, b)
        z = zoom[a + 1:b]
        z = z[~np.isnan(z)]
        cum_zoom = float(np.prod(z)) if z.size else 1.0
        tx = dx[a + 1:b]
        ty = dy[a + 1:b]
        shots.append(dict(
            start=round(a / 30, 2), end=round(b / 30, 2), dur=round((b - a) / 30, 2),
            L=round(float(np.nanmean(L[seg])), 1), L_std=round(float(np.nanmean(Ls[seg])), 1),
            p05=round(float(np.nanmean(p05[seg])), 1), p95=round(float(np.nanmean(p95[seg])), 1),
            sat=round(float(np.nanmean(sat[seg])), 3), colorful=round(float(np.nanmean(cf[seg])), 1),
            warm=round(float(np.nanmean(warm[seg])), 1), tint=round(float(np.nanmean(tint[seg])), 1),
            motion=round(float(np.nanmean(diff[a + 1:b])) if b - a > 1 else 0, 2),
            cum_zoom=round(cum_zoom, 3),
            pan_x=round(float(np.nansum(tx)), 1), pan_y=round(float(np.nansum(ty)), 1),
            max_frame_shift=round(float(np.nanmax(np.abs(np.concatenate([tx, ty])))) if b - a > 1 and np.any(~np.isnan(tx)) else 0, 1),
        ))
    # Native animation rate (content only)
    nat = [f(r["diff"]) for r in csv.DictReader(open(os.path.join(wd, v, "native.csv")))]
    nf = NATIVE_FPS[v]
    content_native = int(outro / 30 * nf)
    nd = np.array(nat[1:content_native])
    holds = float((nd < 0.05).mean()) if nd.size else 0
    unique_per_s = float((nd >= 0.05).sum() / (content_native / nf)) if nd.size else 0
    # longest run of identical frames (freeze)
    run = best = 0
    best_end = 0
    for i, d in enumerate(nd):
        run = run + 1 if d < 0.05 else 0
        if run > best:
            best, best_end = run, i
    out[v] = dict(
        frames30=n, content_end_s=round(outro / 30, 2), total_s=round(n / 30, 2),
        n_cuts=len(merged), cut_times=[round(c / 30, 2) for c in merged],
        avg_shot=round(outro / 30 / max(1, len(shots)), 2),
        L_mean=round(float(np.nanmean(L[:outro])), 1), L_std=round(float(np.nanmean(Ls[:outro])), 1),
        p05=round(float(np.nanmean(p05[:outro])), 1), p95=round(float(np.nanmean(p95[:outro])), 1),
        dark_frac=round(float(np.nanmean(dark[:outro])), 3), bright_frac=round(float(np.nanmean(bright[:outro])), 3),
        sat=round(float(np.nanmean(sat[:outro])), 3), colorful=round(float(np.nanmean(cf[:outro])), 1),
        warm=round(float(np.nanmean(warm[:outro])), 1), tint=round(float(np.nanmean(tint[:outro])), 1),
        edge=round(float(np.nanmean(edge[:outro])), 3), sharp=round(float(np.nanmean(sharp[:outro])), 0),
        motion_mean=round(float(np.nanmean(diff[1:outro])), 2),
        native_fps=nf, native_hold_frac=round(holds, 3), unique_frames_per_s=round(unique_per_s, 1),
        longest_freeze_s=round(best / nf, 2), longest_freeze_at=round((best_end - best + 1) / nf, 2),
        shots=shots,
    )

json.dump(out, open(os.path.join(wd, "summary.json"), "w"), indent=1)
for v, s in out.items():
    print(f"===== {v}: content {s['content_end_s']}s / total {s['total_s']}s | cuts {s['n_cuts']} avg shot {s['avg_shot']}s")
    print(f"  light: L={s['L_mean']} std={s['L_std']} p05={s['p05']} p95={s['p95']} dark={s['dark_frac']} bright={s['bright_frac']}")
    print(f"  colour: sat={s['sat']} colorful={s['colorful']} warm(b*)={s['warm']} tint(a*)={s['tint']} edge={s['edge']} sharp={s['sharp']}")
    print(f"  anim: native {s['native_fps']}fps, holds {s['native_hold_frac']}, unique/s {s['unique_frames_per_s']}, longest freeze {s['longest_freeze_s']}s @ {s['longest_freeze_at']}s, motion {s['motion_mean']}")
    for sh in s["shots"]:
        print(f"   [{sh['start']:6.2f}-{sh['end']:6.2f}] {sh['dur']:5.2f}s L={sh['L']:5.1f} sd={sh['L_std']:4.1f} sat={sh['sat']:.3f} warm={sh['warm']:5.1f} mot={sh['motion']:5.2f} zoom={sh['cum_zoom']:.3f} pan=({sh['pan_x']},{sh['pan_y']}) maxshift={sh['max_frame_shift']}")
