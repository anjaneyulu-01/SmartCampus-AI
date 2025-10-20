import sqlite3, binascii, json
conn = sqlite3.connect("attendance.db")
cur = conn.cursor()
cur.execute("SELECT id, avatar_url FROM students ORDER BY id")
rows = cur.fetchall()
out = []
for sid, av in rows:
    avs = av if av is not None else ''
    hexv = binascii.hexlify(avs.encode("utf-8", "surrogateescape")).decode("ascii") if avs else ''
    out.append({"id": sid, "avatar_url": avs, "length": len(avs), "hex": hexv})
print(json.dumps(out, indent=2, ensure_ascii=False))
conn.close()
