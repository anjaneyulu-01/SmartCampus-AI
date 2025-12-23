import express from 'express';
import { dbGet } from '../database/db.js';
import { verifyPassword } from '../utils/password.js';
import { createToken } from '../utils/token.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/login
 * Supports all roles: admin, hod, teacher, faculty, worker, student
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'username & password required' });
    }
    
    const user = await dbGet(
      `SELECT u.username, u.password_hash, u.salt, u.role, u.display_name,
              u.student_id, u.assigned_classes, u.department_id,
              d.name as department_name, u.is_active
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = ?`,
      [username]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!verifyPassword(password, user.salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = createToken(username);
    
    if (user.is_active === false) {
      return res.status(403).json({ error: 'Account inactive' });
    }
    
    res.json({
      token,
      role: user.role,
      display_name: user.display_name,
      student_id: user.student_id,
      assigned_classes: user.assigned_classes,
      department_id: user.department_id || null,
      department_name: user.department_name || null,
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
    const userFull = await dbGet(
      `SELECT u.username, u.role, u.display_name, u.student_id, u.assigned_classes,
              u.department_id, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = ?`,
      [req.user.username]
    );
    
    res.json({
      username: req.user.username,
      role: req.user.role,
      display_name: req.user.display_name,
      student_id: req.user.student_id,
      assigned_classes: req.user.assigned_classes,
      department_id: userFull?.department_id || null,
      department_name: userFull?.department_name || null,
      entity_type: null,
      entity_id: null
    });
  } catch (error) {
    console.error('[ERROR] Get profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;

