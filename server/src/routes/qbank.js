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

const UPLOAD_DIR = path.join(__dirname, '../../uploads/qbank');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

const removeFile = (filename) => {
  if (!filename) return;
  try { const fp = path.join(UPLOAD_DIR, filename); if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch {}
};

/* ─── Bulk MCQ text parser ─── */
function parseBulkMCQ(text) {
  const questions = [];
  const blocks = text.split(/\n(?=\d+[.):\s])/);
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const qLine = lines[0].replace(/^\d+[.):\s]+/, '').trim();
    const opts = {};
    let answer = '', explanation = '', isExpl = false;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const optMatch = line.match(/^([ABCDabcd])[.):\s]\s*(.+)/);
      if (optMatch) { opts[optMatch[1].toLowerCase()] = optMatch[2].trim(); isExpl = false; continue; }
      const ansMatch = line.match(/^(?:answer|ans|correct)[:\s]+([ABCDabcd])/i);
      if (ansMatch) { answer = ansMatch[1].toLowerCase(); isExpl = false; continue; }
      if (/^(?:explanation|exp|reason)[:\s]/i.test(line)) { explanation = line.replace(/^(?:explanation|exp|reason)[:\s]+/i, '').trim(); isExpl = true; continue; }
      if (isExpl) explanation += ' ' + line;
    }
    if (qLine && opts.a && opts.b && opts.c && opts.d && answer) {
      questions.push({ question: qLine, option_a: opts.a, option_b: opts.b, option_c: opts.c, option_d: opts.d, correct_option: answer, explanation: explanation.trim() });
    }
  }
  return questions;
}

/* ── Settings ── */
router.get('/settings', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM qbank_settings WHERE id=1'); res.json(r.rows[0] || { qbank_visible: true }); }
  catch { res.status(500).json({ error: 'Failed to fetch settings' }); }
});
router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try { const r = await pool.query('UPDATE qbank_settings SET qbank_visible=$1, updated_at=NOW() WHERE id=1 RETURNING *', [req.body.qbank_visible]); res.json(r.rows[0]); }
  catch { res.status(500).json({ error: 'Failed to update settings' }); }
});

/* ── Levels ── */
router.get('/levels', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM qbank_levels ORDER BY order_index, created_at')).rows); }
  catch { res.status(500).json({ error: 'Failed to fetch levels' }); }
});
router.post('/levels', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
    const r = await pool.query('INSERT INTO qbank_levels (name,description,icon,order_index) VALUES ($1,$2,$3,$4) RETURNING *', [name.trim(), description||'', icon||'📝', order_index||0]);
    res.json(r.rows[0]);
  } catch (e) { if (e.code==='23505') return res.status(400).json({ error: 'Name exists' }); res.status(500).json({ error: 'Failed to create level' }); }
});
router.put('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query('UPDATE qbank_levels SET name=$1,description=$2,icon=$3,order_index=$4,is_visible=$5 WHERE id=$6 RETURNING *', [name, description||'', icon||'📝', order_index||0, is_visible!==false, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update level' }); }
});
router.delete('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const files = await pool.query(`SELECT qc.filename FROM qbank_contents qc JOIN qbank_chapters qch ON qch.id=qc.chapter_id JOIN qbank_subjects qs ON qs.id=qch.subject_id WHERE qs.level_id=$1 AND qc.filename IS NOT NULL`, [req.params.id]);
    files.rows.forEach(r => removeFile(r.filename));
    await pool.query('DELETE FROM qbank_levels WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete level' }); }
});

/* ── Subjects ── */
router.get('/levels/:id/subjects', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM qbank_subjects WHERE level_id=$1 ORDER BY order_index, created_at', [req.params.id])).rows); }
  catch { res.status(500).json({ error: 'Failed to fetch subjects' }); }
});
router.post('/subjects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level_id, name, description, icon, order_index } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
    const r = await pool.query('INSERT INTO qbank_subjects (level_id,name,description,icon,order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *', [level_id, name.trim(), description||'', icon||'📚', order_index||0]);
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to create subject' }); }
});
router.put('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query('UPDATE qbank_subjects SET name=$1,description=$2,icon=$3,order_index=$4,is_visible=$5 WHERE id=$6 RETURNING *', [name, description||'', icon||'📚', order_index||0, is_visible!==false, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update subject' }); }
});
router.delete('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const files = await pool.query(`SELECT qc.filename FROM qbank_contents qc JOIN qbank_chapters qch ON qch.id=qc.chapter_id WHERE qch.subject_id=$1 AND qc.filename IS NOT NULL`, [req.params.id]);
    files.rows.forEach(r => removeFile(r.filename));
    await pool.query('DELETE FROM qbank_subjects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete subject' }); }
});

/* ── Chapters ── */
router.get('/subjects/:id/chapters', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT qch.*,
        COALESCE(json_agg(json_build_object('type',qc.content_type,'visible',qc.is_visible)) FILTER (WHERE qc.id IS NOT NULL), '[]') AS contents
      FROM qbank_chapters qch
      LEFT JOIN qbank_contents qc ON qc.chapter_id = qch.id
      WHERE qch.subject_id=$1
      GROUP BY qch.id ORDER BY qch.order_index, qch.created_at`, [req.params.id]);
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed to fetch chapters' }); }
});
router.post('/chapters', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, title, description, order_index } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
    const r = await pool.query('INSERT INTO qbank_chapters (subject_id,title,description,order_index) VALUES ($1,$2,$3,$4) RETURNING *', [subject_id, title.trim(), description||'', order_index||0]);
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to create chapter' }); }
});
router.put('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, order_index, is_visible } = req.body;
    const r = await pool.query('UPDATE qbank_chapters SET title=$1,description=$2,order_index=$3,is_visible=$4 WHERE id=$5 RETURNING *', [title, description||'', order_index||0, is_visible!==false, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update chapter' }); }
});
router.delete('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const files = await pool.query('SELECT filename FROM qbank_contents WHERE chapter_id=$1 AND filename IS NOT NULL', [req.params.id]);
    files.rows.forEach(r => removeFile(r.filename));
    await pool.query('DELETE FROM qbank_chapters WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete chapter' }); }
});

/* ── Contents ── */
router.get('/chapters/:id/contents', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM qbank_contents WHERE chapter_id=$1 ORDER BY content_type', [req.params.id]);
    const map = {};
    r.rows.forEach(row => { map[row.content_type] = row; });
    res.json(map);
  } catch { res.status(500).json({ error: 'Failed to fetch contents' }); }
});

router.put('/chapters/:id/contents/:type', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_visible, text_content } = req.body;
    const { id: chapterId, type } = req.params;
    const existing = await pool.query('SELECT * FROM qbank_contents WHERE chapter_id=$1 AND content_type=$2', [chapterId, type]);
    if (!existing.rows.length) {
      const r = await pool.query('INSERT INTO qbank_contents (chapter_id,content_type,is_visible,text_content,updated_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *', [chapterId, type, is_visible!==false, text_content||null]);
      return res.json(r.rows[0]);
    }
    const r = await pool.query('UPDATE qbank_contents SET is_visible=$1, text_content=COALESCE($2,text_content), updated_at=NOW() WHERE chapter_id=$3 AND content_type=$4 RETURNING *', [is_visible!==false, text_content||null, chapterId, type]);
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to save content' }); }
});

router.post('/chapters/:id/contents/:type/upload', authenticate, requireAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file' });
    const { id: chapterId, type } = req.params;
    const isVisible = req.body.is_visible !== 'false';
    const existing = await pool.query('SELECT * FROM qbank_contents WHERE chapter_id=$1 AND content_type=$2', [chapterId, type]);
    if (existing.rows.length && existing.rows[0].filename) removeFile(existing.rows[0].filename);
    let r;
    if (!existing.rows.length) {
      r = await pool.query('INSERT INTO qbank_contents (chapter_id,content_type,is_visible,filename,original_name,file_size,updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *', [chapterId, type, isVisible, req.file.filename, req.file.originalname, req.file.size]);
    } else {
      r = await pool.query('UPDATE qbank_contents SET is_visible=$1,filename=$2,original_name=$3,file_size=$4,updated_at=NOW() WHERE chapter_id=$5 AND content_type=$6 RETURNING *', [isVisible, req.file.filename, req.file.originalname, req.file.size, chapterId, type]);
    }
    res.json(r.rows[0]);
  } catch { if (req.file) removeFile(req.file.filename); res.status(500).json({ error: 'Failed to upload PDF' }); }
});

router.delete('/chapters/:id/contents/:type', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id: chapterId, type } = req.params;
    const existing = await pool.query('SELECT filename FROM qbank_contents WHERE chapter_id=$1 AND content_type=$2', [chapterId, type]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
    removeFile(existing.rows[0].filename);
    if (type === 'mcq') await pool.query('DELETE FROM qbank_mcqs WHERE chapter_id=$1', [chapterId]);
    await pool.query('DELETE FROM qbank_contents WHERE chapter_id=$1 AND content_type=$2', [chapterId, type]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete content' }); }
});

/* ── MCQs ── */
router.get('/chapters/:id/mcqs', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM qbank_mcqs WHERE chapter_id=$1 ORDER BY order_index, created_at', [req.params.id])).rows); }
  catch { res.status(500).json({ error: 'Failed to fetch MCQs' }); }
});

router.post('/chapters/:id/mcqs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'Question required' });
    const maxOrder = await pool.query('SELECT COALESCE(MAX(order_index),0)+1 AS n FROM qbank_mcqs WHERE chapter_id=$1', [req.params.id]);
    const r = await pool.query(
      'INSERT INTO qbank_mcqs (chapter_id,question,option_a,option_b,option_c,option_d,correct_option,explanation,order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [req.params.id, question.trim(), option_a||'', option_b||'', option_c||'', option_d||'', correct_option?.toLowerCase()||'a', explanation||'', maxOrder.rows[0].n]
    );
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to add MCQ' }); }
});

router.put('/mcqs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
    const r = await pool.query(
      'UPDATE qbank_mcqs SET question=$1,option_a=$2,option_b=$3,option_c=$4,option_d=$5,correct_option=$6,explanation=$7 WHERE id=$8 RETURNING *',
      [question, option_a, option_b, option_c, option_d, correct_option?.toLowerCase()||'a', explanation||'', req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed to update MCQ' }); }
});

router.delete('/mcqs/:id', authenticate, requireAdmin, async (req, res) => {
  try { await pool.query('DELETE FROM qbank_mcqs WHERE id=$1', [req.params.id]); res.json({ success: true }); }
  catch { res.status(500).json({ error: 'Failed to delete MCQ' }); }
});

router.post('/chapters/:id/mcqs/bulk', authenticate, requireAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'No text provided' });
    const parsed = parseBulkMCQ(text);
    if (!parsed.length) return res.status(400).json({ error: 'No valid MCQs found. Check format.' });
    let nextOrder = ((await pool.query('SELECT COALESCE(MAX(order_index),0) AS m FROM qbank_mcqs WHERE chapter_id=$1', [req.params.id])).rows[0].m || 0) + 1;
    const inserted = [];
    for (const q of parsed) {
      const r = await pool.query(
        'INSERT INTO qbank_mcqs (chapter_id,question,option_a,option_b,option_c,option_d,correct_option,explanation,order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        [req.params.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation, nextOrder++]
      );
      inserted.push(r.rows[0]);
    }
    res.json({ inserted: inserted.length, mcqs: inserted });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to import MCQs' }); }
});

/* ── Serve PDF ── */
router.get('/file/:filename', async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    const row = await pool.query('SELECT original_name FROM qbank_contents WHERE filename=$1', [filename]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(row.rows[0]?.original_name || filename)}"`);
    res.sendFile(filePath);
  } catch { res.status(500).json({ error: 'Failed to serve file' }); }
});

export default router;
