import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import pool from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/* ─── Smart MCQ Text Parser ─── */
function parseMCQText(text) {
  const results = [];
  const errors = [];

  // Normalize line endings and clean text
  const normalized = text
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/\u2019/g, "'").replace(/\u201c/g, '"').replace(/\u201d/g, '"')
    .replace(/\u00a0/g, ' ');

  // Split into question blocks - various delimiters
  const blocks = normalized.split(/\n\s*\n+/).filter(b => b.trim().length > 10);

  // Also try single-line splits if blocks are too few
  const useBlocks = blocks.length >= 1 ? blocks : [normalized];

  for (let rawBlock of useBlocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    try {
      const mcq = parseBlock(block);
      if (mcq) results.push(mcq);
    } catch (e) {
      errors.push(`Parse error: ${e.message} in block: "${block.substring(0, 60)}..."`);
    }
  }

  // If block parsing yielded few results, try line-by-line parsing
  if (results.length === 0) {
    return parseLineByLine(normalized);
  }

  return { questions: results, errors };
}

function parseBlock(block) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 5) return null;

  let question = '';
  let options = {};
  let correctAnswer = '';
  let explanation = '';
  let questionDone = false;
  let explanationLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Option pattern: A) B) C) D) or A. B. C. D. or (A) (B) (C) (D) or a) b) c) d)
    const optionMatch = line.match(/^[\(\[]?\s*([A-Da-d])\s*[\)\]\.]\s*(.+)$/);
    if (optionMatch) {
      options[optionMatch[1].toUpperCase()] = optionMatch[2].trim();
      questionDone = true;
      continue;
    }

    // Answer line: Answer: A / Correct: B / Ans: C / Answer: (A)
    const answerMatch = line.match(/^(?:answer|correct\s*answer|ans|correct|key)\s*[:\-=]\s*[\(\[]?\s*([A-Da-d])\s*[\)\]]?/i);
    if (answerMatch) {
      correctAnswer = answerMatch[1].toUpperCase();
      continue;
    }

    // Explanation line
    const explMatch = line.match(/^(?:explanation|rationale|solution|reason|hint)\s*[:\-]\s*(.*)$/i);
    if (explMatch) {
      explanationLines = [explMatch[1]];
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j];
        if (!next.match(/^(?:answer|correct|ans|key)\s*[:\-]/i)) explanationLines.push(next);
        else break;
      }
      break;
    }

    // Question text
    if (!questionDone) {
      // Remove leading Q1. Q. 1. 1) numbering
      const cleaned = line.replace(/^(?:Q\.?\d*[\.\):\s]*|\d+[\.\)\s]+)/, '').trim();
      question += (question ? ' ' : '') + cleaned;
    }
  }

  if (!question || Object.keys(options).length < 4 || !correctAnswer) return null;

  return {
    question: question.trim(),
    option_a: options['A'] || '',
    option_b: options['B'] || '',
    option_c: options['C'] || '',
    option_d: options['D'] || '',
    correct_option: correctAnswer,
    explanation: explanationLines.join(' ').trim(),
  };
}

function parseLineByLine(text) {
  const results = [];
  const errors = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let current = null;
  let optCount = 0;
  let explanationNext = false;

  const flush = () => {
    if (current && current.question && optCount >= 4 && current.correct_option) {
      results.push({ ...current });
    }
    current = null; optCount = 0; explanationNext = false;
  };

  for (const line of lines) {
    // New question: starts with Q, number, or is clearly a question
    const qMatch = line.match(/^(?:Q\.?\s*\d+[\.\):\s]+|Q[\.\):\s]+|\d+[\.\)\s]+)(.+)/i);
    const isOption = line.match(/^[\(\[]?\s*([A-Da-d])\s*[\)\]\.]\s*/);
    const isAnswer = line.match(/^(?:answer|correct|ans|key)\s*[:\-=]\s*[\(\[]?\s*([A-Da-d])/i);
    const isExpl = line.match(/^(?:explanation|rationale|solution)\s*[:\-]\s*(.*)/i);

    if (qMatch && !isOption) {
      flush();
      current = { question: qMatch[1].trim(), option_a: '', option_b: '', option_c: '', option_d: '', correct_option: '', explanation: '' };
      continue;
    }

    if (!current) continue;

    if (isOption) {
      const key = isOption[1].toUpperCase();
      const val = line.replace(/^[\(\[]?\s*[A-Da-d]\s*[\)\]\.]\s*/, '').trim();
      if (key === 'A') current.option_a = val;
      else if (key === 'B') current.option_b = val;
      else if (key === 'C') current.option_c = val;
      else if (key === 'D') current.option_d = val;
      optCount++;
      explanationNext = false;
      continue;
    }

    if (isAnswer) {
      current.correct_option = isAnswer[1].toUpperCase();
      continue;
    }

    if (isExpl) {
      current.explanation = isExpl[1].trim();
      explanationNext = true;
      continue;
    }

    // Continuation of explanation
    if (explanationNext && current.explanation !== undefined) {
      current.explanation += ' ' + line;
    } else if (current.question && !optCount) {
      // Continuation of question
      current.question += ' ' + line;
    }
  }

  flush();
  return { questions: results, errors };
}

/* ─── GET /api/mcqs/chapter/:chapterId ─── */
router.get('/chapter/:chapterId', authenticate, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { mode } = req.query; // practice, quiz, exam

    // Quiz mode: max 10 questions randomly selected
    if (mode === 'quiz') {
      const result = await pool.query(
        `SELECT id, question, option_a, option_b, option_c, option_d,
                correct_option, explanation, difficulty, order_index
         FROM mcqs
         WHERE chapter_id = $1 AND is_active = true
         ORDER BY RANDOM()
         LIMIT 10`,
        [chapterId]
      );
      return res.json({ questions: result.rows, total: result.rows.length });
    }

    const result = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d,
              correct_option, explanation, difficulty, order_index
       FROM mcqs
       WHERE chapter_id = $1 AND is_active = true
       ORDER BY order_index ASC, id ASC`,
      [chapterId]
    );

    // For exam mode, don't send correct answers
    if (mode === 'exam') {
      const questions = result.rows.map(({ correct_option, explanation, ...q }) => q);
      return res.json({ questions, total: result.rows.length });
    }

    res.json({ questions: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch MCQs' });
  }
});

/* ─── GET /api/mcqs/bookmarks ─── */
router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.question, m.option_a, m.option_b, m.option_c, m.option_d,
              m.correct_option, m.explanation, m.difficulty,
              s.name as subject_name, c.title as chapter_title,
              mb.created_at as bookmarked_at
       FROM mcq_bookmarks mb
       JOIN mcqs m ON mb.mcq_id = m.id
       LEFT JOIN subjects s ON m.subject_id = s.id
       LEFT JOIN chapters c ON m.chapter_id = c.id
       WHERE mb.user_id = $1
       ORDER BY mb.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

/* ─── POST /api/mcqs/bookmarks/:mcqId ─── */
router.post('/bookmarks/:mcqId', authenticate, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO mcq_bookmarks (user_id, mcq_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.mcqId]
    );
    res.json({ bookmarked: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bookmark' });
  }
});

/* ─── DELETE /api/mcqs/bookmarks/:mcqId ─── */
router.delete('/bookmarks/:mcqId', authenticate, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM mcq_bookmarks WHERE user_id = $1 AND mcq_id = $2`,
      [req.user.id, req.params.mcqId]
    );
    res.json({ bookmarked: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

/* ─── POST /api/mcqs/sessions ─── */
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const { chapter_id, subject_id, mode, total_questions, time_limit_seconds } = req.body;
    const result = await pool.query(
      `INSERT INTO mcq_sessions (user_id, chapter_id, subject_id, mode, total_questions, time_limit_seconds, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *`,
      [req.user.id, chapter_id, subject_id, mode, total_questions, time_limit_seconds || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/* ─── PUT /api/mcqs/sessions/:id/answer ─── */
router.put('/sessions/:id/answer', authenticate, async (req, res) => {
  try {
    const { mcq_id, selected_option, time_taken_seconds } = req.body;
    const sessionId = req.params.id;

    // Get correct answer
    const mcq = await pool.query('SELECT correct_option FROM mcqs WHERE id = $1', [mcq_id]);
    if (!mcq.rows.length) return res.status(404).json({ error: 'MCQ not found' });

    const is_correct = mcq.rows[0].correct_option === selected_option;

    await pool.query(
      `INSERT INTO mcq_session_answers (session_id, mcq_id, selected_option, is_correct, time_taken_seconds)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (session_id, mcq_id) DO UPDATE
       SET selected_option = $3, is_correct = $4, time_taken_seconds = $5`,
      [sessionId, mcq_id, selected_option, is_correct, time_taken_seconds || 0]
    );

    // Update session counts
    await pool.query(
      `UPDATE mcq_sessions SET
         answered = (SELECT COUNT(*) FROM mcq_session_answers WHERE session_id = $1 AND selected_option IS NOT NULL),
         correct = (SELECT COUNT(*) FROM mcq_session_answers WHERE session_id = $1 AND is_correct = true),
         wrong = (SELECT COUNT(*) FROM mcq_session_answers WHERE session_id = $1 AND is_correct = false)
       WHERE id = $1`,
      [sessionId]
    );

    res.json({ is_correct, correct_option: mcq.rows[0].correct_option });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record answer' });
  }
});

/* ─── PUT /api/mcqs/sessions/:id/complete ─── */
router.put('/sessions/:id/complete', authenticate, async (req, res) => {
  try {
    const { time_taken_seconds, status } = req.body;
    const result = await pool.query(
      `UPDATE mcq_sessions SET
         status = $2,
         time_taken_seconds = $3,
         score_percent = CASE WHEN total_questions > 0 THEN ROUND((correct::numeric / total_questions) * 100, 2) ELSE 0 END,
         completed_at = NOW()
       WHERE id = $1 AND user_id = $4
       RETURNING *`,
      [req.params.id, status || 'completed', time_taken_seconds || 0, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

/* ─── GET /api/mcqs/sessions/history ─── */
router.get('/sessions/history', authenticate, async (req, res) => {
  try {
    const { chapter_id } = req.query;
    const query = chapter_id
      ? `SELECT s.*, c.title as chapter_title, sub.name as subject_name
         FROM mcq_sessions s LEFT JOIN chapters c ON s.chapter_id = c.id LEFT JOIN subjects sub ON s.subject_id = sub.id
         WHERE s.user_id = $1 AND s.chapter_id = $2 ORDER BY s.created_at DESC LIMIT 20`
      : `SELECT s.*, c.title as chapter_title, sub.name as subject_name
         FROM mcq_sessions s LEFT JOIN chapters c ON s.chapter_id = c.id LEFT JOIN subjects sub ON s.subject_id = sub.id
         WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 50`;
    const args = chapter_id ? [req.user.id, chapter_id] : [req.user.id];
    const result = await pool.query(query, args);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/* ─── GET /api/mcqs/sessions/:id ─── */
router.get('/sessions/:id', authenticate, async (req, res) => {
  try {
    const session = await pool.query('SELECT * FROM mcq_sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

    const answers = await pool.query(
      `SELECT sa.*, m.question, m.option_a, m.option_b, m.option_c, m.option_d, m.correct_option, m.explanation
       FROM mcq_session_answers sa JOIN mcqs m ON sa.mcq_id = m.id
       WHERE sa.session_id = $1`,
      [req.params.id]
    );

    res.json({ session: session.rows[0], answers: answers.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/* ─── ADMIN: POST /api/mcqs/quiz-template ─── */
router.post('/quiz-template', authenticate, requireAdmin, async (req, res) => {
  try {
    const { chapter_id, mcq_ids, title } = req.body;
    if (!chapter_id || !mcq_ids || !Array.isArray(mcq_ids) || mcq_ids.length === 0)
      return res.status(400).json({ error: 'chapter_id and mcq_ids are required' });
    if (mcq_ids.length > 10)
      return res.status(400).json({ error: 'Maximum 10 MCQs per quiz template' });

    // Create quiz_templates table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_templates (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        mcq_ids INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(chapter_id)
      )
    `);

    const result = await pool.query(`
      INSERT INTO quiz_templates (chapter_id, title, mcq_ids)
      VALUES ($1, $2, $3)
      ON CONFLICT (chapter_id) DO UPDATE SET title = EXCLUDED.title, mcq_ids = EXCLUDED.mcq_ids, created_at = NOW()
      RETURNING *
    `, [chapter_id, title || 'Chapter Quiz', mcq_ids]);

    res.json({ success: true, template: result.rows[0] });
  } catch (err) {
    console.error('Quiz template error:', err.message);
    res.status(500).json({ error: 'Failed to save quiz template' });
  }
});

/* ─── ADMIN: GET /api/mcqs ─── */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { chapter_id, subject_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const args = [];
    if (chapter_id) { args.push(chapter_id); where += ` AND m.chapter_id = $${args.length}`; }
    if (subject_id) { args.push(subject_id); where += ` AND m.subject_id = $${args.length}`; }
    args.push(limit); args.push(offset);

    const result = await pool.query(
      `SELECT m.*, s.name as subject_name, c.title as chapter_title
       FROM mcqs m
       LEFT JOIN subjects s ON m.subject_id = s.id
       LEFT JOIN chapters c ON m.chapter_id = c.id
       ${where}
       ORDER BY m.chapter_id, m.order_index, m.id
       LIMIT $${args.length - 1} OFFSET $${args.length}`,
      args
    );

    const countArgs = args.slice(0, -2);
    const count = await pool.query(
      `SELECT COUNT(*) FROM mcqs m ${where}`, countArgs
    );

    res.json({ mcqs: result.rows, total: parseInt(count.rows[0].count), page: parseInt(page) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch MCQs' });
  }
});

/* ─── ADMIN: POST /api/mcqs ─── */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, chapter_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, order_index } = req.body;
    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_option)
      return res.status(400).json({ error: 'Missing required fields' });

    const result = await pool.query(
      `INSERT INTO mcqs (subject_id, chapter_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [subject_id, chapter_id, question, option_a, option_b, option_c, option_d, correct_option.toUpperCase(), explanation || '', difficulty || 'medium', order_index || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create MCQ' });
  }
});

/* ─── ADMIN: PUT /api/mcqs/:id ─── */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, is_active, order_index, subject_id, chapter_id } = req.body;
    const result = await pool.query(
      `UPDATE mcqs SET
         subject_id = COALESCE($2, subject_id),
         chapter_id = COALESCE($3, chapter_id),
         question = COALESCE($4, question),
         option_a = COALESCE($5, option_a), option_b = COALESCE($6, option_b),
         option_c = COALESCE($7, option_c), option_d = COALESCE($8, option_d),
         correct_option = COALESCE($9, correct_option),
         explanation = COALESCE($10, explanation),
         difficulty = COALESCE($11, difficulty),
         is_active = COALESCE($12, is_active),
         order_index = COALESCE($13, order_index),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id, subject_id, chapter_id, question, option_a, option_b, option_c, option_d, correct_option?.toUpperCase(), explanation, difficulty, is_active, order_index]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'MCQ not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update MCQ' });
  }
});

/* ─── ADMIN: DELETE /api/mcqs/:id ─── */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM mcqs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete MCQ' });
  }
});

/* ─── ADMIN: POST /api/mcqs/bulk-import/parse ─── (preview before save) */
router.post('/bulk-import/parse', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    let text = '';

    if (req.file) {
      const mime = req.file.mimetype;
      if (mime === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
        const parsed = await pdfParse(req.file.buffer);
        text = parsed.text;
      } else if (
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        req.file.originalname.endsWith('.docx')
      ) {
        const parsed = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = parsed.value;
      } else {
        text = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.text) {
      text = req.body.text;
    } else {
      return res.status(400).json({ error: 'No text or file provided' });
    }

    const { questions, errors } = parseMCQText(text);
    res.json({ questions, errors, total_parsed: questions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to parse: ' + err.message });
  }
});

/* ─── ADMIN: POST /api/mcqs/bulk-import/save ─── (save after preview) */
router.post('/bulk-import/save', authenticate, requireAdmin, async (req, res) => {
  try {
    const { questions, subject_id, chapter_id, source_type, filename } = req.body;
    if (!questions?.length) return res.status(400).json({ error: 'No questions to import' });

    const client = await pool.connect();
    let imported = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      for (const q of questions) {
        try {
          if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_option) {
            errors.push(`Skipped: "${(q.question || '').substring(0, 40)}" — missing fields`);
            continue;
          }
          await client.query(
            `INSERT INTO mcqs (subject_id, chapter_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [subject_id, chapter_id, q.question, q.option_a, q.option_b, q.option_c, q.option_d,
             q.correct_option.toUpperCase(), q.explanation || '', q.difficulty || 'medium']
          );
          imported++;
        } catch (e) {
          errors.push(`Failed: "${(q.question || '').substring(0, 40)}" — ${e.message}`);
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Log import history
    await pool.query(
      `INSERT INTO mcq_import_history (admin_id, filename, source_type, total_parsed, total_imported, errors, status)
       VALUES ($1,$2,$3,$4,$5,$6,'completed')`,
      [req.user.id, filename || 'text_paste', source_type || 'text', questions.length, imported, errors]
    );

    res.json({ imported, errors, total: questions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save: ' + err.message });
  }
});

/* ─── ADMIN: GET /api/mcqs/import-history ─── */
router.get('/import-history', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*, u.name as admin_name FROM mcq_import_history h LEFT JOIN users u ON h.admin_id = u.id ORDER BY h.created_at DESC LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/* ─── GET /api/mcqs/wrong-answers ─── */
router.get('/wrong-answers', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (msa.mcq_id)
         m.id, m.question, m.option_a, m.option_b, m.option_c, m.option_d,
         m.correct_option, m.explanation, m.difficulty,
         msa.selected_option as my_answer,
         s.name as subject_name, s.class_level as level, s.id as subject_id, s.color as subject_color, s.icon as subject_icon,
         c.title as chapter_title, c.id as chapter_id,
         ms.created_at as attempted_at
       FROM mcq_session_answers msa
       JOIN mcq_sessions ms ON msa.session_id = ms.id
       JOIN mcqs m ON msa.mcq_id = m.id
       LEFT JOIN subjects s ON m.subject_id = s.id
       LEFT JOIN chapters c ON m.chapter_id = c.id
       WHERE ms.user_id = $1 AND msa.is_correct = false AND msa.selected_option IS NOT NULL
       ORDER BY msa.mcq_id, ms.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wrong answers' });
  }
});

/* ─── POST /api/mcqs/custom-exam/generate ─── */
router.post('/custom-exam/generate', authenticate, async (req, res) => {
  try {
    const { level, subject_ids, chapter_ids, question_count, duration_minutes } = req.body;
    if (!question_count || question_count < 1) return res.status(400).json({ error: 'Invalid question count' });

    let whereClause = 'WHERE m.is_active = true';
    const args = [];

    if (chapter_ids && chapter_ids.length > 0) {
      args.push(chapter_ids);
      whereClause += ` AND m.chapter_id = ANY($${args.length})`;
    } else if (subject_ids && subject_ids.length > 0) {
      args.push(subject_ids);
      whereClause += ` AND m.subject_id = ANY($${args.length})`;
    } else if (level) {
      args.push(level);
      whereClause += ` AND s.class_level = $${args.length}`;
    }

    args.push(parseInt(question_count));
    const result = await pool.query(
      `SELECT m.id, m.question, m.option_a, m.option_b, m.option_c, m.option_d,
              m.difficulty, m.chapter_id, m.subject_id,
              s.name as subject_name, s.class_level as level,
              c.title as chapter_title
       FROM mcqs m
       LEFT JOIN subjects s ON m.subject_id = s.id
       LEFT JOIN chapters c ON m.chapter_id = c.id
       ${whereClause}
       ORDER BY RANDOM()
       LIMIT $${args.length}`,
      args
    );

    if (!result.rows.length) return res.status(404).json({ error: 'No questions found for the selected criteria' });

    const sessionArgs = [req.user.id, level || null, subject_ids?.[0] || null, chapter_ids?.[0] || null, result.rows.length, (duration_minutes || 30) * 60];
    const session = await pool.query(
      `INSERT INTO mcq_sessions (user_id, subject_id, chapter_id, mode, total_questions, time_limit_seconds, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *`,
      [req.user.id, subject_ids?.[0] || null, chapter_ids?.[0] || null, 'custom', result.rows.length, (duration_minutes || 30) * 60]
    );

    await pool.query(
      `INSERT INTO custom_exams (user_id, level, subject_ids, chapter_ids, question_count, duration_minutes, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.id, level || null, subject_ids || [], chapter_ids || [], question_count, duration_minutes || 30, session.rows[0].id]
    );

    res.json({
      session_id: session.rows[0].id,
      questions: result.rows,
      total: result.rows.length,
      duration_minutes: duration_minutes || 30,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate custom exam: ' + err.message });
  }
});

/* ─── GET /api/mcqs/levels ─── (distinct levels from subjects) */
router.get('/levels', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT class_level as level, COUNT(*) as subject_count
       FROM subjects WHERE class_level IS NOT NULL AND class_level != ''
       GROUP BY class_level ORDER BY class_level`
    );
    const ordered = ['Certificate', 'Professional', 'Advanced'];
    const rows = result.rows.sort((a, b) => {
      const ai = ordered.indexOf(a.level);
      const bi = ordered.indexOf(b.level);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

/* ─── GET /api/mcqs/stats/chapter/:id ─── */
router.get('/stats/chapter/:id', authenticate, async (req, res) => {
  try {
    const count = await pool.query('SELECT COUNT(*) FROM mcqs WHERE chapter_id = $1 AND is_active = true', [req.params.id]);
    const sessions = await pool.query(
      `SELECT mode, COUNT(*) as count, AVG(score_percent) as avg_score
       FROM mcq_sessions WHERE chapter_id = $1 AND user_id = $2 AND status = 'completed'
       GROUP BY mode`,
      [req.params.id, req.user.id]
    );
    res.json({ question_count: parseInt(count.rows[0].count), sessions: sessions.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
