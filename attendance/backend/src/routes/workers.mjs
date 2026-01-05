import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/workers - Get all workers/staff
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { department_id, worker_type } = req.query;
    const query = {};
    if (department_id) query.department_id = department_id;
    if (worker_type) query.worker_type = worker_type;
    const workers = await db.collection('workers').find(query).sort({ name: 1 }).toArray();
    // Populate department_name
    for (const w of workers) {
      if (w.department_id) {
        const dept = await db.collection('departments').findOne({ _id: w.department_id });
        w.department_name = dept?.name || null;
      }
    }
    res.json(workers);
  } catch (error) {
    console.error('[ERROR] Get workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

/**
 * GET /api/workers/:id - Get worker details
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const worker = await db.collection('workers').findOne({ id: req.params.id });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    if (worker.department_id) {
      const dept = await db.collection('departments').findOne({ _id: worker.department_id });
      worker.department_name = dept?.name || null;
    }
    res.json(worker);
  } catch (error) {
    console.error('[ERROR] Get worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

/**
 * POST /api/workers - Create worker (Admin/HOD only)
 */
router.post('/', requireAuth, requireRole('admin', 'hod'), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { id, name, email, phone, department_id, designation, worker_type, office_room } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name required' });
    }
    await db.collection('workers').insertOne({ id, name, email, phone, department_id, designation, worker_type, office_room });
    res.status(201).json({ success: true, message: 'Worker created' });
  } catch (error) {
    console.error('[ERROR] Create worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

/**
 * PUT /api/workers/:id - Update worker
 */
router.put('/:id', requireAuth, requireRole('admin', 'hod', 'worker'), async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { name, email, phone, designation, worker_type, office_room } = req.body;
    await db.collection('workers').updateOne(
      { id: req.params.id },
      { $set: { name, email, phone, designation, worker_type, office_room } }
    );
    res.json({ success: true, message: 'Worker updated' });
  } catch (error) {
    console.error('[ERROR] Update worker:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

/**
 * GET /api/workers/:id/attendance - Get worker attendance
 */
router.get('/:id/attendance', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { start_date, end_date } = req.query;
    const query = { entity_id: req.params.id, entity_type: 'worker' };
    if (start_date && end_date) {
      query.ts = { $gte: new Date(start_date), $lte: new Date(end_date) };
    }
    const attendance = await db.collection('attendance_events').find(query).sort({ ts: -1 }).limit(100).toArray();
    res.json(attendance);
  } catch (error) {
    console.error('[ERROR] Get worker attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

export default router;
