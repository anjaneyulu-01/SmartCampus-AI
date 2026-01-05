import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';

const router = express.Router();

/**
 * GET /api/insights - Get insights
 */
router.get('/insights', async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const insights = await db.collection('insights').find({}).sort({ created_at: -1 }).limit(20).toArray();
    const result = insights.map(i => ({
      id: String(i._id),
      kind: i.kind,
      text: i.text,
      createdAt: i.created_at,
      impact: i.impact
    }));
    res.json(result);
  } catch (error) {
    console.error('[ERROR] Get insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

export default router;
