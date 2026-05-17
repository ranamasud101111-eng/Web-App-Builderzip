import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads/shortnotes');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

/* helper: delete a file on disk safely */
const removeFile = (filename) => {
  if (!filename) return;
  try {
    const fp = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  } catch {}
};

/* ─── Settings ─── */
router.get('/settings', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM shortnote_settings WHERE id = 1');
    res.json(r.rows[0] || { shortnotes_visible: true });
  } catch { res.status(500).json({ error: 'Failed to fetch settings' }); }
});

router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { shortnotes_visible } = req.body;
    const r = await pool.query(
      'UPDATE shortnote_settings SET shortnotes_visible=$1, updated_at=NOW() WHERE id=1 RETURNING *',
      [shortnotes_visible]
    );
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update settings' }); }
});

/* ─── Levels ─── */
router.get('/levels', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM shortnote_levels ORDER BY order_index, created_at');
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed to fetch levels' }); }
});

router.post('/levels', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const r = await pool.query(
      'INSERT INTO shortnote_levels (name,description,icon,order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [name.trim(), description || '', icon || '📝', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Level name already exists' });
    res.status(500).json({ error: 'Failed to create level' });
  }
});

router.put('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE shortnote_levels SET name=$1,description=$2,icon=$3,order_index=$4,is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '📝', order_index || 0, is_visible !== false, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update level' }); }
});

router.delete('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    /* cascade deletes subjects → chapters → notes (DB cascades) but files need manual cleanup */
    const notes = await pool.query(
      `SELECT sn.filename FROM short_notes sn
       JOIN shortnote_chapters sc ON sc.id = sn.chapter_id
       JOIN shortnote_subjects ss ON ss.id = sc.subject_id
       WHERE ss.level_id = $1 AND sn.filename IS NOT NULL`,
      [req.params.id]
    );
    notes.rows.forEach(r => removeFile(r.filename));
    await pool.query('DELETE FROM shortnote_levels WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete level' }); }
});

/* ─── Subjects ─── */
router.get('/levels/:id/subjects', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM shortnote_subjects WHERE level_id=$1 ORDER BY order_index, created_at',
      [req.params.id]
    );
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed to fetch subjects' }); }
});

router.post('/subjects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level_id, name, description, icon, order_index } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const r = await pool.query(
      'INSERT INTO shortnote_subjects (level_id,name,description,icon,order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [level_id, name.trim(), description || '', icon || '📚', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to create subject' }); }
});

router.put('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE shortnote_subjects SET name=$1,description=$2,icon=$3,order_index=$4,is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '📚', order_index || 0, is_visible !== false, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update subject' }); }
});

router.delete('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const notes = await pool.query(
      `SELECT sn.filename FROM short_notes sn
       JOIN shortnote_chapters sc ON sc.id = sn.chapter_id
       WHERE sc.subject_id=$1 AND sn.filename IS NOT NULL`,
      [req.params.id]
    );
    notes.rows.forEach(r => removeFile(r.filename));
    await pool.query('DELETE FROM shortnote_subjects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete subject' }); }
});

/* ─── Chapters ─── */
router.get('/subjects/:id/chapters', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT sc.*,
              sn.id          AS note_id,
              sn.type        AS note_type,
              sn.text_content,
              sn.filename,
              sn.original_name,
              sn.file_size,
              sn.is_visible  AS note_visible,
              sn.updated_at  AS note_updated_at
       FROM shortnote_chapters sc
       LEFT JOIN short_notes sn ON sn.chapter_id = sc.id
       WHERE sc.subject_id=$1
       ORDER BY sc.order_index, sc.created_at`,
      [req.params.id]
    );
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed to fetch chapters' }); }
});

router.post('/chapters', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, title, description, order_index } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const r = await pool.query(
      'INSERT INTO shortnote_chapters (subject_id,title,description,order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [subject_id, title.trim(), description || '', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to create chapter' }); }
});

router.put('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE shortnote_chapters SET title=$1,description=$2,order_index=$3,is_visible=$4 WHERE id=$5 RETURNING *',
      [title, description || '', order_index || 0, is_visible !== false, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update chapter' }); }
});

router.delete('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const note = await pool.query('SELECT filename FROM short_notes WHERE chapter_id=$1', [req.params.id]);
    if (note.rows.length) removeFile(note.rows[0].filename);
    await pool.query('DELETE FROM shortnote_chapters WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete chapter' }); }
});

/* ─── Note CRUD ─── */

/* GET /chapters/:id/note */
router.get('/chapters/:id/note', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM short_notes WHERE chapter_id=$1', [req.params.id]);
    res.json(r.rows[0] || null);
  } catch { res.status(500).json({ error: 'Failed to fetch note' }); }
});

/* PUT /chapters/:id/note  →  upsert text note OR update visibility/type */
router.put('/chapters/:id/note', authenticate, requireAdmin, async (req, res) => {
  try {
    const { type, text_content, is_visible } = req.body;
    const chapterId = req.params.id;

    const existing = await pool.query('SELECT * FROM short_notes WHERE chapter_id=$1', [chapterId]);

    if (existing.rows.length === 0) {
      /* CREATE */
      const r = await pool.query(
        `INSERT INTO short_notes (chapter_id, type, text_content, is_visible, updated_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [chapterId, type || 'text', text_content || '', is_visible !== false]
      );
      return res.json(r.rows[0]);
    }

    /* UPDATE — only change the columns provided */
    const current = existing.rows[0];
    const newType       = type       !== undefined ? type       : current.type;
    const newText       = text_content !== undefined ? text_content : current.text_content;
    const newVisibility = is_visible  !== undefined ? is_visible  : current.is_visible;

    /* If switching away from PDF to text, delete the old file */
    if (newType === 'text' && current.filename) {
      removeFile(current.filename);
    }

    const r = await pool.query(
      `UPDATE short_notes
       SET type=$1, text_content=$2, is_visible=$3,
           filename = CASE WHEN $1='text' THEN NULL ELSE filename END,
           original_name = CASE WHEN $1='text' THEN NULL ELSE original_name END,
           file_size = CASE WHEN $1='text' THEN NULL ELSE file_size END,
           updated_at=NOW()
       WHERE chapter_id=$4 RETURNING *`,
      [newType, newText, newVisibility, chapterId]
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

/* POST /chapters/:id/note/upload  →  upload / replace PDF */
router.post('/chapters/:id/note/upload', authenticate, requireAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided' });
    const chapterId = req.params.id;
    const isVisible = req.body.is_visible !== 'false';

    const existing = await pool.query('SELECT * FROM short_notes WHERE chapter_id=$1', [chapterId]);
    if (existing.rows.length > 0 && existing.rows[0].filename) {
      removeFile(existing.rows[0].filename);
    }

    let r;
    if (existing.rows.length === 0) {
      r = await pool.query(
        `INSERT INTO short_notes (chapter_id, type, filename, original_name, file_size, is_visible, updated_at)
         VALUES ($1,'pdf',$2,$3,$4,$5,NOW()) RETURNING *`,
        [chapterId, req.file.filename, req.file.originalname, req.file.size, isVisible]
      );
    } else {
      r = await pool.query(
        `UPDATE short_notes
         SET type='pdf', filename=$1, original_name=$2, file_size=$3, text_content=NULL, is_visible=$4, updated_at=NOW()
         WHERE chapter_id=$5 RETURNING *`,
        [req.file.filename, req.file.originalname, req.file.size, isVisible, chapterId]
      );
    }
    res.json(r.rows[0]);
  } catch (e) {
    if (req.file) removeFile(req.file.filename);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

/* DELETE /chapters/:id/note */
router.delete('/chapters/:id/note', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM short_notes WHERE chapter_id=$1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'No note found' });
    removeFile(existing.rows[0].filename);
    await pool.query('DELETE FROM short_notes WHERE chapter_id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete note' }); }
});

/* PATCH /chapters/:id/note/visibility */
router.patch('/chapters/:id/note/visibility', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_visible } = req.body;
    const r = await pool.query(
      'UPDATE short_notes SET is_visible=$1, updated_at=NOW() WHERE chapter_id=$2 RETURNING *',
      [is_visible, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'No note found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update visibility' }); }
});

/* ─── Serve PDF ─── */
router.get('/file/:filename', async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    const row = await pool.query('SELECT original_name FROM short_notes WHERE filename=$1', [filename]);
    const originalName = row.rows[0]?.original_name || filename;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
    res.sendFile(filePath);
  } catch { res.status(500).json({ error: 'Failed to serve file' }); }
});

export default router;
