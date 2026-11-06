"""Transcription for dialogue over a music bed: ~8 s chunks cut at speech-band
energy minima, plus music-bed level estimate (speech vs. floor percentiles).
Usage: python -I audio_bed.py <wav16k> <model_dir> <out.json>"""
import json
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf
from scipy.signal import butter, sosfilt

wav, model_dir, out = sys.argv[1:4]
y, sr = sf.read(wav)
y = y.astype(np.float32)
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{model_dir}/small.en-encoder.int8.onnx", decoder=f"{model_dir}/small.en-decoder.int8.onnx",
    tokens=f"{model_dir}/small.en-tokens.txt", language="en", task="transcribe", num_threads=4)
hop = 160
sos = butter(4, [300, 3400], btype="band", fs=sr, output="sos")
yb = sosfilt(sos, y)
n = len(y) // hop
env = np.sqrt(np.array([np.mean(yb[i * hop:(i + 1) * hop] ** 2) for i in range(n)]) + 1e-12)
db = 20 * np.log10(env)
full = 20 * np.log10(np.sqrt(np.array([np.mean(y[i * hop:(i + 1) * hop] ** 2) for i in range(n)]) + 1e-12))
sm = np.convolve(db, np.ones(15) / 15, mode="same")  # 150 ms smoothing
cuts = [0]
target = 8.0
while True:
    c = cuts[-1] / 100 + target
    if c > n / 100 - 3:
        break
    lo, hi = int((c - 2) * 100), int((c + 2) * 100)
    cuts.append(lo + int(np.argmin(sm[lo:hi])))
cuts.append(n)
chunks = []
for a, b in zip(cuts[:-1], cuts[1:]):
    st = rec.create_stream()
    st.accept_waveform(sr, y[a * hop:b * hop])
    rec.decode_stream(st)
    chunks.append(dict(start=round(a / 100, 2), end=round(b / 100, 2), text=st.result.text.strip()))
p = lambda q: float(np.percentile(full, q))
json.dump(dict(
    chunks=chunks,
    level_p10_dbfs=round(p(10), 1), level_p50_dbfs=round(p(50), 1), level_p95_dbfs=round(p(95), 1),
    bed_below_speech_db=round(p(95) - p(10), 1),
    silent_frac=round(float((full < -60).mean()), 3),
), open(out, "w"), indent=1)
print("done", out)
