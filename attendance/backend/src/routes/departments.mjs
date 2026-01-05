import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/departments - Get all departments
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    // Aggregate department stats from related collections
    const departments = await db.collection('departments').aggregate([
      { $sort: { name: 1 } },
      { $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: 'department_id',
          as: 'sections'
        }
      },
      { $lookup: {
          from: 'faculty',
          localField: '_id',
          foreignField: 'department_id',
          as: 'faculty'
        }
      },
      { $lookup: {
          from: 'workers',
          localField: '_id',
          foreignField: 'department_id',
          as: 'workers'
        }
      },
      { $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'department_id',
          as: 'students'
        }
      },
      { $addFields: {
          total_sections: { $size: '$sections' },
          total_faculty: { $size: '$faculty' },
          total_workers: { $size: '$workers' },
          total_students: { $size: '$students' }
        }
      }
    ]).toArray();
    res.json(departments);
  } catch (error) {
    console.error('[ERROR] Get departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;
