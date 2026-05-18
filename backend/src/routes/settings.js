import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_FEATURES = [
  'All ICAB subjects unlocked',
  'Unlimited MCQ practice',
  'Full mock exam access',
  'Deep analytics & insights',
  'Wrong answer review',
  'Flash cards & short notes',
  'Priority support',
];

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pricing_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        premium_visible BOOLEAN DEFAULT FALSE,
        premium_price INTEGER DEFAULT 499,
        premium_features JSONB DEFAULT '${JSON.stringify(DEFAULT_FEATURES)}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      INSERT INTO pricing_settings (id, premium_visible, premium_price, premium_features)
      VALUES (1, false, 499, '${JSON.stringify(DEFAULT_FEATURES)}'::jsonb)
      ON CONFLICT (id) DO NOTHING
    `);
  } catch {}
})();

router.get('/modules', async (req, res) => {
  try {
    const [c, f, s, q, p] = await Promise.all([
      pool.query('SELECT classes_visible    FROM class_settings     WHERE id = 1'),
      pool.query('SELECT flashcards_visible FROM flashcard_settings WHERE id = 1'),
      pool.query('SELECT shortnotes_visible FROM shortnote_settings WHERE id = 1'),
      pool.query('SELECT qbank_visible      FROM qbank_settings     WHERE id = 1'),
      pool.query('SELECT progress_tracker_visible, show_level_progress, show_subject_progress, show_chapter_progress, show_mcq_progress, show_exam_progress, show_quiz_progress FROM progress_tracker_settings WHERE id = 1'),
    ]);
    const pt = p.rows[0] ?? {};
    res.json({
      classes:    c.rows[0]?.classes_visible    ?? true,
      flashcards: f.rows[0]?.flashcards_visible ?? true,
      shortnotes: s.rows[0]?.shortnotes_visible ?? true,
      qbank:      q.rows[0]?.qbank_visible      ?? true,
      progressTracker: pt.progress_tracker_visible ?? true,
      progressSections: {
        levelProgress:   pt.show_level_progress   ?? true,
        subjectProgress: pt.show_subject_progress ?? true,
        chapterProgress: pt.show_chapter_progress ?? true,
        mcqProgress:     pt.show_mcq_progress     ?? true,
        examProgress:    pt.show_exam_progress    ?? true,
        quizProgress:    pt.show_quiz_progress    ?? true,
      },
    });
  } catch (err) {
    console.error('Module settings error:', err.message);
    res.json({
      classes: true, flashcards: true, shortnotes: true, qbank: true,
      progressTracker: true,
      progressSections: {
        levelProgress: true, subjectProgress: true, chapterProgress: true,
        mcqProgress: true, examProgress: true, quizProgress: true,
      },
    });
  }
});

router.put('/progress-tracker', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      progress_tracker_visible,
      show_level_progress,
      show_subject_progress,
      show_chapter_progress,
      show_mcq_progress,
      show_exam_progress,
      show_quiz_progress,
    } = req.body;
    await pool.query(`
      UPDATE progress_tracker_settings SET
        progress_tracker_visible = COALESCE($1, progress_tracker_visible),
        show_level_progress      = COALESCE($2, show_level_progress),
        show_subject_progress    = COALESCE($3, show_subject_progress),
        show_chapter_progress    = COALESCE($4, show_chapter_progress),
        show_mcq_progress        = COALESCE($5, show_mcq_progress),
        show_exam_progress       = COALESCE($6, show_exam_progress),
        show_quiz_progress       = COALESCE($7, show_quiz_progress),
        updated_at               = NOW()
      WHERE id = 1
    `, [
      progress_tracker_visible ?? null,
      show_level_progress ?? null,
      show_subject_progress ?? null,
      show_chapter_progress ?? null,
      show_mcq_progress ?? null,
      show_exam_progress ?? null,
      show_quiz_progress ?? null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error('Progress tracker settings error:', err.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/pricing', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM pricing_settings WHERE id = 1');
    res.json(r.rows[0] ?? { premium_visible: false, premium_price: 499, premium_features: DEFAULT_FEATURES });
  } catch (err) {
    console.error('Pricing settings error:', err.message);
    res.json({ premium_visible: false, premium_price: 499, premium_features: DEFAULT_FEATURES });
  }
});

router.put('/pricing', authenticate, requireAdmin, async (req, res) => {
  try {
    const { premium_visible, premium_price, premium_features } = req.body;
    await pool.query(`
      UPDATE pricing_settings SET
        premium_visible  = COALESCE($1, premium_visible),
        premium_price    = COALESCE($2, premium_price),
        premium_features = COALESCE($3::jsonb, premium_features),
        updated_at       = NOW()
      WHERE id = 1
    `, [
      premium_visible ?? null,
      premium_price   ?? null,
      premium_features ? JSON.stringify(premium_features) : null,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update pricing error:', err.message);
    res.status(500).json({ error: 'Failed to update pricing settings' });
  }
});

export default router;
