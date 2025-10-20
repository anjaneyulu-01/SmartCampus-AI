# add_student_upload.py
import requests
import sys
from pathlib import Path

# === EDIT THESE ===
TOKEN = "218b1f79-d0ca-4455-8d2d-..."   # only the UUID part or full token; we'll add Bearer
API = "http://127.0.0.1:8000/api/students"

payload = {
    "student_id": "ANJANEYULU123",
    "name": "ANJANEYULU",
    "class_name": "A",
    "mobile": "9063947155",
    "seat_row": "1",
    "seat_col": "2"
}

# Files - set the correct local paths to your images
avatar_path = Path(r"D:\phython\attendance\ANJANEYULU.jpg")
face_path   = Path(r"D:\phython\attendance\ANJANEYULU.jpg")

if not avatar_path.exists() or not face_path.exists():
    print("ERROR: avatar/face files not found. Update avatar_path and face_path in the script.")
    sys.exit(1)

files = {
    "avatar": (avatar_path.name, open(avatar_path, "rb"), "image/jpeg"),
    "face":   (face_path.name,   open(face_path, "rb"),   "image/jpeg"),
}

headers = {
    "Authorization": f"Bearer {TOKEN}",
}

print("Uploading student... (this may take 1-2s)")
r = requests.post(API, data=payload, files=files, headers=headers)
print("Status:", r.status_code)
try:
    print(r.json())
except:
    print(r.text)
