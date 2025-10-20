# migrate_ids.py
import sqlite3
DB = "attendance.db"
mappings = {
    "ABHISHE K": "abhishek",
    # add more mappings if needed: "OLD ID": "new_id",
}
conn = sqlite3.connect(DB)
cur = conn.cursor()
for old, new in mappings.items():
    cur.execute("UPDATE students SET id = ? WHERE id = ?", (new, old))
    cur.execute("UPDATE trust_scores SET student_id = ? WHERE student_id = ?", (new, old))
    cur.execute("UPDATE attendance_events SET student_id = ? WHERE student_id = ?", (new, old))
conn.commit()
conn.close()
print("done")
