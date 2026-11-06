"""Audio analysis: pause-based segmentation, Whisper transcription per segment,
per-segment pitch (voice identity), loudness curve, onsets, music detection.

Usage: python -I audio.py <wav16k> <model_dir> <out.json>
"""
import json
import subprocess
import sys

import librosa
import numpy as np
import sherpa_onnx
import soundfile as sf


def acf_pitch(y, sr, hop, fmin=70, fmax=600, win=640, thr=0.55):
    n = (len(y) - win) // hop + 1
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    fr = y[idx] * np.hanning(win)[None, :]
    fr = fr - fr.mean(axis=1, keepdims=True)
    F = np.fft.rfft(fr, n=2 * win, axis=1)
    ac = np.fft.irfft(np.abs(F) ** 2, axis=1)[:, :win]
    ac = ac / (ac[:, :1] + 1e-12)
    lo, hi = int(sr / fmax), int(sr / fmin)
    seg = ac[:, lo:hi]
    k = seg.argmax(axis=1)
    pk = seg[np.arange(n), k]
    energy = (fr ** 2).mean(axis=1)
    f = sr / (k + lo)
    f[(pk < thr) | (energy < 1e-5)] = np.nan
    return f


def segments_by_pause(y, sr, hop, top_db_rel=32, min_gap=0.18, min_len=0.12):
    rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-9)
    ref = np.percentile(db, 97)
    active = db > ref - top_db_rel
    segs, start = [], None
    for i, a in enumerate(active):
        t = i * hop / sr
        if a and start is None:
            start = t
        if not a and start is not None:
            segs.append([start, t])
            start = None
    if start is not None:
        segs.append([start, len(y) / sr])
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [s for s in merged if s[1] - s[0] >= min_len], db, ref


def main():
    wav, model_dir, out = sys.argv[1:4]
    y, sr = sf.read(wav)
    y = y.astype(np.float32)
    hop = 160  # 10 ms
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f"{model_dir}/small.en-encoder.int8.onnx",
        decoder=f"{model_dir}/small.en-decoder.int8.onnx",
        tokens=f"{model_dir}/small.en-tokens.txt",
        language="en",
        task="transcribe",
        num_threads=2,
    )

    def transcribe(a, b):
        pad = 0.08
        s0, s1 = max(0, int((a - pad) * sr)), min(len(y), int((b + pad) * sr))
        st = rec.create_stream()
        st.accept_waveform(sr, y[s0:s1])
        rec.decode_stream(st)
        return st.result.text.strip()

    segs, db, ref = segments_by_pause(y, sr, hop)
    f0 = acf_pitch(y, sr, hop)
    seg_out = []
    for a, b in segs:
        i0, i1 = int(a * sr / hop), int(b * sr / hop)
        ff = f0[i0:i1]
        ff = ff[~np.isnan(ff)]
        seg_out.append(dict(
            start=round(a, 3), end=round(b, 3), dur=round(b - a, 3),
            text=transcribe(a, b),
            f0_median=round(float(np.median(ff)), 1) if ff.size else None,
            f0_p10=round(float(np.percentile(ff, 10)), 1) if ff.size else None,
            f0_p90=round(float(np.percentile(ff, 90)), 1) if ff.size else None,
            voiced_frac=round(float(ff.size / max(1, i1 - i0)), 2),
            peak_db=round(float(db[i0:i1].max() - ref), 1),
        ))
    # Full-pass transcript in <=28s windows (cross-check)
    full = []
    t = 0.0
    dur = len(y) / sr
    while t < dur:
        e = min(dur, t + 28)
        full.append(dict(start=round(t, 2), end=round(e, 2), text=transcribe(t, e)))
        t = e

    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop, units="time", backtrack=False)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr, hop_length=hop, units="time")
    # Music bed check: level in the gaps between speech segments
    gaps = []
    prev_end = 0.0
    for a, b in segs:
        if a - prev_end > 0.15:
            i0, i1 = int(prev_end * sr / hop), int(a * sr / hop)
            gaps.append(float(np.median(db[i0:i1]) - ref))
        prev_end = b
    flat = librosa.feature.spectral_flatness(y=y, hop_length=hop)[0]
    cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
    loud = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "ebur128=peak=true", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    summary = loud[loud.rfind("Summary:"):]
    json.dump(dict(
        duration=round(dur, 3),
        segments=seg_out,
        full_transcript=full,
        onsets=[round(float(x), 3) for x in onsets],
        tempo=float(np.atleast_1d(tempo)[0]),
        beats=[round(float(x), 3) for x in beats],
        gap_levels_db_rel=[round(g, 1) for g in gaps],
        speech_time=round(sum(s["dur"] for s in seg_out), 2),
        rms_db_rel_100ms=[round(float(x - ref), 1) for x in db[::10]],
        centroid_median=float(np.median(cent)),
        flatness_median=float(np.median(flat)),
        ebur128=summary,
    ), open(out, "w"), indent=1)
    print("done", out)


if __name__ == "__main__":
    main()
