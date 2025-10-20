# reset_users.py
import sqlite3, hashlib, secrets, binascii

DB = "attendance.db"

def hash_password(password: str, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 150000)
    return salt, binascii.hexlify(dk).decode()

conn = sqlite3.connect(DB)
cur = conn.cursor()

# Optional: wipe existing users (uncomment if you want to start fresh)
# cur.execute("DELETE FROM users")

# We will insert with the legacy 'password' column present.
# Provide a blank string for it so NOT NULL constraint is satisfied.

# HOD
salt, hsh = hash_password("hodpass")
cur.execute("""
INSERT OR REPLACE INTO users
(username, password, password_hash, salt, role, display_name, student_id, assigned_classes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ("hod", "", hsh, salt, "hod", "Head of Department", None, None))

# Teacher
salt, hsh = hash_password("teacher1pass")
cur.execute("""
INSERT OR REPLACE INTO users
(username, password, password_hash, salt, role, display_name, student_id, assigned_classes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ("teacher1", "", hsh, salt, "teacher", "Mrs. Teacher", None, "A,B"))

# Parent for student 'sai' (password = mobile number)
salt, hsh = hash_password("92460118732")
cur.execute("""
INSERT OR REPLACE INTO users
(username, password, password_hash, salt, role, display_name, student_id, assigned_classes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ("sai", "", hsh, salt, "parent", "Sai's Parent", "sai", None))

conn.commit()
conn.close()
print("✅ Users reset. Now you can login with:")
print("  HOD: username=hod, password=hodpass")
print("  Teacher: username=teacher1, password=teacher1pass")
print("  Parent: username=sai, password=92460118732")
