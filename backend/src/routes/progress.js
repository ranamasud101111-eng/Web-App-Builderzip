import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-full-progress', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [
      levelRows,
      subjectRows,
      chapterRows,
      mcqRows,
      examRows,
      quizRows,
      recentQuizRows,
    ] = await Promise.all([
      // Level progress
      pool.query(`
        SELECT
          s.class_level,
          COUNT(DISTINCT c.id) AS total_chapters,
          COUNT(DISTINCT up.chapter_id) AS completed_chapters
        FROM subjects s
        JOIN chapters c ON c.subject_id = s.id
        LEFT JOIN user_progress up
          ON up.chapter_id = c.id AND up.user_id = $1 AND up.completed = TRUE
        WHERE s.class_level IS NOT NULL
        GROUP BY s.class_level
        ORDER BY s.class_level
      `, [userId]),

      // Subject progress
      pool.query(`
        SELECT
          s.id,
          s.name,
          s.icon,
          s.color,
          s.class_level,
          COUNT(DISTINCT c.id) AS total_chapters,
          COUNT(DISTINCT up.chapter_id) AS completed_chapters,
          (e.user_id IS NOT NULL) AS enrolled
        FROM subjects s
        LEFT JOIN chapters c ON c.subject_id = s.id
        LEFT JOIN user_progress up
          ON up.chapter_id = c.id AND up.user_id = $1 AND up.completed = TRUE
        LEFT JOIN enrollments e ON e.subject_id = s.id AND e.user_id = $1
        GROUP BY s.id, s.name, s.icon, s.color, s.class_level, e.user_id
        ORDER BY s.class_level, s.name
      `, [userId]),

      // Chapter progress (only for enrolled subjects)
      pool.query(`
        SELECT
          c.id,
          c.title,
          c.subject_id,
          s.name AS subject_name,
          s.icon AS subject_icon,
          s.color AS subject_color,
          s.class_level,
          COALESCE(up.completed, FALSE) AS completed,
          up.completed_at,
          (SELECT COUNT(*) FROM mcqs m WHERE m.chapter_id = c.id AND m.is_active = TRUE) AS total_mcqs
        FROM chapters c
        JOIN subjects s ON s.id = c.subject_id
        LEFT JOIN user_progress up ON up.chapter_id = c.id AND up.user_id = $1
        WHERE EXISTS (
          SELECT 1 FROM enrollments e WHERE e.subject_id = c.subject_id AND e.user_id = $1
        )
        ORDER BY s.class_level, s.name, c.order_index
      `, [userId]),

      // MCQ practice progress (practice mode only)
      pool.query(`
        SELECT
          COUNT(*) AS total_sessions,
          COALESCE(SUM(total_questions), 0) AS total_questions,
          COALESCE(SUM(correct), 0) AS total_correct,
          COALESCE(SUM(wrong), 0) AS total_wrong,
          COALESCE(SUM(answered), 0) AS total_answered,
          COALESCE(ROUND(AVG(score_percent)::numeric, 1), 0) AS avg_score,
          COALESCE(SUM(time_taken_seconds), 0) AS total_time_seconds
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed' AND mode = 'practice'
      `, [userId]),

      // Exam progress
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE mode = 'exam') AS mock_exams_taken,
          COUNT(*) FILTER (WHERE mode = 'custom') AS custom_exams_taken,
          COALESCE(MAX(score_percent), 0) AS best_score,
          COALESCE(ROUND(AVG(score_percent)::numeric, 1), 0) AS avg_score
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed' AND mode IN ('exam', 'custom')
      `, [userId]),

      // Quiz aggregate
      pool.query(`
        SELECT
          COUNT(*) AS total_quiz_attempts,
          COALESCE(ROUND(AVG(score_percent)::numeric, 1), 0) AS avg_quiz_score,
          COALESCE(MAX(score_percent), 0) AS best_quiz_score,
          COALESCE(SUM(time_taken_seconds), 0) AS total_quiz_time_seconds
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed' AND mode = 'quiz'
      `, [userId]),

      // Recent quiz sessions for chart
      pool.query(`
        SELECT
          id,
          score_percent,
          correct,
          wrong,
          total_questions,
          time_taken_seconds,
          created_at
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed' AND mode = 'quiz'
        ORDER BY created_at DESC
        LIMIT 15
      `, [userId]),
    ]);

    const levelProgress = levelRows.rows.map(r => ({
      level: r.class_level,
      totalChapters: parseInt(r.total_chapters),
      completedChapters: parseInt(r.completed_chapters),
      percentage: r.total_chapters > 0
        ? Math.round((r.completed_chapters / r.total_chapters) * 100)
        : 0,
    }));

    const subjectProgress = subjectRows.rows.map(r => ({
      id: r.id,
      name: r.name,
      icon: r.icon,
      color: r.color,
      classLevel: r.class_level,
      totalChapters: parseInt(r.total_chapters),
      completedChapters: parseInt(r.completed_chapters),
      enrolled: r.enrolled,
      percentage: r.total_chapters > 0
        ? Math.round((r.completed_chapters / r.total_chapters) * 100)
        : 0,
    }));

    const chapterProgress = chapterRows.rows.map(r => ({
      id: r.id,
      title: r.title,
      subjectId: r.subject_id,
      subjectName: r.subject_name,
      subjectIcon: r.subject_icon,
      subjectColor: r.subject_color,
      classLevel: r.class_level,
      completed: r.completed,
      completedAt: r.completed_at,
      totalMcqs: parseInt(r.total_mcqs),
    }));

    const mcq = mcqRows.rows[0];
    const mcqProgress = {
      totalSessions: parseInt(mcq.total_sessions),
      totalQuestions: parseInt(mcq.total_questions),
      totalCorrect: parseInt(mcq.total_correct),
      totalWrong: parseInt(mcq.total_wrong),
      totalAnswered: parseInt(mcq.total_answered),
      avgScore: parseFloat(mcq.avg_score),
      totalTimeSeconds: parseInt(mcq.total_time_seconds),
      accuracyPercent: mcq.total_answered > 0
        ? Math.round((mcq.total_correct / mcq.total_answered) * 100)
        : 0,
    };

    const exam = examRows.rows[0];
    const examProgress = {
      mockExamsTaken: parseInt(exam.mock_exams_taken),
      customExamsTaken: parseInt(exam.custom_exams_taken),
      bestScore: parseFloat(exam.best_score),
      avgScore: parseFloat(exam.avg_score),
    };

    const quiz = quizRows.rows[0];
    const recentQuizzes = recentQuizRows.rows.reverse().map((r, i) => ({
      attempt: i + 1,
      score: parseFloat(r.score_percent),
      correct: r.correct,
      wrong: r.wrong,
      total: r.total_questions,
      timeSecs: r.time_taken_seconds,
      date: r.created_at,
    }));
    const quizProgress = {
      totalAttempts: parseInt(quiz.total_quiz_attempts),
      avgScore: parseFloat(quiz.avg_quiz_score),
      bestScore: parseFloat(quiz.best_quiz_score),
      totalTimeSeconds: parseInt(quiz.total_quiz_time_seconds),
      recentAttempts: recentQuizzes,
    };

    res.json({
      levelProgress,
      subjectProgress,
      chapterProgress,
      mcqProgress,
      examProgress,
      quizProgress,
    });
  } catch (err) {
    console.error('Progress tracker error:', err.message);
    res.status(500).json({ error: 'Failed to load progress data' });
  }
});

export default router;
