import express from 'express';
import { dbGet } from '../database/db.js';
import { verifyPassword } from '../utils/password.js';
import { createToken } from '../utils/token.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'username & password required' });
    }
    
    const user = await dbGet(
      'SELECT username, password_hash, salt, role, display_name, student_id, assigned_classes FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!verifyPassword(password, user.salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = createToken(username);
    
    res.json({
      token,
      role: user.role,
      display_name: user.display_name,
      student_id: user.student_id,
      assigned_classes: user.assigned_classes
    });
  } catch (error) {
    console.error('[ERROR] Login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/me
 */
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role,
    display_name: req.user.display_name,
    student_id: req.user.student_id,
    assigned_classes: req.user.assigned_classes
  });
});

export default router;

