import express from 'express';
import { dbAll, dbGet, dbRun } from '../database/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/announcements
 * Optional query: department_id
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const deptIdRaw = req.query.department_id;
    const deptId = deptIdRaw ? Number(deptIdRaw) : null;

    let query = `
      SELECT a.id, a.title, a.message, a.department_id, a.created_by, a.created_at,
             d.name AS department_name, d.code AS department_code
      FROM announcements a
      LEFT JOIN departments d ON a.department_id = d.id
    `;
    const params = [];

    if (deptId && Number.isFinite(deptId)) {
      query += ' WHERE a.department_id = ?';
      params.push(deptId);
    }

    query += ' ORDER BY a.created_at DESC LIMIT 200';

    const rows = await dbAll(query, params);
    res.json(rows || []);
  } catch (error) {
    console.error('[ERROR] Get announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

/**
 * POST /api/announcements
 * Body: title, message, (optional) department_id
 */
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req, res) => {
  try {
    const { title, message, department_id } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'title and message required' });
    }

    const deptId = department_id !== undefined && department_id !== null && department_id !== ''
      ? Number(department_id)
      : null;

    await dbRun(
      'INSERT INTO announcements (title, message, department_id, created_by) VALUES (?, ?, ?, ?)',
      [title, message, Number.isFinite(deptId) ? deptId : null, req.user.username]
    );

    const created = await dbGet('SELECT id, title, message, department_id, created_by, created_at FROM announcements ORDER BY id DESC LIMIT 1');
    res.status(201).json(created);
  } catch (error) {
    console.error('[ERROR] Create announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

export default router;
