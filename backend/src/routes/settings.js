import express from 'express';
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

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

export default router;
