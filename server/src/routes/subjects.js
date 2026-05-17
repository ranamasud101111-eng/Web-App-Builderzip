import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
        COUNT(DISTINCT c.id) as chapter_count,
        COUNT(DISTINCT e.user_id) as student_count
      FROM subjects s
      LEFT JOIN chapters c ON c.subject_id = s.id
      LEFT JOIN enrollments e ON e.subject_id = s.id
      GROUP BY s.id
      ORDER BY s.order_index, s.created_at
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const subjectResult = await pool.query('SELECT * FROM subjects WHERE id = $1', [req.params.id]);
    if (subjectResult.rows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    const chaptersResult = await pool.query(
      'SELECT * FROM chapters WHERE subject_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    res.json({ ...subjectResult.rows[0], chapters: chaptersResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

router.get('/:id/chapters', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chapters WHERE subject_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { name, description, icon, color, class_level, order_index } = req.body;
    const result = await pool.query(
      'INSERT INTO subjects (name, description, icon, color, class_level, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, icon || '📚', color || '#3b82f6', class_level, order_index || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

export default router;
