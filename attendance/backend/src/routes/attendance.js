import express from 'express';
import multer from 'multer';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recognizeWithPython } from '../services/faceRecognition.js';
import { getAvatarUrlForStudent } from '../utils/helpers.js';
import { broadcastPresence } from '../websocket/websocket.js';

const router = express.Router();

// Configure multer for multiple file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

// Legacy-compatible multi-frame recognition helper.
// The old webscan.html posts multiple frames and expects the backend to decide a match.
// We delegate this to the Python face service which can evaluate multiple frames.
async function processFramesConsensus(frames, _minAgree = 2, _distanceThreshold = 0.48) {
  const result = await recognizeWithPython(frames);
  // normalize minimal shape expected by existing checkin route
  if (result && result.status === 'success') {
    return {
      status: 'success',
      student_id: result.student_id,
      confidence: Number(result.confidence || 0),
      is_suspicious: Boolean(result.is_suspicious || false),
    };
  }
  return result;
}

/**
 * POST /api/attendance/scan - Biometric device scan
 * - No auth (device-like behavior)
 * - Accepts multipart/form-data (file) or base64 (image)
 * - Uses face recognition pipeline and marks attendance (once per student per day)
 *
 * Response:
 *  - studentId
 *  - name
 *  - subject
 *  - timestamp
 *  - status: success | not recognized
 */
router.post('/scan', upload.single('file'), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const subject = (req.body?.subject || 'Biometric Scan').toString().trim() || 'Biometric Scan';
    // Collect one or more frames.
    const frames = [];
    if (req.file?.buffer) {
      frames.push(req.file.buffer);
    }
    if (Array.isArray(req.body?.images)) {
      for (const item of req.body.images) {
        if (!item) continue;
        const raw = String(item);
        const b64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;
        try {
          frames.push(Buffer.from(b64, 'base64'));
        } catch {
          // ignore bad frame
        }
      }
    } else if (req.body?.image) {
      const raw = req.body.image.toString();
      const b64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;
      frames.push(Buffer.from(b64, 'base64'));
    }
    if (frames.length === 0) {
      return res.status(400).json({ error: 'image required (file, image base64, or images[] base64)' });
    }
    const result = await recognizeWithPython(frames);
    const nowIso = new Date().toISOString();
    if (result.status !== 'success' || !result.student_id) {
      const msg = String(result?.message || '').toLowerCase();
      const status = msg.includes('no faces detected') || msg.includes('no face') ? 'no_face' : 'not recognized';
      return res.json({
        studentId: null,
        name: null,
        subject,
        timestamp: nowIso,
        status
      });
    }
    const studentId = result.student_id;
    const student = await db.collection('students').findOne({ _id: studentId });
    const name = student?.name || studentId;
    // Check for existing attendance event today
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const existing = await db.collection('attendance_events').findOne({
      student_id: studentId,
      ts: { $gte: today, $lt: tomorrow },
      type: { $in: ['present','checkin'] }
    });
    if (existing) {
      return res.json({
        studentId,
        name,
        subject,
        timestamp: existing.ts,
        status: 'already_marked',
        message: 'Already marked present today',
        avatarUrl: student?.avatar_url || null,
      });
    }
    // Insert new attendance event
    await db.collection('attendance_events').insertOne({
      student_id: studentId,
      entity_id: studentId,
      entity_type: 'student',
      type: 'present',
      label: 'Biometric scan',
      subject,
      confidence_score: Number(result.confidence || 0),
      ts: new Date()
    });
    broadcastPresence({
      student_id: studentId,
      name: name,
      class: student?.class || '',
      status: 'Present',
      timestamp: nowIso,
      confidence: Number(result.confidence || 0),
      avatarUrl: student?.avatar_url || null
    });
    return res.json({
      studentId,
      name,
      subject,
      timestamp: nowIso,
      status: 'success'
    });
  } catch (error) {
    console.error('[ERROR] Attendance scan:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

/**
 * GET /api/attendance/stats - Get dashboard statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [{ total_students }] = await dbAll('SELECT COUNT(*) AS total_students FROM students');

    const [{ present_today }] = await dbAll(`
      SELECT COUNT(DISTINCT student_id) AS present_today
      FROM attendance_events
      WHERE student_id IS NOT NULL
        AND DATE(ts) = CURDATE()
        AND type IN ('checkin', 'present')
    `);

    const [{ suspicious_count }] = await dbAll(`
      SELECT COUNT(*) AS suspicious_count
      FROM attendance_events
      WHERE DATE(ts) = CURDATE()
        AND type = 'suspicious'
    `);

    const total = Number(total_students || 0);
    const present = Number(present_today || 0);
    const absent = Math.max(total - present, 0);
    const attendance_rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;

    // No explicit timetable in DB; keep as a proxy metric for now.
    const avg_punctuality = attendance_rate;

    res.json({
      total_students: total,
      present_today: present,
      absent_today: absent,
      attendance_rate,
      avg_punctuality,
      suspicious_count: Number(suspicious_count || 0),
    });
  } catch (error) {
    console.error('[ERROR] Attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/attendance/summary?days=7 - Attendance trend (distinct present per day)
 */
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 60);
    const rows = await dbAll(
      `
        SELECT DATE(ts) AS date,
               COUNT(DISTINCT student_id) AS count
        FROM attendance_events
        WHERE student_id IS NOT NULL
          AND ts >= DATE_SUB(NOW(), INTERVAL ? DAY)
          AND type IN ('checkin','present')
        GROUP BY DATE(ts)
        ORDER BY DATE(ts) ASC
      `,
      [days]
    );

    res.json(
      (rows || []).map((r) => ({
        date: r.date,
        count: Number(r.count || 0),
      }))
    );
  } catch (error) {
    console.error('[ERROR] Attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

/**
 * POST /api/attendance/mark - Manually mark attendance
 * Teachers can only mark attendance for students in their assigned classes
 */
router.post('/mark', requireAuth, requireRole('hod', 'teacher'), async (req, res) => {
  try {
    const { student_id, status } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ error: 'student_id required' });
    }
    
    // For teachers: verify student is in one of their assigned classes
    if (req.user.role === 'teacher') {
      const student = await dbGet('SELECT class FROM students WHERE id = ?', [student_id]);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const teacherClasses = (req.user.assigned_classes || '').split(',').map(c => c.trim()).filter(Boolean);
      if (!teacherClasses.includes(student.class)) {
        return res.status(403).json({ error: 'You can only mark attendance for students in your assigned classes' });
      }
    }
    
    const normalized = (status || 'present').toString().trim().toLowerCase();
    const eventType = normalized === 'suspicious' ? 'suspicious' : normalized === 'absent' ? 'absent' : 'present';
    const label = `Marked: ${normalized}`;

    // Keep one definitive record per student per day so the UI stays present all day.
    const existing = await dbGet(
      `SELECT id FROM attendance_events WHERE student_id = ? AND DATE(ts) = CURDATE() ORDER BY ts DESC LIMIT 1`,
      [student_id]
    );

    if (existing?.id) {
      await dbRun(
        'UPDATE attendance_events SET type = ?, label = ?, ts = NOW() WHERE id = ?',
        [eventType, label, existing.id]
      );
    } else {
      await dbRun(
        'INSERT INTO attendance_events (student_id, entity_id, entity_type, type, label) VALUES (?, ?, ?, ?, ?)',
        [student_id, student_id, 'student', eventType, label]
      );
    }
    
    if (normalized === 'suspicious') {
      await dbRun(
        'UPDATE trust_scores SET score = GREATEST(score - 5, 0), updated_at = NOW() WHERE student_id = ?',
        [student_id]
      );
    } else if (normalized === 'absent') {
      await dbRun(
        'UPDATE trust_scores SET streak = 0, updated_at = NOW() WHERE student_id = ?',
        [student_id]
      );
    } else {
      await dbRun(
        'UPDATE trust_scores SET score = LEAST(score + 1, 100), streak = streak + 1, punctuality = LEAST(punctuality + 1, 100), updated_at = NOW() WHERE student_id = ?',
        [student_id]
      );
    }
    
    // Broadcast presence
    const student = await dbGet('SELECT id, name, class FROM students WHERE id = ?', [student_id]);
    const avatarUrl = await getAvatarUrlForStudent(student_id);
    broadcastPresence({
      student_id,
      name: student?.name || student_id,
      class: student?.class || '',
      status: normalized,
      timestamp: new Date().toISOString(),
      avatarUrl
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Mark attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

/**
 * GET /api/attendance - Get attendance records for a date
 */
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const class_name = req.query.class || req.query.class_id || req.query.class_name;
    
    // Normalize date (default to today)
    let qdate = date;
    if (!qdate) {
      qdate = new Date().toISOString().split('T')[0];
    } else {
      // Validate date format
      try {
        new Date(qdate);
      } catch {
        qdate = new Date().toISOString().split('T')[0];
      }
    }
    
    // Get students filtered by class if requested
    let students;
    if (class_name && class_name.toLowerCase() !== 'all') {
      // Support both full class codes (e.g., "CSE-A") and legacy single-letter sections (e.g., "A").
      const rawClass = String(class_name);
      let section = null;
      if (rawClass.includes('-')) {
        const last = rawClass.split('-').pop();
        if (last && last.length <= 2) {
          section = last;
        }
      }

      if (section) {
        students = await dbAll(
          'SELECT id, name, avatar_url, class FROM students WHERE class = ? OR class = ?',
          [rawClass, section]
        );
      } else {
        students = await dbAll(
          'SELECT id, name, avatar_url, class FROM students WHERE class = ?',
          [rawClass]
        );
      }
    } else {
      students = await dbAll('SELECT id, name, avatar_url, class FROM students');
    }
    
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = {
        id: s.id,
        name: s.name,
        avatarUrl: s.avatar_url || '/avatars/default.jpg',
        class: s.class
      };
    });
    
    const studentIds = Object.keys(studentMap);
    const records = [];
    
    if (studentIds.length > 0) {
      const placeholders = studentIds.map(() => '?').join(',');
      // Get all records for the date, then pick best status per student in code (handles ties properly)
      const attendance = await dbAll(`
        SELECT ae.student_id, ae.type, ae.ts, ae.label
        FROM attendance_events ae
        WHERE ae.student_id IN (${placeholders})
          AND DATE(ae.ts) = ?
        ORDER BY ae.student_id, ae.ts DESC
      `, [...studentIds, qdate]);
      
      const attByStudent = {};
      attendance.forEach(a => {
        const sid = a.student_id;
        if (!attByStudent[sid]) {
          attByStudent[sid] = [];
        }
        attByStudent[sid].push({
          type: a.type,
          ts: a.ts,
          label: a.label
        });
      });
      
      for (const [sid, meta] of Object.entries(studentMap)) {
        const records_for_student = attByStudent[sid] || [];
        let status = 'absent';
        let timestamp = null;
        
        if (records_for_student.length > 0) {
          // Prioritize: present > checkin > suspicious > absent
          const hasPresent = records_for_student.find(r => r.type?.toLowerCase() === 'present');
          const hasCheckin = records_for_student.find(r => r.type?.toLowerCase() === 'checkin');
          const hasSuspicious = records_for_student.find(r => r.type?.toLowerCase() === 'suspicious');
          
          if (hasPresent) {
            status = 'present';
            timestamp = hasPresent.ts;
          } else if (hasCheckin) {
            status = 'present';
            timestamp = hasCheckin.ts;
          } else if (hasSuspicious) {
            status = 'suspicious';
            timestamp = hasSuspicious.ts;
          } else {
            // Use the latest record's type
            const latest = records_for_student[0];
            status = latest.type?.toLowerCase() || 'absent';
            timestamp = latest.ts;
          }
        }
        
        records.push({
          student_id: sid,
          name: meta.name,
          class: meta.class,
          status,
          timestamp,
          avatarUrl: meta.avatarUrl
        });
      }
    }
    
    res.json(records);
  } catch (error) {
    console.error('[ERROR] Get attendance:', error);
    res.status(500).json({ error: 'attendance query failed' });
  }
});

/**
 * POST /api/checkin - Face recognition checkin (multi-frame)
 */
router.post('/checkin', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const frames = req.files.map(f => f.buffer);
    console.log(`[INFO] /checkin received ${frames.length} frame(s), processing...`);
    const result = await processFramesConsensus(frames, 2, 0.48);
    console.log(`[DEBUG] /checkin result:`, result);
    
    if (result.status !== 'success') {
      console.warn(`[WARN] /checkin no match: ${result.message}`);
      return res.status(200).json({ 
        success: false, 
        message: result.message || 'No match',
        status: 'no_face'
      });
    }
    
    const student_id = result.student_id;
    const is_suspicious = result.is_suspicious || false;
    const confidence = result.confidence || 0;

    if (!student_id) {
      console.warn(`[WARN] /checkin matched but no student_id in result`);
      return res.status(200).json({
        success: false,
        message: 'Recognition succeeded but returned empty student_id',
        status: 'no_match'
      });
    }

    // Ensure the matched student exists; otherwise DB inserts may fail via FK.
    // If missing, auto-register to prevent 400 errors
    let student = await dbGet('SELECT id, name FROM students WHERE id = ? LIMIT 1', [student_id]);
    if (!student) {
      console.warn(`[WARN] /checkin student not in DB: ${student_id}. Auto-registering...`);
      try {
        await dbRun('INSERT IGNORE INTO students (id, name) VALUES (?, ?)', [student_id, student_id]);
        await dbRun('INSERT IGNORE INTO trust_scores (student_id, score, punctuality, consistency, streak) VALUES (?, 100, 100, 100, 0)', [student_id]);
        student = { id: student_id, name: student_id };
        console.log(`[INFO] Auto-registered student: ${student_id}`);
      } catch (autoRegErr) {
        console.error(`[ERROR] Failed to auto-register student ${student_id}:`, autoRegErr);
        return res.status(200).json({
          success: false,
          message: `Failed to register student: ${student_id}`,
          status: 'error'
        });
      }
    }

    try {
      if (is_suspicious) {
        await dbRun(
          'INSERT INTO attendance_events (student_id, entity_id, entity_type, type, label) VALUES (?, ?, ?, ?, ?)',
          [student_id, student_id, 'student', 'suspicious', 'Suspicious checkin']
        );
        await dbRun(
          'UPDATE trust_scores SET score = GREATEST(score - 8, 0), updated_at = NOW() WHERE student_id = ?',
          [student_id]
        );
      } else {
        // If already marked present/checkin today, acknowledge without duplicating.
        const existing = await dbGet(
          `SELECT id, ts FROM attendance_events WHERE student_id = ? AND DATE(ts) = CURDATE() AND type IN ('present','checkin') ORDER BY ts DESC LIMIT 1`,
          [student_id]
        );

        if (existing?.id) {
          const avatarUrl = await getAvatarUrlForStudent(student_id);
          const studentName = student?.name || student_id;
          
          // Broadcast the already marked event
          broadcastPresence({
            student_id,
            name: studentName,
            class: student?.class || '',
            status: 'Already Marked',
            timestamp: new Date().toISOString(),
            confidence,
            avatarUrl,
            alreadyMarked: true
          });
          
          return res.json({
            success: true,
            student_id,
            student_name: studentName,
            avatarUrl,
            status: 'Already Marked',
            confidence,
            message: `${studentName} already marked as present`,
            timestamp: existing.ts,
            alreadyMarked: true
          });
        }

        await dbRun(
          'INSERT INTO attendance_events (student_id, entity_id, entity_type, type, label) VALUES (?, ?, ?, ?, ?)',
          [student_id, student_id, 'student', 'present', 'Auto-marked present via face scan']
        );

        await dbRun(
          'UPDATE trust_scores SET score = LEAST(score + 1, 100), streak = streak + 1, punctuality = LEAST(punctuality + 1, 100), updated_at = NOW() WHERE student_id = ?',
          [student_id]
        );
      }
    } catch (dbError) {
      console.error('[ERROR] Database error during checkin:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error during checkin',
        detail: dbError?.message || String(dbError),
      });
    }
    
    const avatarUrl = await getAvatarUrlForStudent(student_id);
    const statusLabel = is_suspicious ? 'Suspicious' : 'Present';
    const nowIso = new Date().toISOString();
    const studentName = student?.name || student_id;
    
    try {
      broadcastPresence({
        student_id,
        name: studentName,
        class: student?.class || '',
        status: statusLabel,
        timestamp: nowIso,
        confidence,
        avatarUrl
      });
    } catch (wsError) {
      console.warn('[WARN] broadcastPresence failed:', wsError);
    }
    
    res.json({
      success: true,
      student_id,
      student_name: studentName,
      avatarUrl,
      status: statusLabel,
      confidence,
      message: `${studentName} marked as ${statusLabel.toLowerCase()}`,
      timestamp: nowIso,
    });
  } catch (error) {
    console.error('[ERROR] Checkin:', error);
    res.status(500).json({
      success: false,
      message: 'Checkin failed',
      detail: error?.message || String(error)
    });
  }
});

/**
 * POST /api/simulate-checkin - Simulate checkin (demo)
 */
router.post('/simulate-checkin', async (req, res) => {
  try {
    const { student_id, status } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ error: 'student_id required' });
    }
    
    const student = await dbGet('SELECT name FROM students WHERE id = ?', [student_id]);
    if (!student) {
      return res.status(404).json({ error: 'student not found' });
    }
    
    const eventType = status?.toLowerCase() === 'suspicious' ? 'suspicious' : 'checkin';
    await dbRun(
      'INSERT INTO attendance_events (student_id, entity_id, entity_type, type, label) VALUES (?, ?, ?, ?, ?)',
      [student_id, student_id, 'student', eventType, `Simulated ${status || 'Present'}`]
    );
    
    if (status?.toLowerCase() === 'suspicious') {
      await dbRun(
        'UPDATE trust_scores SET score = GREATEST(score - 5, 0) WHERE student_id = ?',
        [student_id]
      );
    } else {
      await dbRun(
        'UPDATE trust_scores SET score = LEAST(score + 2, 100), streak = streak + 1 WHERE student_id = ?',
        [student_id]
      );
    }
    
    const avatarUrl = await getAvatarUrlForStudent(student_id);
    broadcastPresence({
      student_id,
      status: status || 'Present',
      timestamp: new Date().toISOString(),
      avatarUrl
    });
    
    res.json({
      success: true,
      student_id,
      student_name: student.name,
      status: status || 'Present'
    });
  } catch (error) {
    console.error('[ERROR] Simulate checkin:', error);
    res.status(500).json({ error: 'Simulate checkin failed' });
  }
});

/**
 * GET /api/timeline/:student_id - Get student timeline
 */
router.get('/timeline/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const events = await dbAll(
      'SELECT id, type, ts, label, subject, room, note FROM attendance_events WHERE student_id = ? ORDER BY ts DESC LIMIT 50',
      [student_id]
    );
    
    const timeline = events.map(e => ({
      id: String(e.id),
      studentId: student_id,
      type: e.type,
      ts: e.ts,
      label: e.label,
      meta: {
        subject: e.subject,
        room: e.room,
        note: e.note
      }
    }));
    
    res.json(timeline);
  } catch (error) {
    console.error('[ERROR] Get timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

export default router;

