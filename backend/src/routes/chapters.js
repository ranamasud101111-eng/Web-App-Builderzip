import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon, s.id as subject_id
       FROM chapters c JOIN subjects s ON s.id = c.subject_id WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Chapter not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

router.get('/:id/mcqs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const args = [req.params.id];
    let statusFilter = '';
    if (status && status !== 'all') {
      args.push(status);
      statusFilter = ` AND m.status = $${args.length}`;
    }
    const result = await pool.query(
      `SELECT m.* FROM mcqs m
       WHERE m.chapter_id = $1${statusFilter}
       ORDER BY m.order_index ASC, m.id ASC`,
      args
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapter MCQs' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, title, content, video_url, duration_minutes, order_index, is_preview } = req.body;
    const result = await pool.query(
      'INSERT INTO chapters (subject_id, title, content, video_url, duration_minutes, order_index, is_preview) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [subject_id, title, content || '', video_url || '', duration_minutes || 0, order_index || 0, is_preview || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, video_url, duration_minutes, order_index, is_preview } = req.body;
    const result = await pool.query(
      `UPDATE chapters SET title=COALESCE($2,title), content=COALESCE($3,content), video_url=COALESCE($4,video_url),
       duration_minutes=COALESCE($5,duration_minutes), order_index=COALESCE($6,order_index), is_preview=COALESCE($7,is_preview)
       WHERE id=$1 RETURNING *`,
      [req.params.id, title, content, video_url, duration_minutes, order_index, is_preview]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM chapters WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

router.put('/:id/progress', authenticate, async (req, res) => {
  try {
    const { completed } = req.body;
    await pool.query(
      `INSERT INTO user_progress (user_id, chapter_id, completed, completed_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, chapter_id) DO UPDATE SET completed=$3, completed_at=$4`,
      [req.user.id, req.params.id, completed, completed ? new Date() : null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
