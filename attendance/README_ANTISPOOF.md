Anti-spoof setup for PresenceAI

This file describes how to enable the optional MiniFASNet anti-spoof models and run the app with improved anti-spoof detection.

1) Install dependencies

If you want full model-based anti-spoofing, install PyTorch. For CPU-only (Windows PowerShell example):

```powershell
python -m pip install -r .\requirements.txt
# If torch fails from pip requirements, install CPU wheel directly (example):
# python -m pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu
```

2) Download recommended MiniFASNet models

You mentioned these files (download the raw .pth blobs from your repo):

- 2.7_80x80_MiniFASNetV2.pth
- 4_0_0_80x80_MiniFASNetV1SE.pth

Place the downloaded .pth files into the folder `anti_spoof_models/` at the project root (the app will create the folder on first run).

3) Run the application

```powershell
python .\main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

4) How the integration works

- The app contains `anti_spoof_models.py` with lightweight MiniFASNet V1SE and V2 model classes.
- `load_antispoof_models()` will attempt to load .pth files:
  - If the .pth is a TorchScript, it loads and runs it directly.
  - If the .pth is a state_dict (dict), it will instantiate either the V2 or V1SE class (by filename heuristics) and load the dict.
  - If loading fails, the raw object is stored for debugging.
- WebSocket and multi-frame checkin logic use both heuristics and model outputs (if available) to mark frames as suspicious.

5) If model loading fails

- Common reason: the .pth was saved for a slightly different architecture. In that case either:
  - Provide the specific model class code (I can add it if you share), or
  - Re-export the model as TorchScript on the machine that produced it (recommended). A TorchScript model loads without requiring the original Python class.

6) Want me to test with sample images?

If you provide a few sample images (live person photos vs mobile-screen scans) I can iterate on thresholds and tune heuristics to match your environment.
