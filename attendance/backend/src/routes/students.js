import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { dbAll, dbGet, dbRun } from '../database/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadKnownFaces, reloadPythonFaces } from '../services/faceRecognition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AVATARS_DIR = path.join(path.dirname(__dirname), '..', 'avatars');
const KNOWN_FACES_DIR = path.join(path.dirname(__dirname), '..', 'known_faces');

// Ensure directories exist
[AVATARS_DIR, KNOWN_FACES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fieldName = file.fieldname;
    if (fieldName === 'avatar') {
      cb(null, AVATARS_DIR);
    } else if (fieldName === 'face') {
      cb(null, KNOWN_FACES_DIR);
    } else {
      cb(null, AVATARS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const studentId = req.body.student_id || 'unknown';
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${studentId}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper function to calculate attendance percentage
function calculateAttendancePercentage(studentId) {
  return new Promise((resolve) => {
    dbGet(`
      SELECT COUNT(DISTINCT DATE(ts)) as present_days
      FROM attendance_events
      WHERE student_id = ?
      AND type = 'checkin'
      AND ts >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [studentId])
      .then(row => {
        const presentDays = row?.present_days || 0;
        resolve(Math.min(Math.floor((presentDays / 30) * 100), 100));
      })
      .catch(() => resolve(85));
  });
}

// Helper function to get avatar URL
async function getAvatarUrlForStudent(studentId) {
  try {
    const student = await dbGet('SELECT avatar_url FROM students WHERE id = ?', [studentId]);
    return student?.avatar_url || '/avatars/default.jpg';
  } catch (error) {
    return '/avatars/default.jpg';
  }
}

/**
 * GET /api/students - Get all students
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const classFilter = req.query.class || req.query.class_id || req.query.class_name;
    const params = [];

    let query = `
      SELECT s.id, s.name, s.avatar_url, s.seat_row, s.seat_col,
             ts.score as trust_score,
             CASE
               WHEN ae.ts IS NOT NULL AND ae.ts > DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN
                 CASE WHEN ae.type = 'suspicious' THEN 'suspicious' ELSE 'present' END
               WHEN ae.ts IS NOT NULL AND ae.ts > DATE_SUB(NOW(), INTERVAL 30 MINUTE) THEN 'late'
               ELSE 'absent'
             END as status,
             ae.ts as last_checkin,
             s.mobile, s.class
      FROM students s
      LEFT JOIN trust_scores ts ON s.id = ts.student_id
      LEFT JOIN (
        SELECT student_id, MAX(ts) as ts,
               SUBSTRING_INDEX(GROUP_CONCAT(type ORDER BY ts DESC), ',', 1) as type
        FROM attendance_events
        WHERE DATE(ts) = CURDATE()
        GROUP BY student_id
      ) ae ON s.id = ae.student_id
    `;

    if (classFilter && String(classFilter).toLowerCase() !== 'all') {
      query += ' WHERE s.class = ?';
      params.push(classFilter);
    }

    const students = await dbAll(query, params);
    
    const studentsWithAttendance = await Promise.all(
      students.map(async (s) => ({
        id: s.id,
        name: s.name,
        avatarUrl: s.avatar_url || '/avatars/default.jpg',
        seat: (s.seat_row && s.seat_col) ? { row: s.seat_row, col: s.seat_col } : null,
        trustScore: s.trust_score || 100,
        status: (s.status || 'absent').toLowerCase(),
        smartTag: s.status || 'Absent',
        attendancePct: await calculateAttendancePercentage(s.id),
        liveSeenAt: s.last_checkin,
        mobile: s.mobile,
        class: s.class
      }))
    );
    
    res.json(studentsWithAttendance);
  } catch (error) {
    console.error('[ERROR] Get students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * GET /api/students/:student_id - Get student by ID
 */
router.get('/:student_id', requireAuth, async (req, res) => {
  try {
    const { student_id } = req.params;
    const student = await dbGet(`
      SELECT s.id, s.name, s.avatar_url, s.seat_row, s.seat_col, ts.score as trust_score, s.class
      FROM students s 
      LEFT JOIN trust_scores ts ON s.id = ts.student_id 
      WHERE s.id = ?
    `, [student_id]);
    
    if (!student) {
      return res.status(404).json({ error: 'student not found' });
    }
    
    res.json({
      id: student.id,
      name: student.name,
      avatarUrl: student.avatar_url || '/avatars/default.jpg',
      seat: (student.seat_row && student.seat_col) ? { 
        row: student.seat_row, 
        col: student.seat_col 
      } : null,
      trustScore: student.trust_score || 100,
      class: student.class
    });
  } catch (error) {
    console.error('[ERROR] Get student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

/**
 * POST /api/students - Register new student (HOD only)
 */
router.post('/', requireAuth, requireRole('hod'), upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'face', maxCount: 1 }
]), async (req, res) => {
  try {
    const { student_id, name, class_name, seat_row, seat_col, mobile } = req.body;
    
    if (!student_id || !name) {
      return res.status(400).json({ error: 'student_id and name required' });
    }
    
    let avatarUrl = null;
    const avatarFile = req.files?.avatar?.[0];
    const faceFile = req.files?.face?.[0];
    
    if (avatarFile) {
      avatarUrl = `/avatars/${student_id}.jpg`;
    } else {
      // Check if avatar already exists
      const existingAvatar = path.join(AVATARS_DIR, `${student_id}.jpg`);
      if (fs.existsSync(existingAvatar)) {
        avatarUrl = `/avatars/${student_id}.jpg`;
      }
    }
    
    // Insert/update student
    await dbRun(`
      INSERT INTO students (id, name, avatar_url, seat_row, seat_col, mobile, class)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        avatar_url = VALUES(avatar_url),
        seat_row = VALUES(seat_row),
        seat_col = VALUES(seat_col),
        mobile = VALUES(mobile),
        class = VALUES(class)
    `, [student_id, name, avatarUrl, seat_row || null, seat_col || null, mobile || null, class_name || null]);
    
    // Insert/update trust score
    await dbRun(`
      INSERT INTO trust_scores (student_id, score, punctuality, consistency, streak)
      VALUES (?, 100, 100, 100, 0)
      ON DUPLICATE KEY UPDATE
        student_id = VALUES(student_id)
    `, [student_id]);
    
    // Reload known faces if face image was uploaded
    if (faceFile) {
      await loadKnownFaces();
      // Keep the Python recognition DB in sync with face uploads.
      // This makes the standalone /scan device recognize newly enrolled faces without restarting Python.
      await reloadPythonFaces();
    }
    
    res.json({ 
      success: true, 
      student_id, 
      avatar_url: avatarUrl 
    });
  } catch (error) {
    console.error('[ERROR] Register student:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

/**
 * DELETE /api/students/:student_id - Delete student (HOD/Admin)
 */
router.delete('/:student_id', requireAuth, requireRole('hod', 'admin'), async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Delete from database
    await dbRun('DELETE FROM students WHERE id = ?', [student_id]);
    await dbRun('DELETE FROM trust_scores WHERE student_id = ?', [student_id]);
    await dbRun('DELETE FROM attendance_events WHERE student_id = ?', [student_id]);
    
    // Delete files
    const facePath = path.join(KNOWN_FACES_DIR, `${student_id}.jpg`);
    const avatarPath = path.join(AVATARS_DIR, `${student_id}.jpg`);
    
    if (fs.existsSync(facePath)) fs.unlinkSync(facePath);
    if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    
    // Reload known faces
    await loadKnownFaces();
    
    res.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Delete student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;

