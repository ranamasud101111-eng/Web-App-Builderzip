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

router.put('/me/profile', authenticate, async (req, res) => {
  try {
    const { name, email, class_level } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2, class_level = $3 WHERE id = $4
       RETURNING id, name, email, role, class_level, avatar_url, email_verified, created_at`,
      [name.trim(), email.trim(), class_level || null, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.code === '23505' ? 'Email already in use' : 'Failed to update profile' });
  }
});

router.post('/me/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'All fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const { default: bcrypt } = await import('bcryptjs');
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Failed to change password' });
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

router.get('/:id/enrollments', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.subject_id, e.enrolled_at,
        s.name AS subject_name, s.icon AS subject_icon, s.color AS subject_color,
        COUNT(DISTINCT up.chapter_id) FILTER (WHERE up.completed = true) AS completed_chapters
      FROM enrollments e
      JOIN subjects s ON s.id = e.subject_id
      LEFT JOIN user_progress up ON up.user_id = e.user_id AND up.chapter_id IN (
        SELECT id FROM chapters WHERE subject_id = e.subject_id
      )
      WHERE e.user_id = $1
      GROUP BY e.id, e.subject_id, e.enrolled_at, s.name, s.icon, s.color
      ORDER BY e.enrolled_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
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
