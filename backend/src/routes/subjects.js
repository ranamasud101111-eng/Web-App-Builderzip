import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*,
        COUNT(DISTINCT c.id) as chapter_count,
        COUNT(DISTINCT e.user_id) as student_count,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'approved') as total_mcqs,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'pending') as pending_mcqs,
        COUNT(DISTINCT m.id) as all_mcqs
      FROM subjects s
      LEFT JOIN chapters c ON c.subject_id = s.id
      LEFT JOIN enrollments e ON e.subject_id = s.id
      LEFT JOIN mcqs m ON m.subject_id = s.id
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
    const userId = req.query.user_id || null;
    const subjectResult = await pool.query('SELECT * FROM subjects WHERE id = $1', [req.params.id]);
    if (subjectResult.rows.length === 0) return res.status(404).json({ error: 'Subject not found' });

    const chaptersResult = await pool.query(`
      SELECT
        c.*,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'approved') AS total_mcqs,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'pending') AS pending_mcqs,
        COUNT(DISTINCT m.id) AS all_mcqs,
        COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'approved' AND msa.is_correct = TRUE AND ms.user_id = $2 AND ms.status = 'completed') AS correct_mcqs,
        COUNT(DISTINCT msa.mcq_id) FILTER (WHERE ms.user_id = $2 AND ms.status = 'completed') AS attempted_mcqs
      FROM chapters c
      LEFT JOIN mcqs m ON m.chapter_id = c.id
      LEFT JOIN mcq_session_answers msa ON msa.mcq_id = m.id
      LEFT JOIN mcq_sessions ms ON ms.id = msa.session_id
      WHERE c.subject_id = $1
      GROUP BY c.id
      ORDER BY c.order_index
    `, [req.params.id, userId]);

    res.json({ ...subjectResult.rows[0], chapters: chaptersResult.rows });
  } catch (err) {
    console.error(err);
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

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
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

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, color, class_level, order_index } = req.body;
    const result = await pool.query(
      `UPDATE subjects SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        icon = COALESCE($4, icon),
        color = COALESCE($5, color),
        class_level = $6,
        order_index = COALESCE($7, order_index)
       WHERE id = $1 RETURNING *`,
      [req.params.id, name, description, icon, color, class_level || null, order_index]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Subject not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
