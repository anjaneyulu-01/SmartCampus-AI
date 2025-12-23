import express from 'express'
import { dbAll, dbGet, dbRun } from '../database/db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/workers - Get all workers/staff
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { department_id, worker_type } = req.query
    let query = `
      SELECT w.*, d.name as department_name 
      FROM workers w 
      LEFT JOIN departments d ON w.department_id = d.id
    `
    const params = []
    const conditions = []

    if (department_id) {
      conditions.push('w.department_id = ?')
      params.push(department_id)
    }

    if (worker_type) {
      conditions.push('w.worker_type = ?')
      params.push(worker_type)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY w.name ASC'
    const workers = await dbAll(query, params)
    res.json(workers)
  } catch (error) {
    console.error('[ERROR] Get workers:', error)
    res.status(500).json({ error: 'Failed to fetch workers' })
  }
})

/**
 * GET /api/workers/:id - Get worker details
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const worker = await dbGet(
      `SELECT w.*, d.name as department_name 
       FROM workers w 
       LEFT JOIN departments d ON w.department_id = d.id 
       WHERE w.id = ?`,
      [req.params.id]
    )
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' })
    }
    res.json(worker)
  } catch (error) {
    console.error('[ERROR] Get worker:', error)
    res.status(500).json({ error: 'Failed to fetch worker' })
  }
})

/**
 * POST /api/workers - Create worker (Admin/HOD only)
 */
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req, res) => {
  try {
    const { id, name, email, phone, department_id, designation, worker_type, office_room } = req.body

    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name required' })
    }

    await dbRun(
      'INSERT INTO workers (id, name, email, phone, department_id, designation, worker_type, office_room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, department_id, designation, worker_type, office_room]
    )

    res.status(201).json({ success: true, message: 'Worker created' })
  } catch (error) {
    console.error('[ERROR] Create worker:', error)
    res.status(500).json({ error: 'Failed to create worker' })
  }
})

/**
 * PUT /api/workers/:id - Update worker
 */
router.put('/:id', requireAuth, requireRole('admin', 'hod', 'worker'), async (req, res) => {
  try {
    const { name, email, phone, designation, worker_type, office_room } = req.body

    await dbRun(
      'UPDATE workers SET name = ?, email = ?, phone = ?, designation = ?, worker_type = ?, office_room = ? WHERE id = ?',
      [name, email, phone, designation, worker_type, office_room, req.params.id]
    )

    res.json({ success: true, message: 'Worker updated' })
  } catch (error) {
    console.error('[ERROR] Update worker:', error)
    res.status(500).json({ error: 'Failed to update worker' })
  }
})

/**
 * GET /api/workers/:id/attendance - Get worker attendance
 */
router.get('/:id/attendance', requireAuth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query
    let query = 'SELECT * FROM attendance_events WHERE entity_id = ? AND entity_type = "worker"'
    const params = [req.params.id]

    if (start_date && end_date) {
      query += ' AND DATE(ts) BETWEEN ? AND ?'
      params.push(start_date, end_date)
    }

    query += ' ORDER BY ts DESC LIMIT 100'
    const attendance = await dbAll(query, params)
    res.json(attendance)
  } catch (error) {
    console.error('[ERROR] Get worker attendance:', error)
    res.status(500).json({ error: 'Failed to fetch attendance' })
  }
})

export default router
