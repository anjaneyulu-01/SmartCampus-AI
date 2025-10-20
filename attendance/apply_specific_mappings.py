# apply_specific_mappings.py
"""
Safe migrator: apply explicit ID mappings and back up DB first.
"""
import sqlite3
import shutil
import pathlib
import sys

DB = "attendance.db"
BACKUP = DB + ".bak"

# === Edit this dictionary if you want to add/remove mappings ===
# left = existing DB id, right = desired id (should match face filename)
mappings = {
    "ABHISHEK": "abhishek",
    "ANJANEYULU123": "anjaneyulu"
}

# Basic checks
if not pathlib.Path(DB).exists():
    print("ERROR: DB not found:", DB)
    sys.exit(1)

print("Proposed mappings:")
for old, new in mappings.items():
    print(f"  {old}  ->  {new}")

confirm = input("\nType 'y' to BACKUP and apply these mappings (this will create '{}'): ".format(BACKUP)).strip().lower()
if confirm != "y":
    print("Aborted by user.")
    sys.exit(0)

# Backup DB
shutil.copyfile(DB, BACKUP)
print("Backup created:", BACKUP)

conn = sqlite3.connect(DB)
cur = conn.cursor()

try:
    for old, new in mappings.items():
        # Check if old exists
        cur.execute("SELECT 1 FROM students WHERE id = ?", (old,))
        if cur.fetchone() is None:
            print(f"  SKIP: source id '{old}' not found in students table.")
            continue

        # Check if new already exists
        cur.execute("SELECT 1 FROM students WHERE id = ?", (new,))
        if cur.fetchone() is not None:
            print(f"  WARNING: target id '{new}' already exists. Skipping mapping for '{old}'.")
            continue

        # Apply updates (students, trust_scores, attendance_events)
        print(f"  Applying: {old} -> {new}")
        cur.execute("UPDATE students SET id = ? WHERE id = ?", (new, old))
        cur.execute("UPDATE trust_scores SET student_id = ? WHERE student_id = ?", (new, old))
        cur.execute("UPDATE attendance_events SET student_id = ? WHERE student_id = ?", (new, old))

    conn.commit()
    print("All done. Commit successful.")
finally:
    conn.close()

print("\nNEXT: restart the backend (uvicorn) and verify /api/students and a sample timeline.")
print("To rollback: copy '{}' back to '{}' (or restore from your backup).".format(BACKUP, DB))
