import sqlite3

# ✏️ Change this to the student_id you want to delete
student_id = "sai"

conn = sqlite3.connect("attendance.db")
cur = conn.cursor()

# Delete from related tables first
cur.execute("DELETE FROM attendance_events WHERE student_id = ?", (student_id,))
cur.execute("DELETE FROM trust_scores WHERE student_id = ?", (student_id,))

# Delete from students table
cur.execute("DELETE FROM students WHERE id = ?", (student_id,))

conn.commit()
conn.close()
print(f"🗑️ Deleted student {student_id}")
