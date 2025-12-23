import express from 'express';
import { dbGet, dbAll } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/trust/:student_id - Get trust score for a student
 */
router.get('/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const trust = await dbGet(
      'SELECT score, punctuality, consistency, streak FROM trust_scores WHERE student_id = ?',
      [student_id]
    );
    
    if (!trust) {
      return res.json({
        studentId: student_id,
        score: 100,
        punctuality: 100,
        consistency: 100,
        streak: 0
      });
    }
    
    res.json({
      studentId: student_id,
      score: trust.score,
      punctuality: trust.punctuality,
      consistency: trust.consistency,
      streak: trust.streak
    });
  } catch (error) {
    console.error('[ERROR] Get trust:', error);
    res.status(500).json({ error: 'Failed to fetch trust score' });
  }
});

/**
 * GET /api/leaderboard - Get leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { metric = 'overall' } = req.query;
    
    let orderCol = 'ts.score';
    if (metric === 'punctuality') {
      orderCol = 'ts.punctuality';
    } else if (metric === 'consistency') {
      orderCol = 'ts.consistency';
    }
    
    const leaderboard = await dbAll(`
      SELECT s.id, s.name, s.avatar_url, ${orderCol} as score, 0 as trend
      FROM students s
      LEFT JOIN trust_scores ts ON s.id = ts.student_id
      ORDER BY score DESC
      LIMIT 10
    `);
    
    const result = leaderboard.map(r => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatar_url,
      score: r.score || 100,
      trend: r.trend
    }));
    
    res.json(result);
  } catch (error) {
    console.error('[ERROR] Get leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/seats - Get seat map
 */
router.get('/seats', async (req, res) => {
  try {
    const seats = await dbAll(
      'SELECT id, name, seat_row, seat_col FROM students WHERE seat_row IS NOT NULL AND seat_col IS NOT NULL'
    );
    
    const seatMap = {};
    seats.forEach(s => {
      const key = `${s.seat_row}-${s.seat_col}`;
      seatMap[key] = {
        studentId: s.id,
        studentName: s.name,
        row: s.seat_row,
        col: s.seat_col
      };
    });
    
    res.json(seatMap);
  } catch (error) {
    console.error('[ERROR] Get seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

export default router;

