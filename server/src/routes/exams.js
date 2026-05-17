import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const q = `
      SELECT e.*,
        s.name AS subject_name, s.icon AS subject_icon,
        c.title AS chapter_title,
        u.name AS created_by_name
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN chapters c ON e.chapter_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
      ${isAdmin ? '' : 'WHERE e.is_published = TRUE'}
      ORDER BY e.created_at DESC
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*,
        s.name AS subject_name, s.icon AS subject_icon, s.color AS subject_color,
        c.title AS chapter_title
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN chapters c ON e.chapter_id = c.id
      WHERE e.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, subject_id, chapter_id, duration_minutes, total_marks, passing_marks, question_count, difficulty, is_published } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await pool.query(
      `INSERT INTO exams (title, description, subject_id, chapter_id, duration_minutes, total_marks, passing_marks, question_count, difficulty, is_published, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title, description || null, subject_id || null, chapter_id || null,
       duration_minutes || 60, total_marks || 100, passing_marks || 40,
       question_count || 10, difficulty || 'mixed', is_published || false, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, subject_id, chapter_id, duration_minutes, total_marks, passing_marks, question_count, difficulty, is_published } = req.body;
    const result = await pool.query(
      `UPDATE exams SET title=$1, description=$2, subject_id=$3, chapter_id=$4,
       duration_minutes=$5, total_marks=$6, passing_marks=$7, question_count=$8,
       difficulty=$9, is_published=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [title, description || null, subject_id || null, chapter_id || null,
       duration_minutes, total_marks, passing_marks, question_count,
       difficulty || 'mixed', is_published, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

router.patch('/:id/toggle-publish', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE exams SET is_published = NOT is_published, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle exam' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM exams WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

export default router;
