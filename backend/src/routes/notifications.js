import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, un.is_read, un.read_at
      FROM notifications n
      JOIN user_notifications un ON un.notification_id = n.id
      WHERE un.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM user_notifications
      WHERE user_id = $1 AND is_read = false
    `, [req.user.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await pool.query(`
      UPDATE user_notifications SET is_read = true, read_at = NOW()
      WHERE user_id = $1 AND notification_id = $2
    `, [req.user.id, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await pool.query(`
      UPDATE user_notifications SET is_read = true, read_at = NOW()
      WHERE user_id = $1 AND is_read = false
    `, [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// User: Dismiss/delete notification (removes from their inbox only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_notifications WHERE user_id = $1 AND notification_id = $2',
      [req.user.id, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Admin: Get all notifications
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, 
        COUNT(un.user_id) as total_recipients,
        COUNT(CASE WHEN un.is_read THEN 1 END) as read_count
      FROM notifications n
      LEFT JOIN user_notifications un ON un.notification_id = n.id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Admin: Send notification
router.post('/admin/send', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, message, type, target, target_value, is_important, scheduled_at } = req.body;
    
    // Create notification
    const notifResult = await pool.query(`
      INSERT INTO notifications (title, message, type, target, target_value, is_important, scheduled_at, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [title, message, type || 'info', target || 'all', target_value, is_important || false, scheduled_at || null, req.user.id]);
    
    const notification = notifResult.rows[0];
    
    // Determine recipients
    let usersQuery;
    if (target === 'all') {
      usersQuery = await pool.query("SELECT id FROM users WHERE role = 'student'");
    } else if (target === 'class') {
      usersQuery = await pool.query("SELECT id FROM users WHERE class_level = $1 AND role = 'student'", [target_value]);
    } else if (target === 'user') {
      usersQuery = await pool.query("SELECT id FROM users WHERE id = $1", [target_value]);
    } else if (target === 'subject') {
      usersQuery = await pool.query("SELECT DISTINCT user_id as id FROM enrollments WHERE subject_id = $1", [target_value]);
    } else {
      usersQuery = await pool.query("SELECT id FROM users WHERE role = 'student'");
    }
    
    // Insert user_notifications for each recipient
    for (const user of usersQuery.rows) {
      await pool.query(
        'INSERT INTO user_notifications (user_id, notification_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user.id, notification.id]
      );
    }
    
    res.json({ notification, recipients: usersQuery.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Admin: Delete notification
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM user_notifications WHERE notification_id = $1', [req.params.id]);
    await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Admin: Update notification
router.put('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, message, type, is_important } = req.body;
    const result = await pool.query(`
      UPDATE notifications SET title=$1, message=$2, type=$3, is_important=$4, updated_at=NOW()
      WHERE id=$5 RETURNING *
    `, [title, message, type, is_important, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
