# migrate_add_student_columns.py
import sqlite3
import sys
from pathlib import Path

db = Path("attendance.db")
if not db.exists():
    print("attendance.db not found in current folder.")
    sys.exit(1)

conn = sqlite3.connect(str(db))
c = conn.cursor()

def add_col(col_def):
    name = col_def.split()[0]
    try:
        c.execute(f"ALTER TABLE students ADD COLUMN {col_def}")
        print("Added column:", col_def)
    except Exception as e:
        print("Skipping add column (may already exist):", col_def, "->", e)

# add columns that our frontend expects
add_col("class TEXT")
add_col("class_name TEXT")
add_col("mobile TEXT")

conn.commit()
conn.close()
print("Migration done.")
