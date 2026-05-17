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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const bulkUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

/* ─── Settings ─── */
router.get('/settings', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM shortnote_settings WHERE id = 1');
    res.json(r.rows[0] || { shortnotes_visible: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { shortnotes_visible } = req.body;
    const r = await pool.query(
      'UPDATE shortnote_settings SET shortnotes_visible = $1, updated_at = NOW() WHERE id = 1 RETURNING *',
      [shortnotes_visible]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/* ─── Levels ─── */
router.get('/levels', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM shortnote_levels ORDER BY order_index, created_at');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

router.post('/levels', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO shortnote_levels (name, description, icon, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, description || '', icon || '📝', order_index || 0]
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
      'UPDATE shortnote_levels SET name=$1, description=$2, icon=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '📝', order_index || 0, is_visible !== false, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Level not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update level' });
  }
});

router.delete('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM shortnote_levels WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete level' });
  }
});

/* ─── Subjects ─── */
router.get('/levels/:id/subjects', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM shortnote_subjects WHERE level_id=$1 ORDER BY order_index, created_at',
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
      'INSERT INTO shortnote_subjects (level_id, name, description, icon, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
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
      'UPDATE shortnote_subjects SET name=$1, description=$2, icon=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
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
    await pool.query('DELETE FROM shortnote_subjects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

/* ─── Chapters ─── */
router.get('/subjects/:id/chapters', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT sc.*, sf.id as file_id, sf.original_name, sf.filename, sf.file_size, sf.uploaded_at
       FROM shortnote_chapters sc
       LEFT JOIN shortnote_files sf ON sf.chapter_id = sc.id
       WHERE sc.subject_id=$1 ORDER BY sc.order_index, sc.created_at`,
      [req.params.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

router.post('/chapters', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, title, description, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO shortnote_chapters (subject_id, title, description, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [subject_id, title, description || '', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

router.put('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE shortnote_chapters SET title=$1, description=$2, order_index=$3, is_visible=$4 WHERE id=$5 RETURNING *',
      [title, description || '', order_index || 0, is_visible !== false, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Chapter not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

router.delete('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM shortnote_files WHERE chapter_id=$1', [req.params.id]);
    if (existing.rows.length > 0) {
      const filePath = path.join(UPLOAD_DIR, existing.rows[0].filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await pool.query('DELETE FROM shortnote_files WHERE chapter_id=$1', [req.params.id]);
    }
    await pool.query('DELETE FROM shortnote_chapters WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

/* ─── File upload for a chapter ─── */
router.post('/chapters/:id/upload', authenticate, requireAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided' });
    const chapterId = req.params.id;

    const existing = await pool.query('SELECT * FROM shortnote_files WHERE chapter_id=$1', [chapterId]);
    if (existing.rows.length > 0) {
      const oldPath = path.join(UPLOAD_DIR, existing.rows[0].filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await pool.query('DELETE FROM shortnote_files WHERE chapter_id=$1', [chapterId]);
    }

    const r = await pool.query(
      'INSERT INTO shortnote_files (chapter_id, filename, original_name, file_path, file_size) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [chapterId, req.file.filename, req.file.originalname, req.file.path, req.file.size]
    );
    res.json(r.rows[0]);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/* ─── Delete file from a chapter ─── */
router.delete('/chapters/:id/file', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM shortnote_files WHERE chapter_id=$1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'No file found' });
    const filePath = path.join(UPLOAD_DIR, existing.rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await pool.query('DELETE FROM shortnote_files WHERE chapter_id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/* ─── Bulk upload: create chapters + upload PDFs to a subject ─── */
router.post('/subjects/:id/bulk-upload', authenticate, requireAdmin, bulkUpload.array('pdfs', 50), async (req, res) => {
  const subjectId = req.params.id;
  const results = [];

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No PDF files provided' });
  }

  for (const file of req.files) {
    const title = path.basename(file.originalname, path.extname(file.originalname));
    try {
      const existing = await pool.query(
        'SELECT sc.*, sf.id as file_id, sf.filename as existing_filename FROM shortnote_chapters sc LEFT JOIN shortnote_files sf ON sf.chapter_id = sc.id WHERE sc.subject_id=$1 AND LOWER(sc.title)=LOWER($2)',
        [subjectId, title]
      );

      let chapterId;
      if (existing.rows.length > 0) {
        chapterId = existing.rows[0].id;
        if (existing.rows[0].existing_filename) {
          const oldPath = path.join(UPLOAD_DIR, existing.rows[0].existing_filename);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          await pool.query('DELETE FROM shortnote_files WHERE chapter_id=$1', [chapterId]);
        }
      } else {
        const maxOrder = await pool.query('SELECT MAX(order_index) as m FROM shortnote_chapters WHERE subject_id=$1', [subjectId]);
        const nextOrder = (maxOrder.rows[0].m || 0) + 1;
        const newChapter = await pool.query(
          'INSERT INTO shortnote_chapters (subject_id, title, order_index) VALUES ($1,$2,$3) RETURNING *',
          [subjectId, title, nextOrder]
        );
        chapterId = newChapter.rows[0].id;
      }

      await pool.query(
        'INSERT INTO shortnote_files (chapter_id, filename, original_name, file_path, file_size) VALUES ($1,$2,$3,$4,$5)',
        [chapterId, file.filename, file.originalname, file.path, file.size]
      );

      results.push({ title, status: 'ok', chapterId });
    } catch (err) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      results.push({ title, status: 'error', error: err.message });
    }
  }

  res.json({ results, total: req.files.length, success: results.filter(r => r.status === 'ok').length });
});

/* ─── Serve PDF file ─── */
router.get('/file/:filename', async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    const row = await pool.query('SELECT * FROM shortnote_files WHERE filename=$1', [filename]);
    const originalName = row.rows[0]?.original_name || filename;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

export default router;
