import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { broadcastEvent } from '../websocket/websocket.js';

const router = express.Router();

/**
 * GET /api/announcements
 * Optional query: department_id
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const deptIdRaw = req.query.department_id;
    const filter = {};
    if (deptIdRaw) {
      filter.department_id = deptIdRaw;
    }
    // Join with departments collection for department_name/code
    const announcements = await db.collection('announcements').aggregate([
      { $match: filter },
      { $sort: { created_at: -1 } },
      { $limit: 200 },
      { $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { $addFields: {
          department_name: '$department.name',
          department_code: '$department.code'
        }
      }
    ]).toArray();
    res.json(announcements || []);
  } catch (error) {
    console.error('[ERROR] Get announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;
