import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { broadcastEvent } from '../websocket/websocket.js';

const router = express.Router();

/**
 * GET /api/teacher/stats - Get teacher dashboard stats
 */
router.get('/stats', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    // Get total classes handled by teacher
    const total_classes = await db.collection('students').distinct('class');
    // Get total students
    const total_students = await db.collection('students').countDocuments();
    // Get present today
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const present_today = await db.collection('attendance_events').distinct('student_id', {
      ts: { $gte: today, $lt: tomorrow },
      type: { $in: ['present', 'checkin'] }
    });
    const attendance_rate = total_students > 0
      ? Math.round((present_today.length / total_students) * 100)
      : 0;
    res.json({
      total_classes: total_classes.length,
      total_students,
      present_today: present_today.length,
      attendance_rate,
    });
  } catch (error) {
    console.error('[ERROR] Teacher stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
