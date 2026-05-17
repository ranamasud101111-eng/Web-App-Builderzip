import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/modules', async (req, res) => {
  try {
    const [c, f, s, q] = await Promise.all([
      pool.query('SELECT classes_visible    FROM class_settings     WHERE id = 1'),
      pool.query('SELECT flashcards_visible FROM flashcard_settings WHERE id = 1'),
      pool.query('SELECT shortnotes_visible FROM shortnote_settings WHERE id = 1'),
      pool.query('SELECT qbank_visible      FROM qbank_settings     WHERE id = 1'),
    ]);
    res.json({
      classes:    c.rows[0]?.classes_visible    ?? true,
      flashcards: f.rows[0]?.flashcards_visible ?? true,
      shortnotes: s.rows[0]?.shortnotes_visible ?? true,
      qbank:      q.rows[0]?.qbank_visible      ?? true,
    });
  } catch (err) {
    console.error('Module settings error:', err.message);
    res.json({ classes: true, flashcards: true, shortnotes: true, qbank: true });
  }
});

export default router;
