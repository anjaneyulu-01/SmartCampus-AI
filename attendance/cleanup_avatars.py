import sqlite3, re
DB = "attendance.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.execute("SELECT id, avatar_url FROM students")
rows = cur.fetchall()
fixes = 0
for sid, av in rows:
    if av is None:
        continue
    # remove any whitespace/newlines/tabs inside the value
    cleaned = re.sub(r'\s+', '', av).strip()
    if cleaned != av:
        cur.execute("UPDATE students SET avatar_url=? WHERE id=?", (cleaned, sid))
        fixes += 1
conn.commit()
conn.close()
print(f"done — fixed {fixes} avatar_url(s)")
