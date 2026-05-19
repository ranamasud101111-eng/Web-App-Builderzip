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

router.get('/daily', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [todayRows, dailyRows, weeklyRows, monthlyRows, weakRows] = await Promise.all([
      // Today's stats
      pool.query(`
        SELECT
          COALESCE(SUM(total_questions), 0) AS total_answered,
          COALESCE(SUM(correct), 0) AS total_correct,
          COALESCE(SUM(wrong), 0) AS total_wrong
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed'
          AND created_at >= CURRENT_DATE
      `, [userId]),

      // Daily last 30 days
      pool.query(`
        SELECT
          TO_CHAR(DATE(created_at), 'Mon DD') AS label,
          COALESCE(SUM(correct), 0) AS correct,
          COALESCE(SUM(wrong), 0) AS wrong,
          COALESCE(SUM(total_questions), 0) AS total
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed'
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `, [userId]),

      // Weekly last 12 weeks
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS label,
          COALESCE(SUM(correct), 0) AS correct,
          COALESCE(SUM(wrong), 0) AS wrong,
          COALESCE(SUM(total_questions), 0) AS total
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed'
          AND created_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY DATE_TRUNC('week', created_at)
      `, [userId]),

      // Monthly last 12 months
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS label,
          COALESCE(SUM(correct), 0) AS correct,
          COALESCE(SUM(wrong), 0) AS wrong,
          COALESCE(SUM(total_questions), 0) AS total
        FROM mcq_sessions
        WHERE user_id = $1 AND status = 'completed'
          AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `, [userId]),

      // Subject-wise stats (all time)
      pool.query(`
        SELECT
          s.name AS subject_name,
          s.color,
          COALESCE(SUM(ms.correct), 0) AS correct,
          COALESCE(SUM(ms.total_questions), 0) AS total
        FROM mcq_sessions ms
        JOIN chapters c ON c.id = ms.chapter_id
        JOIN subjects s ON s.id = c.subject_id
        WHERE ms.user_id = $1 AND ms.status = 'completed'
        GROUP BY s.id, s.name, s.color
        ORDER BY total DESC
        LIMIT 10
      `, [userId]),
    ]);

    const today = todayRows.rows[0];
    const todayCorrectRate = today.total_answered > 0
      ? Math.round((today.total_correct / today.total_answered) * 100)
      : null;

    const subjectStats = weakRows.rows.map(r => ({
      subject_name: r.subject_name,
      color: r.color,
      correct: parseInt(r.correct),
      total: parseInt(r.total),
      rate: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
    }));

    const weakSubjects = subjectStats.filter(s => s.rate < 50);

    res.json({
      today: {
        total_answered: parseInt(today.total_answered),
        total_correct: parseInt(today.total_correct),
        total_wrong: parseInt(today.total_wrong),
        correct_rate: todayCorrectRate,
      },
      daily: dailyRows.rows.map(r => ({ ...r, correct: parseInt(r.correct), wrong: parseInt(r.wrong), total: parseInt(r.total) })),
      weekly: weeklyRows.rows.map(r => ({ ...r, correct: parseInt(r.correct), wrong: parseInt(r.wrong), total: parseInt(r.total) })),
      monthly: monthlyRows.rows.map(r => ({ ...r, correct: parseInt(r.correct), wrong: parseInt(r.wrong), total: parseInt(r.total) })),
      subjectStats,
      weakSubjects,
    });
  } catch (err) {
    console.error('Daily progress error:', err.message);
    res.status(500).json({ error: 'Failed to load daily progress' });
  }
});

export default router;
