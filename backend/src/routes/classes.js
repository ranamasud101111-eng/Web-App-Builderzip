import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM class_settings WHERE id = 1');
    res.json(r.rows[0] || { classes_visible: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { classes_visible } = req.body;
    const r = await pool.query(
      'UPDATE class_settings SET classes_visible = $1, updated_at = NOW() WHERE id = 1 RETURNING *',
      [classes_visible]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/levels', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM class_levels ORDER BY order_index, created_at'
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

router.post('/levels', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO class_levels (name, description, icon, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, description || '', icon || '🎓', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create level' });
  }
});

router.put('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE class_levels SET name=$1, description=$2, icon=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '🎓', order_index || 0, is_visible !== false, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Level not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update level' });
  }
});

router.delete('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM class_levels WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete level' });
  }
});

router.get('/levels/:id/subjects', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM class_subjects WHERE level_id=$1 ORDER BY order_index, created_at',
      [req.params.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/subjects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level_id, name, description, icon, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO class_subjects (level_id, name, description, icon, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [level_id, name, description || '', icon || '📚', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.put('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE class_subjects SET name=$1, description=$2, icon=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '📚', order_index || 0, is_visible !== false, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

router.delete('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM class_subjects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

router.get('/subjects/:id/chapters', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM class_chapters WHERE subject_id=$1 ORDER BY order_index, created_at',
      [req.params.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

router.post('/chapters', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, title, description, youtube_url, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO class_chapters (subject_id, title, description, youtube_url, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [subject_id, title, description || '', youtube_url || '', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

router.put('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, youtube_url, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE class_chapters SET title=$1, description=$2, youtube_url=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [title, description || '', youtube_url || '', order_index || 0, is_visible !== false, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Chapter not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

router.delete('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM class_chapters WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

export default router;
