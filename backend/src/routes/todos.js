import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, priority = 'medium', due_date } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const result = await pool.query(
      'INSERT INTO todos (user_id, title, priority, due_date) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, title.trim(), priority, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { title, completed, priority, due_date } = req.body;
    const result = await pool.query(
      `UPDATE todos SET
        title = COALESCE($2, title),
        completed = COALESCE($3, completed),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        updated_at = NOW()
       WHERE id = $1 AND user_id = $6 RETURNING *`,
      [req.params.id, title, completed, priority, due_date, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Todo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

router.post('/pomodoro', authenticate, async (req, res) => {
  try {
    const { duration_minutes = 25, completed = true } = req.body;
    const result = await pool.query(
      'INSERT INTO pomodoro_sessions (user_id, duration_minutes, completed) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, duration_minutes, completed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save pomodoro session' });
  }
});

router.get('/pomodoro/stats', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE completed AND DATE(created_at) = CURRENT_DATE) AS today_count,
        COUNT(*) FILTER (WHERE completed) AS total_count,
        COALESCE(SUM(duration_minutes) FILTER (WHERE completed AND DATE(created_at) = CURRENT_DATE), 0) AS today_minutes
       FROM pomodoro_sessions WHERE user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
