import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, s.name as subject_name, s.color as subject_color
      FROM chapters c
      JOIN subjects s ON s.id = c.subject_id
      WHERE c.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Chapter not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { subject_id, title, content, video_url, duration_minutes, order_index, is_preview } = req.body;
    const result = await pool.query(
      'INSERT INTO chapters (subject_id, title, content, video_url, duration_minutes, order_index, is_preview) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [subject_id, title, content, video_url, duration_minutes || 0, order_index || 0, is_preview || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

router.put('/:id/progress', authenticate, async (req, res) => {
  try {
    const { completed } = req.body;
    await pool.query(`
      INSERT INTO user_progress (user_id, chapter_id, completed, completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, chapter_id) DO UPDATE SET completed = $3, completed_at = $4
    `, [req.user.id, req.params.id, completed, completed ? new Date() : null]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
