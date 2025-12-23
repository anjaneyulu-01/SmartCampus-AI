import express from 'express'
import { dbAll, dbGet, dbRun } from '../database/db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/departments - Get all departments
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const departments = await dbAll(
      `SELECT d.*, 
              (SELECT COUNT(*) FROM classes c WHERE c.department_id = d.id) AS total_sections,
              (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.id) AS total_faculty,
              (SELECT COUNT(*) FROM workers w WHERE w.department_id = d.id) AS total_workers,
              (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) AS total_students
       FROM departments d
       ORDER BY d.name ASC`
    )
    res.json(departments)
  } catch (error) {
    console.error('[ERROR] Get departments:', error)
    res.status(500).json({ error: 'Failed to fetch departments' })
  }
})

/**
 * GET /api/departments/:id - Get department details
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const department = await dbGet(
      'SELECT * FROM departments WHERE id = ?',
      [req.params.id]
    )
    if (!department) {
      return res.status(404).json({ error: 'Department not found' })
    }
    res.json(department)
  } catch (error) {
    console.error('[ERROR] Get department:', error)
    res.status(500).json({ error: 'Failed to fetch department' })
  }
})

/**
 * POST /api/departments - Create department (Admin only)
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, code, hod_username, building, contact_email } = req.body
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code required' })
    }

    await dbRun(
      'INSERT INTO departments (name, code, hod_username, building, contact_email) VALUES (?, ?, ?, ?, ?)',
      [name, code, hod_username, building, contact_email]
    )

    res.status(201).json({ success: true, message: 'Department created' })
  } catch (error) {
    console.error('[ERROR] Create department:', error)
    res.status(500).json({ error: 'Failed to create department' })
  }
})

/**
 * PUT /api/departments/:id - Update department (Admin/HOD only)
 */
router.put('/:id', requireAuth, requireRole('admin', 'hod'), async (req, res) => {
  try {
    const { name, hod_username, building, contact_email } = req.body

    await dbRun(
      'UPDATE departments SET name = ?, hod_username = ?, building = ?, contact_email = ? WHERE id = ?',
      [name, hod_username, building, contact_email, req.params.id]
    )

    res.json({ success: true, message: 'Department updated' })
  } catch (error) {
    console.error('[ERROR] Update department:', error)
    res.status(500).json({ error: 'Failed to update department' })
  }
})

/**
 * GET /api/departments/:id/stats - Get department statistics
 */
router.get('/:id/stats', requireAuth, async (req, res) => {
  try {
    const stats = await dbGet(
      `SELECT 
        (SELECT COUNT(*) FROM students WHERE department_id = ?) as total_students,
        (SELECT COUNT(*) FROM faculty WHERE department_id = ?) as total_faculty,
        (SELECT COUNT(*) FROM workers WHERE department_id = ?) as total_workers,
        (SELECT COUNT(*) FROM classes WHERE department_id = ?) as total_classes,
        (SELECT COUNT(*) FROM classes WHERE department_id = ?) as total_sections`,
      [req.params.id, req.params.id, req.params.id, req.params.id, req.params.id]
    )
    res.json(stats)
  } catch (error) {
    console.error('[ERROR] Get department stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

/**
 * GET /api/departments/:id/classes - Get sections for a department
 */
router.get('/:id/classes', requireAuth, async (req, res) => {
  try {
    const deptId = Number(req.params.id)
    if (!Number.isFinite(deptId)) {
      return res.status(400).json({ error: 'Invalid department id' })
    }

    const rows = await dbAll(
      `SELECT c.id, c.name, c.code, c.academic_year, c.semester, c.total_students, c.class_mentor,
              (SELECT COUNT(*) FROM students s WHERE s.class = c.code) AS enrolled_students
       FROM classes c
       WHERE c.department_id = ?
       ORDER BY c.name ASC`,
      [deptId]
    )
    res.json(rows || [])
  } catch (error) {
    console.error('[ERROR] Get department classes:', error)
    res.status(500).json({ error: 'Failed to fetch classes' })
  }
})

export default router
