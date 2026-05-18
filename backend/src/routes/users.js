import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

(async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE`);
  } catch {}
})();

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
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.class_level, u.avatar_url, u.created_at,
        COALESCE(u.is_suspended, false) as is_suspended,
        COUNT(DISTINCT e.subject_id) as enrolled_count,
        COUNT(DISTINCT up.chapter_id) FILTER (WHERE up.completed = true) as completed_chapters
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN user_progress up ON up.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

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
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

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
  } catch {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.post('/enroll/:subjectId', authenticate, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO enrollments (user_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.subjectId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

router.get('/enrolled/:subjectId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND subject_id = $2',
      [req.user.id, req.params.subjectId]
    );
    res.json({ enrolled: result.rows.length > 0 });
  } catch {
    res.status(500).json({ error: 'Failed to check enrollment' });
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.class_level, u.created_at,
        COALESCE(u.is_suspended, false) as is_suspended,
        COUNT(DISTINCT e.subject_id) as enrolled_count,
        COUNT(DISTINCT up.chapter_id) FILTER (WHERE up.completed = true) as completed_chapters
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN user_progress up ON up.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, class_level } = req.body;
    const result = await pool.query(`
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        class_level = COALESCE($3, class_level)
      WHERE id = $4
      RETURNING id, name, email, class_level, COALESCE(is_suspended, false) as is_suspended
    `, [name || null, email || null, class_level || null, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.code === '23505' ? 'Email already in use' : 'Failed to update user' });
  }
});

router.patch('/:id/suspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE users SET is_suspended = NOT COALESCE(is_suspended, false)
      WHERE id = $1
      RETURNING id, COALESCE(is_suspended, false) as is_suspended
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update suspension' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM enrollments WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM user_progress WHERE user_id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
