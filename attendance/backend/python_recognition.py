"""
Lightweight Python face recognition service.
Requires: pip install fastapi uvicorn face-recognition opencv-python-headless pillow numpy pymysql
Run:    python python_recognition.py

This service is designed to be used by the standalone /scan “biometric device” flow.
It matches incoming images against face encodings stored in MySQL.
"""
import base64
import json
import os
from io import BytesIO
from pathlib import Path
from typing import List

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

try:
    import pymysql  # type: ignore
except ImportError as exc:
    raise SystemExit("pymysql is required. pip install pymysql") from exc

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


def _load_local_env() -> None:
    """Load env vars from a local .env file (attendance/backend/.env).

    This keeps the Python service aligned with the Node backend config without
    requiring python-dotenv as a dependency.
    """
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    try:
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if not key:
                continue
            # Do not override existing environment variables.
            os.environ.setdefault(key, value)
    except Exception as exc:  # noqa: BLE001
        print(f"[WARN] Failed to load .env for python service: {exc}")


def _get_env(*names: str, default: str = "") -> str:
    for name in names:
        val = os.getenv(name)
        if val is not None and str(val) != "":
            return str(val)
    return default


_load_local_env()


def extract_face_encodings(rgb_image: np.ndarray) -> List[np.ndarray]:
    """Extract face encodings with a couple of increasingly aggressive attempts.

    The webcam frames sent from the browser can be slightly blurry or low-contrast.
    Trying a higher upsample helps face detection in those cases.
    """
    # Ensure contiguous uint8 RGB.
    # NOTE: On Windows, dlib can throw `compute_face_descriptor(): incompatible function arguments`
    # if the input ndarray has negative strides (common with `[:, :, ::-1]` channel flips)
    # or is otherwise non-contiguous.
    if rgb_image.dtype != np.uint8:
        rgb_image = rgb_image.astype(np.uint8, copy=False)
    if not rgb_image.flags["C_CONTIGUOUS"]:
        rgb_image = np.ascontiguousarray(rgb_image)

    # Try default first
    encs = face_recognition.face_encodings(rgb_image)
    if encs:
        return encs

    # If nothing detected, try explicit face_locations with a small upsample.
    # (Upsample=2 improves recall but is noticeably slower on CPU.)
    try:
        locations = face_recognition.face_locations(
            rgb_image,
            number_of_times_to_upsample=1,
            model="hog",
        )
        if locations:
            return face_recognition.face_encodings(rgb_image, known_face_locations=locations)
    except Exception as exc:  # noqa: BLE001
        print(f"[WARN] face_locations failed: {exc}")

    return []


def db_connect():
    # Keep defaults aligned with the Node backend's typical env.
    # Support both MYSQL_* (python service convention) and DB_* (node backend convention).
    host = _get_env("MYSQL_HOST", "DB_HOST", default="127.0.0.1")
    user = _get_env("MYSQL_USER", "DB_USER", default="root")
    password = _get_env("MYSQL_PASSWORD", "DB_PASSWORD", default="")
    database = _get_env("MYSQL_DATABASE", "DB_NAME", default="attendance_db")
    port = int(_get_env("MYSQL_PORT", "DB_PORT", default="3306"))

    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )


def decode_image_to_array(b64: str) -> np.ndarray:
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, np.uint8)
    if cv2 is not None:
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("cv2 failed to decode image")
        # BGR -> RGB (must be contiguous for dlib)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return np.ascontiguousarray(rgb)
    # fallback via PIL
    with BytesIO(data) as bio:
        img = Image.open(bio).convert("RGB")
    return np.ascontiguousarray(np.array(img, dtype=np.uint8))


def ensure_tables() -> None:
    # Create the encodings table if the backend hasn't created it yet.
    with db_connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS student_face_encodings (
                  student_id VARCHAR(255) PRIMARY KEY,
                  encoding_json MEDIUMTEXT NOT NULL,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )


def load_known_faces_from_db() -> None:
    global known_encodings, known_names
    known_encodings = []
    known_names = []

    with db_connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT student_id, encoding_json FROM student_face_encodings")
            rows = cur.fetchall() or []

    for row in rows:
        try:
            vec = json.loads(row["encoding_json"])
            arr = np.array(vec, dtype=np.float64)
            if arr.ndim != 1:
                continue
            known_encodings.append(arr)
            known_names.append(str(row["student_id"]))
        except Exception as exc:  # noqa: BLE001
            print(f"[WARN] Bad encoding for {row.get('student_id')}: {exc}")


def bootstrap_db_encodings_from_files() -> int:
    """Build encodings from known_faces/*.jpg and upsert them into DB.

    File naming convention: <student_id>.jpg
    Only students that exist in the `students` table are imported (avoids FK issues
    when the table is created by the Node backend with a foreign key).
    """
    if not KNOWN_FACES_DIR.exists():
        KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)
        return 0

    inserted = 0
    with db_connect() as conn:
        with conn.cursor() as cur:
            for file in KNOWN_FACES_DIR.iterdir():
                if file.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                    continue
                try:
                    student_id = file.stem

                    # Skip unknown IDs to keep DB consistent.
                    cur.execute("SELECT id FROM students WHERE id = %s LIMIT 1", (student_id,))
                    if not cur.fetchone():
                        continue

                    image = face_recognition.load_image_file(file)
                    encs = extract_face_encodings(image)
                    if not encs:
                        continue
                    enc = encs[0].tolist()
                    cur.execute(
                        """
                        INSERT INTO student_face_encodings (student_id, encoding_json)
                        VALUES (%s, %s)
                        ON DUPLICATE KEY UPDATE encoding_json = VALUES(encoding_json)
                        """,
                        (student_id, json.dumps(enc)),
                    )
                    inserted += 1
                except Exception as exc:  # noqa: BLE001
                    print(f"[WARN] Failed to encode {file.name}: {exc}")

    return inserted


@app.on_event("startup")
async def startup_event():
    ensure_tables()

    # Always upsert from known_faces so existing images are stored in DB.
    inserted = bootstrap_db_encodings_from_files()
    load_known_faces_from_db()
    if inserted:
        print(f"[INFO] Synced {inserted} face encodings from known_faces into DB")

    print(f"[INFO] Loaded {len(known_names)} face encodings from DB")


def best_match(encoding: np.ndarray, tolerance: float = 0.65):
    # Default tolerance in face_recognition docs is ~0.6.
    # Web-cam JPEG frames are often noisier; a slightly higher tolerance improves recall.
    if tolerance is None:
        tolerance = 0.65
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

    early_accept = float(os.getenv("FACE_EARLY_ACCEPT", "0.55"))
    for b64 in images_b64:
        try:
            arr = decode_image_to_array(b64)
        except Exception as exc:  # noqa: BLE001
            print(f"[WARN] decode error: {exc}")
            continue

        # Try both normal and horizontally flipped frame.
        candidates_to_try = [arr]
        try:
            candidates_to_try.append(np.ascontiguousarray(arr[:, ::-1, :]))
        except Exception:
            pass

        for candidate_img in candidates_to_try:
            encs = extract_face_encodings(candidate_img)
            if not encs:
                continue
            processed += 1
            candidate, dist = best_match(encs[0], tolerance=0.65)
            if dist is not None and (best_distance is None or dist < best_distance):
                best_distance = dist
            if candidate is None:
                continue
            best_name = candidate

            # Early exit for speed when the match is confidently within threshold.
            if dist is not None and dist <= early_accept:
                confidence = max(0.0, 1.0 - dist)
                return {
                    "status": "success",
                    "student_id": best_name,
                    "confidence": confidence,
                    "is_suspicious": False,
                }

    if processed == 0:
        return JSONResponse({"status": "error", "message": "No faces detected"}, status_code=400)
    if best_name is None:
        return JSONResponse(
            {
                "status": "error",
                "message": "No match found",
                "best_distance": best_distance,
                "tolerance": 0.65,
            },
            status_code=404,
        )

    confidence = max(0.0, 1.0 - (best_distance or 1.0))
    return {"status": "success", "student_id": best_name, "confidence": confidence, "is_suspicious": False}


@app.post("/reload")
async def reload_faces():
    ensure_tables()
    # Always sync from known_faces so adding a new file takes effect immediately.
    inserted = bootstrap_db_encodings_from_files()
    load_known_faces_from_db()
    return {"status": "ok", "loaded": len(known_names), "synced": inserted}


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "loaded": len(known_names)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7000)
