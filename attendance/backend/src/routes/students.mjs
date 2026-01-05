// POST /api/students - Add a new student with avatar/face upload
router.post('/', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'face', maxCount: 1 },
]), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { student_id, name, class_name, mobile, seat_row, seat_col } = req.body;
    if (!student_id || !name) {
      return res.status(400).json({ error: 'student_id and name are required' });
    }
    // Check for duplicate
    const exists = await db.collection('students').findOne({ student_id });
    if (exists) {
      return res.status(409).json({ error: 'Student already exists' });
    }
    let avatarUrl = '';
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      avatarUrl = `/avatars/${req.files.avatar[0].filename}`;
    }
    const student = {
      student_id,
      name,
      class: class_name || '',
      mobile: mobile || '',
      seat_row: seat_row || '',
      seat_col: seat_col || '',
      avatar_url: avatarUrl,
      status: 'absent',
    };
    await db.collection('students').insertOne(student);
    res.json({ success: true, student });
  } catch (error) {
    console.error('[ERROR] Add student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// DELETE /api/students/:id - Delete a student and their avatar
router.delete('/:id', async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const student = await db.collection('students').findOne({ student_id: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Remove avatar file if exists
    if (student.avatar_url) {
      const avatarPath = path.join(AVATARS_DIR, path.basename(student.avatar_url));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    await db.collection('students').deleteOne({ student_id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Delete student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});


import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadKnownFaces, reloadPythonFaces } from '../services/faceRecognition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AVATARS_DIR = path.join(path.dirname(__dirname), '..', 'avatars');
const KNOWN_FACES_DIR = path.join(path.dirname(__dirname), '..', 'known_faces');
const DATASET_DIR = path.join(path.dirname(__dirname), '..', 'dataset');

// Ensure directories exist
[AVATARS_DIR, KNOWN_FACES_DIR, DATASET_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const router = express.Router();

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const students = await db.collection('students').find({}).toArray();
    // Patch: always return avatarUrl as a full path and status as 'present' or 'absent'
    const patched = students.map(s => {
      let avatarUrl = s.avatar_url || s.avatarUrl || '';
      if (!avatarUrl || avatarUrl === 'null' || avatarUrl === 'undefined') {
        avatarUrl = '/avatars/default.jpg';
      } else if (!avatarUrl.startsWith('/avatars/')) {
        avatarUrl = `/avatars/${avatarUrl}`;
      }
      // Always set status to 'present' or 'absent' (never undefined/unknown)
      let status = (s.status || '').toLowerCase();
      if (status !== 'present') status = 'absent';
      return { ...s, avatarUrl, status };
    });
    res.json(patched);
  } catch (error) {
    console.error('[ERROR] Get students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

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
async function calculateAttendancePercentage(studentId) {
  await connectMongo();
  const db = getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const presentDays = await db.collection('attendance_events').distinct('ts', {
    student_id: studentId,
    type: 'checkin',
    ts: { $gte: thirtyDaysAgo }
  });
  return Math.min(Math.floor((presentDays.length / 30) * 100), 100);
}

export default router;
