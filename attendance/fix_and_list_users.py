# fix_and_list_users.py
import sqlite3
import hashlib, secrets, binascii
import os

DB = "attendance.db"
if not os.path.exists(DB):
    print("attendance.db not found in current dir.")
    raise SystemExit(1)

def hash_password(password: str, salt: str = None):
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 150000)
    return salt, binascii.hexlify(dk).decode()

conn = sqlite3.connect(DB)
cur = conn.cursor()

# get columns
cur.execute("PRAGMA table_info(users);")
cols = [r[1] for r in cur.fetchall()]
print("Current users table columns:", cols)

# desired optional columns (from your main.py)
desired = ["password_hash","salt","role","display_name","student_id","assigned_classes"]

for col in desired:
    if col not in cols:
        print(f"Adding missing column: {col}")
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT")
        except Exception as e:
            print("Could not add column", col, e)

conn.commit()

# show rows (select only columns that exist)
select_cols = ", ".join([c for c in ["username","role","display_name","student_id","assigned_classes"] if c in cols or c in desired])
try:
    cur.execute(f"SELECT {select_cols} FROM users;")
    rows = cur.fetchall()
    if not rows:
        print("No users found.")
    else:
        print("\n--- Users in DB ---")
        for r in rows:
            print(r)
except Exception as e:
    print("Error listing users:", e)

# Insert teacher1 if missing
cur.execute("SELECT 1 FROM users WHERE username = ?", ("teacher1",))
if cur.fetchone() is None:
    username = "teacher1"
    password = "teacher1pass"
    salt, hsh = hash_password(password)
    print(f"\nInserting demo user: {username} (password: {password})")
    # use INSERT OR REPLACE to be safe
    cur.execute("""
      INSERT OR REPLACE INTO users (username, password_hash, salt, role, display_name, assigned_classes)
      VALUES (?, ?, ?, ?, ?, ?)
    """, (username, hsh, salt, "teacher", "Mrs. Teacher", "A,B"))
    conn.commit()
    print("Inserted teacher1.")
else:
    print("\nteacher1 already exists (no insert).")

conn.close()
print("\nDone. Run your app and try login with teacher1 / teacher1pass")
