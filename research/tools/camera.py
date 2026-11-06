"""Camera move per shot: similarity transform of each sampled frame vs the shot's first frame.
Also native-rate animation cadence via changed-pixel fraction.
Usage: python -I camera.py <workdir> <video_dir_name> <native_video_path> <native_fps>"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

wd, v, vid, nfps = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
summ = json.load(open(os.path.join(wd, "summary.json")))[v]
fdir = os.path.join(wd, v, "f")
files = sorted(os.listdir(fdir))
orb = cv2.ORB_create(2000)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


def kp(i):
    g = cv2.cvtColor(cv2.imread(os.path.join(fdir, files[i])), cv2.COLOR_BGR2GRAY)
    return orb.detectAndCompute(g, None)


def rel(a, b):
    k1, d1 = a
    k2, d2 = b
    if d1 is None or d2 is None:
        return None
    m = bf.match(d1, d2)
    if len(m) < 15:
        return None
    p1 = np.float32([k1[x.queryIdx].pt for x in m])
    p2 = np.float32([k2[x.trainIdx].pt for x in m])
    M, inl = cv2.estimateAffinePartial2D(p1, p2, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if M is None or inl.sum() < 12:
        return None
    return round(float(np.hypot(M[0, 0], M[1, 0])), 3), round(float(M[0, 2]), 1), round(float(M[1, 2]), 1), int(inl.sum())


res = []
for sh in summ["shots"]:
    a, b = int(round(sh["start"] * 30)), int(round(sh["end"] * 30))
    if b - a < 6:
        continue
    k0 = kp(a + 1)
    curve = []
    for i in range(a + 1, b, 3):
        r = rel(k0, kp(i))
        curve.append((round(i / 30, 2),) + (r if r else (None, None, None, 0)))
    res.append(dict(start=sh["start"], end=sh["end"], curve=curve))
    sc = [c[1] for c in curve if c[1]]
    tx = [c[2] for c in curve if c[1]]
    ty = [c[3] for c in curve if c[1]]
    if sc:
        print(f"[{sh['start']:6.2f}-{sh['end']:6.2f}] scale {min(sc):.3f}..{max(sc):.3f} end={sc[-1]:.3f} | tx {min(tx):.0f}..{max(tx):.0f} ty {min(ty):.0f}..{max(ty):.0f}")
        # print coarse curve
        print("    ", " ".join(f"{c[0]}:{c[1]}" for c in curve[:: max(1, len(curve) // 14)]))

# Animation cadence at native fps, changed-pixel fraction (>20 levels) at 1/2 res
w, h = 288, 512
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", vid, "-vf", f"scale={w}:{h}", "-pix_fmt", "gray", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
prev = None
ch = []
while True:
    buf = p.stdout.read(w * h)
    if len(buf) < w * h:
        break
    fr = np.frombuffer(buf, np.uint8).astype(np.int16)
    if prev is not None:
        ch.append(float((np.abs(fr - prev) > 20).mean()))
    prev = fr
end = int(summ["content_end_s"] * nfps)
c = np.array(ch[: end - 1])
moving = c > 0.0008
print(f"cadence: frames with visible change {moving.mean():.2f}; pattern sample (1=change):")
for s in [1.0, 4.0]:
    i0 = int(s * nfps)
    print(f"   t={s}s:", "".join("1" if x else "0" for x in moving[i0:i0 + nfps * 2]))
# run-length of holds
runs = []
r = 0
for x in moving:
    if not x:
        r += 1
    else:
        if r:
            runs.append(r)
        r = 0
hist = np.bincount(runs)[:8] if runs else []
print("   hold-run histogram (len:count):", {i: int(n) for i, n in enumerate(hist) if n})
json.dump(dict(camera=res, change=[round(x, 5) for x in ch]), open(os.path.join(wd, v + ".camera.json"), "w"))
