# fix_avatar_case.py
import sqlite3
import os
from pathlib import Path

DB_PATH = "attendance.db"
BASE_DIR = Path(__file__).resolve().parent
AVATARS = BASE_DIR / "avatars"

def normalize_on_filesystem():
    # Rename files to lowercase (only if target not present)
    for p in list(AVATARS.iterdir()):
        if not p.is_file():
            continue
        new = AVATARS / p.name.lower()
        if p.name == new.name:
            continue
        # avoid clobbering an existing file
        if new.exists():
            print(f"Target {new.name} exists - removing original {p.name}")
            try:
                p.unlink()
            except Exception as e:
                print("unlink failed", e)
        else:
            print(f"Renaming {p.name} -> {new.name}")
            p.rename(new)

def normalize_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # Normalize any avatar_url to lowercase basename and ensure it starts with /avatars/
    cur.execute("SELECT id, avatar_url FROM students")
    rows = cur.fetchall()
    for rid, avatar in rows:
        if avatar is None:
            continue
        avatar = str(avatar).strip()
        if avatar == "":
            continue
        # take basename then lowercase
        base = os.path.basename(avatar).lower()
        newpath = f"/avatars/{base}"
        if avatar != newpath:
            print(f"Updating DB {rid}: {avatar} -> {newpath}")
            cur.execute("UPDATE students SET avatar_url = ? WHERE id = ?", (newpath, rid))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    normalize_on_filesystem()
    normalize_db()
    print("Done. Restart backend and hard-refresh your browser.")
