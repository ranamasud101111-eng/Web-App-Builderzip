import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Leaderboard — accessible by any authenticated user
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.class_level,
        COUNT(DISTINCT e.subject_id) as enrolled_count,
        COUNT(DISTINCT up.chapter_id) FILTER (WHERE up.completed = true) as completed_chapters
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN user_progress up ON up.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY completed_chapters DESC NULLS LAST, u.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get all users (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.class_level, u.avatar_url, u.created_at,
        COUNT(DISTINCT e.subject_id) as enrolled_count,
        COUNT(DISTINCT up.chapter_id) FILTER (WHERE up.completed = true) as completed_chapters
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN user_progress up ON up.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get stats (admin dashboard)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const subjects = await pool.query('SELECT COUNT(*) FROM subjects');
    const chapters = await pool.query('SELECT COUNT(*) FROM chapters');
    const enrollments = await pool.query('SELECT COUNT(*) FROM enrollments');
    const completions = await pool.query('SELECT COUNT(*) FROM user_progress WHERE completed = true');
    
    res.json({
      total_students: parseInt(users.rows[0].count),
      total_subjects: parseInt(subjects.rows[0].count),
      total_chapters: parseInt(chapters.rows[0].count),
      total_enrollments: parseInt(enrollments.rows[0].count),
      total_completions: parseInt(completions.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get my progress
router.get('/my-progress', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.icon, s.color,
        COUNT(c.id) as total_chapters,
        COUNT(up.id) FILTER (WHERE up.completed = true) as completed_chapters
      FROM enrollments e
      JOIN subjects s ON s.id = e.subject_id
      LEFT JOIN chapters c ON c.subject_id = s.id
      LEFT JOIN user_progress up ON up.chapter_id = c.id AND up.user_id = $1
      WHERE e.user_id = $1
      GROUP BY s.id
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Enroll in subject
router.post('/enroll/:subjectId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO enrollments (user_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.subjectId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Check enrollment
router.get('/enrolled/:subjectId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND subject_id = $2',
      [req.user.id, req.params.subjectId]
    );
    res.json({ enrolled: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check enrollment' });
  }
});

export default router;
