import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';
import { verifyPassword } from '../utils/password.js';
import { createToken } from '../utils/token.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/login
 * Supports all roles: admin, hod, teacher, faculty, worker, student
 */
router.post('/login', async (req, res) => {
  console.log('[LOGIN ATTEMPT]', req.body);
  try {
    await connectMongo();
    const db = getDb();
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('[LOGIN FAIL] Missing username or password');
      return res.status(400).json({ error: 'username & password required' });
    }
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      console.log(`[LOGIN FAIL] User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!verifyPassword(password, user.salt, user.password_hash)) {
      console.log(`[LOGIN FAIL] Password mismatch for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = createToken(username);
    if (user.is_active === false) {
      console.log(`[LOGIN FAIL] Account inactive: ${username}`);
      return res.status(403).json({ error: 'Account inactive' });
    }
    let department_name = null;
    if (user.department_id) {
      const dept = await db.collection('departments').findOne({ _id: user.department_id });
      department_name = dept?.name || null;
    }
    console.log(`[LOGIN SUCCESS] ${username}`);
    res.json({
      token,
      role: user.role,
      display_name: user.display_name,
      student_id: user.student_id,
      assigned_classes: user.assigned_classes,
      department_id: user.department_id || null,
      department_name,
      entity_type: null,
      entity_id: null
    });
  } catch (error) {
    console.error('[ERROR] Login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/me
 * Returns current authenticated user info
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const userFull = await db.collection('users').findOne({ username: req.user.username });
    let department_name = null;
    if (userFull?.department_id) {
      const dept = await db.collection('departments').findOne({ _id: userFull.department_id });
      department_name = dept?.name || null;
    }
    res.json({
      username: req.user.username,
      role: req.user.role,
      display_name: req.user.display_name,
      student_id: req.user.student_id,
      assigned_classes: req.user.assigned_classes,
      department_id: userFull?.department_id || null,
      department_name,
      entity_type: null,
      entity_id: null
    });
  } catch (error) {
    console.error('[ERROR] Get profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
