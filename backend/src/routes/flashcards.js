import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/* ─── Text parser ─── */
function parseFlashCardText(text) {
  const cards = [];
  const t = text.replace(/\r\n/g, '\n').trim();

  // Format 1: Q: ... A: ...
  const qaRe = /Q\s*:\s*([\s\S]+?)\n\s*A\s*:\s*([\s\S]+?)(?=\n\s*Q\s*:|\s*$)/gi;
  let m;
  while ((m = qaRe.exec(t)) !== null) {
    const front = m[1].trim(); const back = m[2].trim();
    if (front && back) cards.push({ front, back });
  }
  if (cards.length) return cards;

  // Format 2: Front: ... Back: ...
  const fbRe = /Front\s*:\s*([\s\S]+?)\n\s*Back\s*:\s*([\s\S]+?)(?=\n\s*Front\s*:|\s*$)/gi;
  while ((m = fbRe.exec(t)) !== null) {
    const front = m[1].trim(); const back = m[2].trim();
    if (front && back) cards.push({ front, back });
  }
  if (cards.length) return cards;

  // Format 3: card blocks separated by === or ***, Q and A separated by ---
  const blocks = t.split(/\n\s*(?:={3,}|\*{3,})\s*\n/);
  for (const block of blocks) {
    const parts = block.split(/\n\s*-{3,}\s*\n/);
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      cards.push({ front: parts[0].trim(), back: parts[1].trim() });
    }
  }
  if (cards.length) return cards;

  // Format 4: alternating non-empty lines (odd = front, even = back)
  const lines = t.split('\n').map(l => l.trim()).filter(l => l && !l.match(/^\d+[\.\)]\s*$/));
  // Remove leading numbers like "1." "1)" from line starts
  const clean = lines.map(l => l.replace(/^\d+[\.\)]\s+/, ''));
  for (let i = 0; i + 1 < clean.length; i += 2) {
    if (clean[i] && clean[i + 1]) cards.push({ front: clean[i], back: clean[i + 1] });
  }
  return cards;
}

/* ─── Settings ─── */
router.get('/settings', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM flashcard_settings WHERE id = 1');
    res.json(r.rows[0] || { flashcards_visible: true });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { flashcards_visible } = req.body;
    const r = await pool.query(
      'UPDATE flashcard_settings SET flashcards_visible=$1, updated_at=NOW() WHERE id=1 RETURNING *',
      [flashcards_visible]
    );
    res.json(r.rows[0]);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

/* ─── Levels ─── */
router.get('/levels', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM flashcard_levels ORDER BY order_index, created_at');
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.post('/levels', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO flashcard_levels (name, description, icon, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, description || '', icon || '🃏', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE flashcard_levels SET name=$1, description=$2, icon=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '🃏', order_index || 0, is_visible !== false, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/levels/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM flashcard_levels WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

/* ─── Subjects ─── */
router.get('/levels/:id/subjects', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM flashcard_subjects WHERE level_id=$1 ORDER BY order_index, created_at',
      [req.params.id]
    );
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.post('/subjects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level_id, name, description, icon, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO flashcard_subjects (level_id, name, description, icon, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [level_id, name, description || '', icon || '📚', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE flashcard_subjects SET name=$1, description=$2, icon=$3, order_index=$4, is_visible=$5 WHERE id=$6 RETURNING *',
      [name, description || '', icon || '📚', order_index || 0, is_visible !== false, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/subjects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM flashcard_subjects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

/* ─── Chapters ─── */
router.get('/subjects/:id/chapters', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM flashcard_chapters WHERE subject_id=$1 ORDER BY order_index, created_at',
      [req.params.id]
    );
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.post('/chapters', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, name, description, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO flashcard_chapters (subject_id, name, description, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [subject_id, name, description || '', order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, order_index, is_visible } = req.body;
    const r = await pool.query(
      'UPDATE flashcard_chapters SET name=$1, description=$2, order_index=$3, is_visible=$4 WHERE id=$5 RETURNING *',
      [name, description || '', order_index || 0, is_visible !== false, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/chapters/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM flashcard_chapters WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

/* ─── Flash Cards ─── */
router.get('/chapters/:id/cards', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM flashcards WHERE chapter_id=$1 ORDER BY order_index, created_at',
      [req.params.id]
    );
    res.json(r.rows);
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.post('/cards', authenticate, requireAdmin, async (req, res) => {
  try {
    const { chapter_id, front, back, order_index } = req.body;
    const r = await pool.query(
      'INSERT INTO flashcards (chapter_id, front, back, order_index) VALUES ($1,$2,$3,$4) RETURNING *',
      [chapter_id, front, back, order_index || 0]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/cards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { front, back, order_index } = req.body;
    const r = await pool.query(
      'UPDATE flashcards SET front=$1, back=$2, order_index=$3 WHERE id=$4 RETURNING *',
      [front, back, order_index || 0, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM flashcards WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed' }); }
});

/* ─── Bulk import: parse pasted text ─── */
router.post('/parse-text', authenticate, requireAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'No text provided' });
    const cards = parseFlashCardText(text);
    res.json({ cards, count: cards.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─── Bulk import: parse uploaded PDF / DOCX ─── */
router.post('/parse-file', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let text = '';

    if (ext === 'pdf') {
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    } else if (ext === 'txt') {
      text = req.file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' });
    }

    const cards = parseFlashCardText(text);
    res.json({ cards, count: cards.length });
  } catch (e) {
    console.error('parse-file error:', e.message);
    res.status(500).json({ error: 'Failed to parse file: ' + e.message });
  }
});

/* ─── Bulk save cards to a chapter ─── */
router.post('/chapters/:id/bulk-import', authenticate, requireAdmin, async (req, res) => {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards) || !cards.length) return res.status(400).json({ error: 'No cards provided' });
    const chapterId = req.params.id;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (let i = 0; i < cards.length; i++) {
        const { front, back } = cards[i];
        if (front?.trim() && back?.trim()) {
          await client.query(
            'INSERT INTO flashcards (chapter_id, front, back, order_index) VALUES ($1,$2,$3,$4)',
            [chapterId, front.trim(), back.trim(), i]
          );
          inserted++;
        }
      }
      await client.query('COMMIT');
      res.json({ inserted });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
