# check_mappings.py
import sqlite3, pathlib, json, difflib, sys

DB = "attendance.db"
KNOWN_DIR = pathlib.Path("known_faces")

def canonical(s: str) -> str:
    if s is None: return ""
    return "".join(ch for ch in s.lower() if not ch.isspace())

def load_db_ids():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM students")
    rows = cur.fetchall()
    conn.close()
    return [(r["id"], r["name"]) for r in rows]

def load_face_bases():
    if not KNOWN_DIR.exists():
        return []
    files = [p.stem for p in KNOWN_DIR.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png")]
    return files

db_rows = load_db_ids()
face_bases = load_face_bases()

db_ids = [r[0] for r in db_rows]
db_map = { canonical(r[0]): r[0] for r in db_rows }
face_map = { canonical(b): b for b in face_bases }

exact_matches = [i for i in db_ids if i in face_bases]
canonical_matches = []
unmatched_db = []
unmatched_faces = []

for dbid in db_ids:
    can = canonical(dbid)
    if can in face_map and dbid not in exact_matches:
        canonical_matches.append((dbid, face_map[can]))
    elif dbid not in exact_matches:
        unmatched_db.append(dbid)

for fb in face_bases:
    can = canonical(fb)
    if can not in db_map:
        unmatched_faces.append(fb)

print("=== SUMMARY ===")
print("DB students:", len(db_ids))
print("Face files:", len(face_bases))
print()
print("Exact filename matches (db id == face filename):")
for x in exact_matches:
    print("  -", x)
print()
print("Canonical matches (case/space tolerant) — DB id -> face file:")
for dbid, fb in canonical_matches:
    print("  -", dbid, "->", fb)
print()
print("Unmatched DB student ids (no face file found):")
for u in unmatched_db:
    print("  -", u)
print()
print("Face files with no matching DB student:")
for f in unmatched_faces:
    print("  -", f)
print()
# Suggested mapping: map DB id -> face filename base for canonical matches
suggested = { dbid: fb for dbid, fb in canonical_matches }
print("Suggested mappings (safe starting point):")
print(json.dumps(suggested, indent=2, ensure_ascii=False))
# show fuzzy suggestions for unmatched db ids (optional)
if unmatched_db:
    print()
    print("Fuzzy suggestions for unmatched DB ids (top candidate from face files):")
    for u in unmatched_db:
        cand = difflib.get_close_matches(canonical(u), [canonical(x) for x in face_bases], n=1)
        if cand:
            # map back to original face base
            fb = next((f for f in face_bases if canonical(f) == cand[0]), None)
            if fb:
                print(f"  - {u}  ->  {fb} (fuzzy)")
            else:
                print(f"  - {u}  ->  (no fuzzy match)")
        else:
            print(f"  - {u}  ->  (no fuzzy match)")
