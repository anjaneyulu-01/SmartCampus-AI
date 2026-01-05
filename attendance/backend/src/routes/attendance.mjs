
import express from 'express';
import multer from 'multer';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recognizeWithPython } from '../services/faceRecognition.js';
import { broadcastPresence } from '../websocket/websocket.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/attendance/scan - Face scan and mark attendance
router.post('/scan', upload.single('file'), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const subject = (req.body?.subject || 'Biometric Scan').toString().trim() || 'Biometric Scan';
    const frames = [];
    if (req.file?.buffer) frames.push(req.file.buffer);
    if (Array.isArray(req.body?.images)) {
      for (const item of req.body.images) {
        if (!item) continue;
        const raw = String(item);
        const b64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;
        try { frames.push(Buffer.from(b64, 'base64')); } catch {}
      }
    } else if (req.body?.image) {
      const raw = req.body.image.toString();
      const b64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;
      frames.push(Buffer.from(b64, 'base64'));
    }
    if (frames.length === 0) return res.status(400).json({ error: 'image required (file, image base64, or images[] base64)' });
    const result = await recognizeWithPython(frames);
    const nowIso = new Date().toISOString();
    if (result.status !== 'success' || !result.student_id) {
      const msg = String(result?.message || '').toLowerCase();
      const status = msg.includes('no faces detected') || msg.includes('no face') ? 'no_face' : 'not recognized';
      return res.json({ studentId: null, name: null, subject, timestamp: nowIso, status });
    }
    const studentId = result.student_id;
    const student = await db.collection('students').findOne({ _id: studentId });
    const name = student?.name || studentId;
    // Check for existing attendance event today
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const existing = await db.collection('attendance_events').findOne({ student_id: studentId, ts: { $gte: today, $lt: tomorrow }, type: { $in: ['present','checkin'] } });
    if (existing) {
      return res.json({ studentId, name, subject, timestamp: existing.ts, status: 'already_marked', message: 'Already marked present today', avatarUrl: student?.avatar_url || null });
    }
    // Insert new attendance event
    await db.collection('attendance_events').insertOne({ student_id: studentId, entity_id: studentId, entity_type: 'student', type: 'present', label: 'Biometric scan', subject, confidence_score: Number(result.confidence || 0), ts: new Date() });
    broadcastPresence({ student_id: studentId, name: name, class: student?.class || '', status: 'Present', timestamp: nowIso, confidence: Number(result.confidence || 0), avatarUrl: student?.avatar_url || null });
    return res.json({ studentId, name, subject, timestamp: nowIso, status: 'success' });
  } catch (error) {
    console.error('[ERROR] Attendance scan:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

// GET /api/attendance/summary?days=7 - Attendance trend (distinct present per day)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 60);
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(today); start.setDate(today.getDate() - days + 1);
    const pipeline = [
      { $match: { student_id: { $ne: null }, ts: { $gte: start }, type: { $in: ['checkin','present'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } }, count: { $addToSet: '$student_id' } } },
      { $project: { date: '$_id', count: { $size: '$count' }, _id: 0 } },
      { $sort: { date: 1 } }
    ];
    const rows = await db.collection('attendance_events').aggregate(pipeline).toArray();
    res.json(rows);
  } catch (error) {
    console.error('[ERROR] Attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST /api/attendance/mark - Manually mark attendance
router.post('/mark', requireAuth, requireRole('hod', 'teacher'), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { student_id, status } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id required' });
    // For teachers: verify student is in one of their assigned classes
    if (req.user.role === 'teacher') {
      const student = await db.collection('students').findOne({ _id: student_id });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      const teacherClasses = (req.user.assigned_classes || '').split(',').map(c => c.trim()).filter(Boolean);
      if (!teacherClasses.includes(student.class)) return res.status(403).json({ error: 'You can only mark attendance for students in your assigned classes' });
    }
    const normalized = (status || 'present').toString().trim().toLowerCase();
    const eventType = normalized === 'suspicious' ? 'suspicious' : normalized === 'absent' ? 'absent' : 'present';
    const label = `Marked: ${normalized}`;
    // Only one record per student per day
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const existing = await db.collection('attendance_events').findOne({ student_id, ts: { $gte: today, $lt: tomorrow } });
    if (existing) {
      await db.collection('attendance_events').updateOne({ _id: existing._id }, { $set: { type: eventType, label, ts: new Date() } });
    } else {
      await db.collection('attendance_events').insertOne({ student_id, entity_id: student_id, entity_type: 'student', type: eventType, label, ts: new Date() });
    }
    // Broadcast presence
    const student = await db.collection('students').findOne({ _id: student_id });
    broadcastPresence({ student_id, name: student?.name || student_id, class: student?.class || '', status: normalized, timestamp: new Date().toISOString(), avatarUrl: student?.avatar_url || null });
    res.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Mark attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// GET /api/attendance - Get attendance records for a date
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { date } = req.query;
    const class_name = req.query.class || req.query.class_id || req.query.class_name;
    let qdate = date;
    if (!qdate) qdate = new Date().toISOString().split('T')[0];
    const dayStart = new Date(qdate); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
    let studentQuery = {};
    if (class_name && class_name.toLowerCase() !== 'all') studentQuery.class = class_name;
    const students = await db.collection('students').find(studentQuery).toArray();
    const studentMap = {};
    students.forEach(s => { studentMap[s._id] = { id: s._id, name: s.name, avatarUrl: s.avatar_url || '/avatars/default.jpg', class: s.class }; });
    const studentIds = Object.keys(studentMap);
    const attendance = await db.collection('attendance_events').find({ student_id: { $in: studentIds }, ts: { $gte: dayStart, $lt: dayEnd } }).toArray();
    const attByStudent = {};
    attendance.forEach(a => {
      const sid = a.student_id;
      if (!attByStudent[sid]) attByStudent[sid] = [];
      attByStudent[sid].push({ type: a.type, ts: a.ts, label: a.label });
    });
    const records = [];
    for (const [sid, meta] of Object.entries(studentMap)) {
      const records_for_student = attByStudent[sid] || [];
      let status = 'absent';
      let timestamp = null;
      if (records_for_student.length > 0) {
        // Only mark present if present/checkin today, otherwise absent
        const hasPresent = records_for_student.find(r => r.type?.toLowerCase() === 'present');
        const hasCheckin = records_for_student.find(r => r.type?.toLowerCase() === 'checkin');
        if (hasPresent) { status = 'present'; timestamp = hasPresent.ts; }
        else if (hasCheckin) { status = 'present'; timestamp = hasCheckin.ts; }
        // Optionally, you can handle suspicious/other types if needed
      }
      records.push({ student_id: sid, name: meta.name, class: meta.class, status, timestamp, avatarUrl: meta.avatarUrl });
    }
    res.json(records);
  } catch (error) {
    console.error('[ERROR] Get attendance:', error);
    res.status(500).json({ error: 'attendance query failed' });
  }
});

// GET /api/attendance/timeline/:student_id - Get student timeline
router.get('/timeline/:student_id', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { student_id } = req.params;
    const events = await db.collection('attendance_events').find({ student_id }).sort({ ts: -1 }).limit(50).toArray();
    const timeline = events.map(e => ({ id: String(e._id), studentId: student_id, type: e.type, ts: e.ts, label: e.label, meta: { subject: e.subject, room: e.room, note: e.note } }));
    res.json(timeline);
  } catch (error) {
    console.error('[ERROR] Get timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

export default router;
