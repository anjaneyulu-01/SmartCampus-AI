import express from 'express'
import { dbAll, dbGet, dbRun } from '../database/db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/faculty - Get all faculty
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { department_id } = req.query
    let query = `
      SELECT f.*, d.name as department_name 
      FROM faculty f 
      LEFT JOIN departments d ON f.department_id = d.id
    `
    const params = []

    if (department_id) {
      query += ' WHERE f.department_id = ?'
      params.push(department_id)
    }

    query += ' ORDER BY f.name ASC'
    const faculty = await dbAll(query, params)
    res.json(faculty)
  } catch (error) {
    console.error('[ERROR] Get faculty:', error)
    res.status(500).json({ error: 'Failed to fetch faculty' })
  }
})

/**
 * GET /api/faculty/:id - Get faculty details
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const faculty = await dbGet(
      `SELECT f.*, d.name as department_name 
       FROM faculty f 
       LEFT JOIN departments d ON f.department_id = d.id 
       WHERE f.id = ?`,
      [req.params.id]
    )
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' })
    }
    res.json(faculty)
  } catch (error) {
    console.error('[ERROR] Get faculty:', error)
    res.status(500).json({ error: 'Failed to fetch faculty' })
  }
})

/**
 * POST /api/faculty - Create faculty (Admin/HOD only)
 */
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req, res) => {
  try {
    const { id, name, email, phone, department_id, designation, specialization, office_room } = req.body

    if (!id || !name || !department_id) {
      return res.status(400).json({ error: 'ID, name, and department required' })
    }

    await dbRun(
      'INSERT INTO faculty (id, name, email, phone, department_id, designation, specialization, office_room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, department_id, designation, specialization, office_room]
    )

    res.status(201).json({ success: true, message: 'Faculty created' })
  } catch (error) {
    console.error('[ERROR] Create faculty:', error)
    res.status(500).json({ error: 'Failed to create faculty' })
  }
})

/**
 * PUT /api/faculty/:id - Update faculty
 */
router.put('/:id', requireAuth, requireRole('admin', 'hod', 'faculty'), async (req, res) => {
  try {
    const { name, email, phone, designation, specialization, office_room } = req.body

    await dbRun(
      'UPDATE faculty SET name = ?, email = ?, phone = ?, designation = ?, specialization = ?, office_room = ? WHERE id = ?',
      [name, email, phone, designation, specialization, office_room, req.params.id]
    )

    res.json({ success: true, message: 'Faculty updated' })
  } catch (error) {
    console.error('[ERROR] Update faculty:', error)
    res.status(500).json({ error: 'Failed to update faculty' })
  }
})

/**
 * GET /api/faculty/:id/attendance - Get faculty attendance
 */
router.get('/:id/attendance', requireAuth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query
    let query = 'SELECT * FROM attendance_events WHERE entity_id = ? AND entity_type = "faculty"'
    const params = [req.params.id]

    if (start_date && end_date) {
      query += ' AND DATE(ts) BETWEEN ? AND ?'
      params.push(start_date, end_date)
    }

    query += ' ORDER BY ts DESC LIMIT 100'
    const attendance = await dbAll(query, params)
    res.json(attendance)
  } catch (error) {
    console.error('[ERROR] Get faculty attendance:', error)
    res.status(500).json({ error: 'Failed to fetch attendance' })
  }
})

export default router
