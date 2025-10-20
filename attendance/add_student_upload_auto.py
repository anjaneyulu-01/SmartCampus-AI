# add_student_upload_auto.py
import requests
from pathlib import Path
import sys

# === CONFIG — edit only student fields & file paths if needed ===
API_BASE = "http://127.0.0.1:8000"
LOGIN_PAYLOAD = {"username": "hod", "password": "hodpass", "role": "hod"}

STUDENT_PAYLOAD = {
    "student_id": "ANJANEYULU123",
    "name": "ANJANEYULU",
    "class_name": "A",
    "mobile": "9063947155",
    "seat_row": "1",
    "seat_col": "2"
}

# file paths (update to match your files)
AVATAR_PATH = Path(r"D:\phython\attendance\ANJANEYULU.jpg")
FACE_PATH   = Path(r"D:\phython\attendance\ANJANEYULU.jpg")
# ==================================================================

def login():
    url = f"{API_BASE}/api/login"
    print("Logging in as HOD...")
    r = requests.post(url, json=LOGIN_PAYLOAD)
    try:
        data = r.json()
    except:
        print("Login failed, non-JSON response:", r.status_code, r.text)
        sys.exit(1)
    if not data.get("success") or "token" not in data:
        print("Login failed or no token in response:", data)
        sys.exit(1)
    token = data["token"]
    role = data.get("role")
    print("Login success. Role:", role)
    if role != "hod":
        print("Warning: logged-in role is not 'hod' — HOD privileges required.")
        sys.exit(1)
    return token

def upload_student(token):
    if not AVATAR_PATH.exists() or not FACE_PATH.exists():
        print("ERROR: avatar/face files not found at:")
        print(" -", AVATAR_PATH)
        print(" -", FACE_PATH)
        sys.exit(1)

    url = f"{API_BASE}/api/students"
    headers = {"Authorization": f"Bearer {token}"}
    files = {
        "avatar": (AVATAR_PATH.name, open(AVATAR_PATH, "rb"), "image/jpeg"),
        "face": (FACE_PATH.name, open(FACE_PATH, "rb"), "image/jpeg"),
    }

    print("Uploading student...")
    resp = requests.post(url, data=STUDENT_PAYLOAD, files=files, headers=headers)
    try:
        print("Status:", resp.status_code)
        print(resp.json())
    except:
        print("Status:", resp.status_code, resp.text)

def verify(token):
    url = f"{API_BASE}/api/students"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers)
    print("Students (first 5):", r.status_code)
    try:
        arr = r.json()
        for s in arr[:5]:
            print(s.get("id"), s.get("name"), s.get("status"))
    except Exception as e:
        print("Could not parse students response:", e)

if __name__ == "__main__":
    t = login()
    upload_student(t)
    verify(t)
