"""
Lightweight Python face recognition service.
Requires: pip install fastapi uvicorn face-recognition opencv-python-headless pillow numpy
Run:    python python_recognition.py
"""
import base64
from io import BytesIO
from pathlib import Path
from typing import List

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

try:
    import cv2  # type: ignore
except ImportError:
    cv2 = None

try:
    import face_recognition  # type: ignore
except ImportError as exc:
    raise SystemExit("face_recognition is required. pip install face-recognition") from exc

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow is required. pip install pillow") from exc

KNOWN_FACES_DIR = Path(__file__).parent / "known_faces"
app = FastAPI()

known_encodings: List[np.ndarray] = []
known_names: List[str] = []


def decode_image_to_array(b64: str) -> np.ndarray:
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, np.uint8)
    if cv2 is not None:
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("cv2 failed to decode image")
        return img[:, :, ::-1]  # BGR -> RGB
    # fallback via PIL
    with BytesIO(data) as bio:
        img = Image.open(bio).convert("RGB")
    return np.array(img)


def load_known_faces() -> None:
    global known_encodings, known_names
    known_encodings = []
    known_names = []

    if not KNOWN_FACES_DIR.exists():
        KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)
        return

    for file in KNOWN_FACES_DIR.iterdir():
        if file.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        try:
            image = face_recognition.load_image_file(file)
            encs = face_recognition.face_encodings(image)
            if not encs:
                continue
            known_encodings.append(encs[0])
            known_names.append(file.stem)
        except Exception as exc:  # noqa: BLE001
            print(f"[WARN] Failed to load {file.name}: {exc}")


@app.on_event("startup")
async def startup_event():
    load_known_faces()
    print(f"[INFO] Loaded {len(known_names)} known faces from {KNOWN_FACES_DIR}")


def best_match(encoding: np.ndarray, tolerance: float = 0.48):
    if not known_encodings:
        return None, None
    distances = face_recognition.face_distance(known_encodings, encoding)
    best_idx = int(np.argmin(distances))
    best_distance = float(distances[best_idx])
    if best_distance <= tolerance:
        return known_names[best_idx], best_distance
    return None, best_distance


@app.post("/match")
async def match(payload: dict):
    images_b64 = payload.get("images")
    if not images_b64 or not isinstance(images_b64, list):
        raise HTTPException(status_code=400, detail="images[] required")

    best_name = None
    best_distance = None
    processed = 0

    for b64 in images_b64:
        try:
            arr = decode_image_to_array(b64)
        except Exception as exc:  # noqa: BLE001
            print(f"[WARN] decode error: {exc}")
            continue

        encs = face_recognition.face_encodings(arr)
        if not encs:
            continue
        processed += 1
        candidate, dist = best_match(encs[0])
        if candidate is None:
            continue
        if best_distance is None or dist < best_distance:
            best_name = candidate
            best_distance = dist

    if processed == 0:
        return JSONResponse({"status": "error", "message": "No faces detected"}, status_code=400)
    if best_name is None:
        return JSONResponse({"status": "error", "message": "No match found"}, status_code=404)

    confidence = max(0.0, 1.0 - (best_distance or 1.0))
    return {"status": "success", "student_id": best_name, "confidence": confidence, "is_suspicious": False}


@app.post("/reload")
async def reload_faces():
    load_known_faces()
    return {"status": "ok", "loaded": len(known_names)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7000)
