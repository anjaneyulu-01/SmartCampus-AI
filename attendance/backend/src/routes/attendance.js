import express from 'express';
import multer from 'multer';
import { dbAll, dbGet, dbRun } from '../database/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { processFramesConsensus } from '../services/faceRecognition.js';
import { getAvatarUrlForStudent } from '../utils/helpers.js';
import { broadcastPresence } from '../websocket/websocket.js';

const router = express.Router();

// Configure multer for multiple file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
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
 */
router.post('/mark', requireAuth, requireRole('hod', 'teacher'), async (req, res) => {
  try {
    const { student_id, status } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ error: 'student_id required' });
    }
    
    const normalized = (status || 'present').toString().trim().toLowerCase();
    const eventType = normalized === 'suspicious' ? 'suspicious' : normalized === 'absent' ? 'absent' : 'checkin';
    const label = `Marked: ${normalized}`;
    
    await dbRun(
      'INSERT INTO attendance_events (student_id, entity_id, entity_type, type, label) VALUES (?, ?, ?, ?, ?)',
      [student_id, student_id, 'student', eventType, label]
    );
    
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
    const avatarUrl = await getAvatarUrlForStudent(student_id);
    broadcastPresence({
      student_id,
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
      students = await dbAll(
        'SELECT id, name, avatar_url, class FROM students WHERE class = ?',
        [class_name]
      );
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
      const attendance = await dbAll(`
        SELECT ae.student_id, ae.type, ae.ts, ae.label
        FROM attendance_events ae
        JOIN (
          SELECT student_id, MAX(ts) as maxts 
          FROM attendance_events
          WHERE DATE(ts) = ?
          GROUP BY student_id
        ) s2 ON ae.student_id = s2.student_id AND ae.ts = s2.maxts
        WHERE ae.student_id IN (${placeholders})
      `, [qdate, ...studentIds]);
      
      const attByStudent = {};
      attendance.forEach(a => {
        attByStudent[a.student_id] = {
          type: a.type,
          ts: a.ts,
          label: a.label
        };
      });
      
      for (const [sid, meta] of Object.entries(studentMap)) {
        const att = attByStudent[sid];
        let status = 'absent';
        let timestamp = null;
        
        if (att) {
          const typ = att.type?.toLowerCase() || '';
          if (typ === 'suspicious') {
            status = 'suspicious';
          } else if (typ === 'present' || typ === 'checkin') {
            status = 'present';
          } else {
            status = typ || 'present';
          }
          timestamp = att.ts;
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
    const result = await processFramesConsensus(frames, 2, 0.48);
    
    if (result.status !== 'success') {
      return res.status(400).json({ 
        success: false, 
        message: result.message || 'No match' 
      });
    }
    
    const student_id = result.student_id;
    const is_suspicious = result.is_suspicious || false;
    const confidence = result.confidence || 0;
    
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
        await dbRun(
          'INSERT INTO attendance_events (student_id, entity_id, entity_type, type, label) VALUES (?, ?, ?, ?, ?)',
          [student_id, student_id, 'student', 'checkin', 'Camera checkin']
        );
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
    }
    
    const avatarUrl = await getAvatarUrlForStudent(student_id);
    const statusLabel = is_suspicious ? 'Suspicious' : 'Present';
    
    broadcastPresence({
      student_id,
      status: statusLabel,
      timestamp: new Date().toISOString(),
      confidence,
      avatarUrl
    });
    
    res.json({
      success: true,
      student_id,
      status: statusLabel,
      confidence
    });
  } catch (error) {
    console.error('[ERROR] Checkin:', error);
    res.status(500).json({ error: 'Checkin failed' });
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

