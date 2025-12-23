import express from 'express';
import { dbAll } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/insights - Get insights
 */
router.get('/insights', async (req, res) => {
  try {
    const insights = await dbAll(
      'SELECT id, kind, text, created_at, impact FROM insights ORDER BY created_at DESC LIMIT 20'
    );
    
    const result = insights.map(i => ({
      id: String(i.id),
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

