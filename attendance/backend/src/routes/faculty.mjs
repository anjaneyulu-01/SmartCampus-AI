import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/faculty - Get all faculty
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { department_id } = req.query;
    await connectMongo();
    const db = getDb();
    const filter = {};
    if (department_id) {
      filter.department_id = department_id;
    }
    const faculty = await db.collection('faculty').aggregate([
      { $match: filter },
      { $sort: { name: 1 } },
      { $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { $addFields: {
          department_name: '$department.name'
        }
      }
    ]).toArray();
    res.json(faculty);
  } catch (error) {
    console.error('[ERROR] Get faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

export default router;
