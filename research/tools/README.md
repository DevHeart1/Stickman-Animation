# Analysis tools

These scripts produced the numbers in `../viral-stickman-tiktok-analysis.md`. They need `ffmpeg` on the PATH and `pip install opencv-python-headless numpy pillow librosa soundfile sherpa-onnx`. For speech they use the sherpa-onnx Whisper `small.en` model, downloadable from the k2-fsa/sherpa-onnx GitHub releases (`asr-models`).

| Script | What it does |
|---|---|
| `frames.py <video> <outdir>` | Resamples to 30 fps. Writes per-frame metrics (`metrics.csv`), native-rate frame differences (`native.csv`) and JPG frames (`f/`). |
| `summarize.py <workdir> v1 v2 …` | Detects the TikTok outro, cuts and shots. Writes per-shot light, colour and motion, and native animation cadence (`summary.json`). |
| `camera.py <workdir> <v> <video> <native_fps>` | Zoom/pan curve per shot (each frame vs. the shot's first frame) and the 24→30 pulldown/hold pattern. |
| `audio.py <wav16k> <model_dir> <out.json>` | Pause-based line segmentation, Whisper transcript per line and full pass, pitch per line, onsets, gap levels, EBU R128 loudness. |
| `sheet.py <framesdir> <out.jpg> <start> <end> <step> <cols> <tilew>` | Labelled contact sheet (frame number and timestamp). |

Example:

```bash
ffmpeg -i clip.mp4 -ac 1 -ar 16000 clip.wav
python -I frames.py clip.mp4 work/clip
python -I summarize.py work clip      # set NATIVE_FPS in the script for new IDs
python -I audio.py clip.wav models/sherpa-onnx-whisper-small.en work/clip.audio.json
python -I sheet.py work/clip/f hook.jpg 0 60 1 10 144   # first 2 s at 30 fps
```

The data these produced for the six study videos is in `../data/`.
