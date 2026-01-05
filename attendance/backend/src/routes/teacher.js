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

/**
 * GET /api/teacher/upcoming-classes - Get upcoming classes for today
 */
router.get('/upcoming-classes', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    // Mock data - you can replace with actual timetable query
    const upcomingClasses = [
      {
        name: 'Data Structures',
        time: '10:00 AM',
        room: 'Room 301',
        students: 45,
        section: 'CSE-A'
      },
      {
        name: 'Database Management',
        time: '2:00 PM',
        room: 'Room 205',
        students: 42,
        section: 'CSE-B'
      }
    ];

    res.json(upcomingClasses);
  } catch (error) {
    console.error('[ERROR] Upcoming classes:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming classes' });
  }
});

/**
 * GET /api/teacher/notifications - Get recent notifications
 */
router.get('/notifications', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const notifications = [
      {
        title: 'Assignment Submission',
        message: '15 students submitted Assignment 3',
        time: '2 hours ago'
      },
      {
        title: 'Low Attendance Alert',
        message: 'CSE-A attendance below 75%',
        time: '5 hours ago'
      }
    ];

    res.json(notifications);
  } catch (error) {
    console.error('[ERROR] Notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/teacher/classes - Get all classes
 */
router.get('/classes', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const classes = await dbAll(`
      SELECT 
        class as id,
        class as name,
        class as section,
        COUNT(*) as students_count
      FROM students
      WHERE class IS NOT NULL AND class != ''
      GROUP BY class
      ORDER BY class
    `);

    res.json(classes);
  } catch (error) {
    console.error('[ERROR] Fetch classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

/**
 * GET /api/teacher/students - Get students (optionally filtered by class)
 */
router.get('/students', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const { class: classFilter } = req.query;
    
    let query = `
      SELECT 
        s.id,
        s.name,
        s.avatar_url,
        s.class,
        COALESCE(
          (SELECT COUNT(DISTINCT DATE(ts)) * 100.0 / 30
           FROM attendance_events 
           WHERE student_id = s.id 
             AND type IN ('present', 'checkin')
             AND ts >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          ), 0
        ) as attendance_percentage
      FROM students s
    `;

    const params = [];
    if (classFilter && classFilter !== 'all') {
      query += ' WHERE s.class = ?';
      params.push(classFilter);
    }

    query += ' ORDER BY s.name';

    const students = await dbAll(query, params);
    
    res.json(students.map(s => ({
      ...s,
      attendance_percentage: Math.round(Number(s.attendance_percentage || 0))
    })));
  } catch (error) {
    console.error('[ERROR] Fetch students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * POST /api/teacher/assignments - Create assignment
 */
router.post('/assignments', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const { title, description, class_id, due_date, total_marks } = req.body;
    const teacherId = req.user.id;

    // Create assignments table if not exists
    await dbRun(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        class_id VARCHAR(50),
        due_date DATETIME,
        total_marks INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await dbRun(
      'INSERT INTO assignments (teacher_id, title, description, class_id, due_date, total_marks) VALUES (?, ?, ?, ?, ?, ?)',
      [teacherId, title, description, class_id, due_date, total_marks]
    );

    res.json({ success: true, assignment_id: result.insertId });
  } catch (error) {
    console.error('[ERROR] Create assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * GET /api/teacher/assignments - Get all assignments
 */
router.get('/assignments', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    // Ensure table exists
    await dbRun(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        class_id VARCHAR(50),
        due_date DATETIME,
        total_marks INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const assignments = await dbAll('SELECT * FROM assignments ORDER BY created_at DESC');
    res.json(assignments);
  } catch (error) {
    console.error('[ERROR] Fetch assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * POST /api/teacher/messages - Send message (teacher -> hod, hod -> teacher)
 */
router.post('/messages', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const sender = req.user.username;
    const { recipient = 'hod', subject = 'No subject', body } = req.body || {};

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message body required' });
    }

    // Teachers can only message hod by default (keeps routing simple)
    if (req.user.role === 'teacher' && recipient !== 'hod') {
      return res.status(400).json({ error: 'Teachers can only message HOD' });
    }

    const result = await dbRun(
      'INSERT INTO messages (sender, recipient, subject, body) VALUES (?, ?, ?, ?)',
      [sender, recipient, subject, body]
    );

    const created = await dbGet('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    try {
      broadcastEvent('message:new', { recipient, message: created });
    } catch (e) {
      console.warn('[WARN] broadcast message failed', e);
    }
    res.status(201).json(created);
  } catch (error) {
    console.error('[ERROR] Send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/teacher/messages/inbox - Messages received by current user
 */
router.get('/messages/inbox', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const rows = await dbAll(
      'SELECT * FROM messages WHERE recipient = ? ORDER BY created_at DESC LIMIT 200',
      [req.user.username]
    );
    res.json(rows || []);
  } catch (error) {
    console.error('[ERROR] Inbox:', error);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

/**
 * GET /api/teacher/messages/sent - Messages sent by current user
 */
router.get('/messages/sent', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const rows = await dbAll(
      'SELECT * FROM messages WHERE sender = ? ORDER BY created_at DESC LIMIT 200',
      [req.user.username]
    );
    res.json(rows || []);
  } catch (error) {
    console.error('[ERROR] Sent:', error);
    res.status(500).json({ error: 'Failed to fetch sent items' });
  }
});

/**
 * PATCH /api/teacher/messages/:id/read - Mark message as read
 */
router.patch('/messages/:id/read', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await dbGet('SELECT recipient FROM messages WHERE id = ?', [id]);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.recipient !== req.user.username) return res.status(403).json({ error: 'Not allowed' });

    await dbRun('UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Mark read:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

/**
 * POST /api/teacher/leaves - Submit leave request (teacher)
 */
router.post('/leaves', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    const teacher_username = req.user.username;
    const { start_date, end_date, reason = '' } = req.body || {};

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date required' });
    }

    const result = await dbRun(
      'INSERT INTO leave_requests (teacher_username, start_date, end_date, reason) VALUES (?, ?, ?, ?)',
      [teacher_username, start_date, end_date, reason]
    );

    const created = await dbGet('SELECT * FROM leave_requests WHERE id = ?', [result.insertId]);
    try {
      broadcastEvent('leave:new', created);
    } catch (e) {
      console.warn('[WARN] broadcast leave failed', e);
    }
    res.status(201).json(created);
  } catch (error) {
    console.error('[ERROR] Create leave:', error);
    res.status(500).json({ error: 'Failed to submit leave' });
  }
});

/**
 * GET /api/teacher/leaves - List leaves (teacher sees own, hod sees all)
 */
router.get('/leaves', requireAuth, requireRole('teacher', 'hod'), async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'teacher') {
      rows = await dbAll(
        'SELECT * FROM leave_requests WHERE teacher_username = ? ORDER BY created_at DESC LIMIT 200',
        [req.user.username]
      );
    } else {
      rows = await dbAll('SELECT * FROM leave_requests ORDER BY created_at DESC LIMIT 200');
    }
    res.json(rows || []);
  } catch (error) {
    console.error('[ERROR] List leaves:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

/**
 * PATCH /api/teacher/leaves/:id - Approve/Reject leave (HOD)
 */
router.patch('/leaves/:id', requireAuth, requireRole('hod'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_note = '' } = req.body || {};
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }

    const existing = await dbGet('SELECT teacher_username FROM leave_requests WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Leave not found' });

    await dbRun(
      'UPDATE leave_requests SET status = ?, approver = ?, resolution_note = ?, updated_at = NOW() WHERE id = ?',
      [status, req.user.username, resolution_note, id]
    );

    const updated = await dbGet('SELECT * FROM leave_requests WHERE id = ?', [id]);
    try {
      broadcastEvent('leave:status', updated);
    } catch (e) {
      console.warn('[WARN] broadcast leave status failed', e);
    }
    res.json(updated);
  } catch (error) {
    console.error('[ERROR] Update leave:', error);
    res.status(500).json({ error: 'Failed to update leave' });
  }
});

export default router;
