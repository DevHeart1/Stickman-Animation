"""Per-frame visual analysis at 30fps (resampled) + native-rate duplicate detection.

Usage: python -I frames.py <video> <outdir>
Writes <outdir>/metrics.csv (one row per 30fps frame), <outdir>/native.csv,
and JPG thumbnails <outdir>/f/%05d.jpg (30fps) for contact sheets.
"""
import csv
import json
import os
import subprocess
import sys

import cv2
import numpy as np

W, H = 288, 512


def read_frames(path, fps=None, w=W, h=H):
    vf = f"scale={w}:{h}:flags=area"
    if fps:
        vf = f"fps={fps}," + vf
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-pix_fmt", "bgr24", "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    p.wait()


def colorfulness(img):
    b, g, r = [c.astype(np.float32) for c in cv2.split(img)]
    rg = r - g
    yb = 0.5 * (r + g) - b
    return float(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2))


def global_motion(prev_g, g):
    """Estimate similarity transform (zoom, pan) between frames with ORB+RANSAC."""
    orb = cv2.ORB_create(800)
    k1, d1 = orb.detectAndCompute(prev_g, None)
    k2, d2 = orb.detectAndCompute(g, None)
    if d1 is None or d2 is None or len(k1) < 12 or len(k2) < 12:
        return None
    m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2)
    if len(m) < 12:
        return None
    p1 = np.float32([k1[x.queryIdx].pt for x in m])
    p2 = np.float32([k2[x.trainIdx].pt for x in m])
    M, inl = cv2.estimateAffinePartial2D(p1, p2, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if M is None or inl is None or inl.sum() < 10:
        return None
    s = float(np.sqrt(M[0, 0] ** 2 + M[1, 0] ** 2))
    rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    return s, float(M[0, 2]), float(M[1, 2]), rot, int(inl.sum()), len(m)


def main():
    video, out = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.join(out, "f"), exist_ok=True)
    rows = []
    prev = prev_g = prev_hist = None
    for i, f in enumerate(read_frames(video, fps=30)):
        cv2.imwrite(os.path.join(out, "f", f"{i:05d}.jpg"), f, [cv2.IMWRITE_JPEG_QUALITY, 88])
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB)
        L = lab[:, :, 0].astype(np.float32) * 100 / 255
        hist = cv2.calcHist([hsv], [0, 1, 2], None, [16, 8, 8], [0, 180, 0, 256, 0, 256])
        cv2.normalize(hist, hist)
        sat = hsv[:, :, 1].astype(np.float32) / 255
        hue = hsv[:, :, 0][sat > 0.25]
        edges = cv2.Canny(g, 80, 160)
        r = dict(
            frame=i,
            t=round(i / 30, 4),
            L_mean=round(float(L.mean()), 2),
            L_std=round(float(L.std()), 2),
            L_p05=round(float(np.percentile(L, 5)), 2),
            L_p50=round(float(np.percentile(L, 50)), 2),
            L_p95=round(float(np.percentile(L, 95)), 2),
            dark_frac=round(float((L < 20).mean()), 4),
            bright_frac=round(float((L > 90).mean()), 4),
            sat_mean=round(float(sat.mean()), 4),
            colorful=round(colorfulness(f), 2),
            hue_median=int(np.median(hue)) * 2 if hue.size else -1,
            warm=round(float((lab[:, :, 2].astype(np.float32) - 128).mean()), 2),  # +yellow / -blue
            tint=round(float((lab[:, :, 1].astype(np.float32) - 128).mean()), 2),  # +magenta / -green
            edge_density=round(float((edges > 0).mean()), 4),
            sharp=round(float(cv2.Laplacian(g, cv2.CV_64F).var()), 1),
        )
        if prev is not None:
            d = cv2.absdiff(f, prev)
            r["diff"] = round(float(d.mean()), 3)
            r["changed_frac"] = round(float((d.max(axis=2) > 25).mean()), 4)
            r["hist_dist"] = round(float(cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA)), 4)
            gm = global_motion(prev_g, g) if r["diff"] > 0.3 else (1.0, 0.0, 0.0, 0.0, -1, -1)
            if gm:
                r.update(zoom=round(gm[0], 5), dx=round(gm[1], 3), dy=round(gm[2], 3), rot=round(gm[3], 3), inliers=gm[4], matches=gm[5])
        rows.append(r)
        prev, prev_g, prev_hist = f, g, hist
    keys = []
    for r in rows:
        for k in r:
            if k not in keys:
                keys.append(k)
    with open(os.path.join(out, "metrics.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=keys)
        w.writeheader()
        w.writerows(rows)

    # Native-rate pass: which source frames are exact/near holds (animation "on twos" etc.)
    nat = []
    prev = None
    for i, f in enumerate(read_frames(video, fps=None, w=144, h=256)):
        dd = float(cv2.absdiff(f, prev).mean()) if prev is not None else -1
        nat.append(dict(frame=i, diff=round(dd, 4)))
        prev = f
    with open(os.path.join(out, "native.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["frame", "diff"])
        w.writeheader()
        w.writerows(nat)
    print(json.dumps(dict(video=video, frames30=len(rows), native=len(nat))))


if __name__ == "__main__":
    main()
