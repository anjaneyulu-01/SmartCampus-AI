import express from 'express';
import { connectMongo, getDb } from '../database/mongo.js';

const router = express.Router();

/**
 * GET /api/trust/:student_id - Get trust score for a student
 */
router.get('/:student_id', async (req, res) => {
  try {
    await connectMongo();
    const db = getDb();
    const { student_id } = req.params;
    const trust = await db.collection('trust_scores').findOne({ student_id });
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
    await connectMongo();
    const db = getDb();
    const { metric = 'overall' } = req.query;
    let sortField = 'score';
    if (metric === 'punctuality') sortField = 'punctuality';
    else if (metric === 'consistency') sortField = 'consistency';
    const students = await db.collection('students').find({}).toArray();
    const trustScores = await db.collection('trust_scores').find({}).toArray();
    const leaderboard = students.map(s => {
      const ts = trustScores.find(t => t.student_id === s.id) || {};
      return {
        id: s.id,
        name: s.name,
        avatarUrl: s.avatar_url,
        score: ts[sortField] || 100,
        trend: 0
      };
    }).sort((a, b) => b.score - a.score).slice(0, 10);
    res.json(leaderboard);
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
    await connectMongo();
    const db = getDb();
    const seats = await db.collection('students').find({ seat_row: { $ne: null }, seat_col: { $ne: null } }).toArray();
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
