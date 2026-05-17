import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle, Trophy, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

export default function QuizMode() {
  const { id: chapterId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // {qIdx: optionIdx}
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/mcqs/chapter/${chapterId}?mode=quiz`),
      api.get(`/chapters/${chapterId}`),
    ]).then(([qRes, cRes]) => {
      setQuestions(qRes.data.questions);
      setChapter(cRes.data);
      const mins = Math.max(10, qRes.data.total * 1.5); // 1.5 min per question
      setTimeLeft(mins * 60);
      setTotalTime(mins * 60);
    }).catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  const startQuiz = async () => {
    try {
      const session = await api.post('/mcqs/sessions', {
        chapter_id: parseInt(chapterId),
        subject_id: chapter?.subject_id,
        mode: 'quiz',
        total_questions: questions.length,
        time_limit_seconds: totalTime,
      });
      setSessionId(session.data.id);
      setStarted(true);
      startTimeRef.current = Date.now();
    } catch { toast.error('Failed to start quiz'); }
  };

  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitted || submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    try {
      // Submit all answers
      const answerPromises = Object.entries(answers).map(([qIdx, optIdx]) => {
        const q = questions[parseInt(qIdx)];
        return api.put(`/mcqs/sessions/${sessionId}/answer`, {
          mcq_id: q.id,
          selected_option: OPTION_LABELS[optIdx],
        });
      });
      await Promise.all(answerPromises);
      const completed = await api.put(`/mcqs/sessions/${sessionId}/complete`, {
        status: autoSubmit ? 'timed_out' : 'completed',
        time_taken_seconds: timeTaken,
      });
      // Calculate results
      let correct = 0;
      const resultAnswers = questions.map((q, i) => {
        const selectedIdx = answers[i] !== undefined ? answers[i] : -1;
        const selectedLabel = selectedIdx >= 0 ? OPTION_LABELS[selectedIdx] : null;
        const is_correct = selectedLabel === q.correct_option;
        if (is_correct) correct++;
        return { ...q, selectedIdx, selectedLabel, is_correct };
      });
      const pct = Math.round((correct / questions.length) * 100);
      setResult({ correct, total: questions.length, pct, timeTaken, answers: resultAnswers, autoSubmit });
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally { setSubmitting(false); }
  }, [answers, questions, sessionId, submitted, submitting]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft < 60 ? 'text-red-400' : timeLeft < totalTime * 0.25 ? 'text-amber-400' : 'text-emerald-400';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  // Start screen
  if (!started) return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="card-premium rounded-3xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold-500/12 border border-gold-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-gold-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Chapter Quiz</h2>
        <p className="text-white/45 mb-8">{chapter?.title}</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass-navy rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{questions.length}</div>
            <div className="text-xs text-white/35">Questions</div>
          </div>
          <div className="glass-navy rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-gold-400">{formatTime(totalTime)}</div>
            <div className="text-xs text-white/35">Time Limit</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="glass-navy rounded-xl px-4 py-3 text-left border border-amber-500/15">
            <p className="text-xs text-amber-400 font-semibold mb-1.5 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Quiz Rules</p>
            <ul className="text-xs text-white/40 space-y-1">
              <li>• Timer starts when you click Begin Quiz</li>
              <li>• Auto-submits when time runs out</li>
              <li>• You can navigate between questions</li>
              <li>• Results shown immediately after submit</li>
            </ul>
          </div>
          <button onClick={startQuiz} className="btn-gold py-3.5 font-bold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Begin Quiz
          </button>
          <button onClick={() => navigate(`/chapter/${chapterId}`)} className="btn-outline py-3">Cancel</button>
        </div>
      </motion.div>
    </div>
  );

  // Results screen
  if (submitted && result) {
    const { correct, total, pct, timeTaken, answers: rAnswers, autoSubmit } = result;
    const unanswered = total - Object.keys(answers).length;
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score card */}
            <div className="card-premium rounded-3xl p-8 text-center mb-8 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
              {autoSubmit && (
                <div className="inline-flex items-center gap-2 glass-navy border border-amber-500/20 rounded-xl px-3 py-1.5 mb-4">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold">Time's up — auto submitted</span>
                </div>
              )}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e'} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{pct}%</span>
                  <span className="text-[10px] text-white/35">Score</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                {pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good Job!' : pct >= 40 ? '📚 Keep Practicing' : '💪 Try Again'}
              </h2>
              <div className="grid grid-cols-4 gap-3 mt-6">
                {[
                  { label: 'Correct', val: correct, color: '#10b981' },
                  { label: 'Wrong', val: total - correct - unanswered, color: '#f43f5e' },
                  { label: 'Skipped', val: unanswered, color: '#94a3b8' },
                  { label: 'Time', val: formatTime(timeTaken), color: '#a78bfa' },
                ].map((s, i) => (
                  <div key={i} className="glass-navy rounded-xl p-3 text-center">
                    <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[10px] text-white/30">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer review */}
            <div className="card-premium rounded-2xl overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-white text-sm">Answer Review</h3>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto">
                {rAnswers.map((q, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {q.selectedLabel ? (
                        q.is_correct
                          ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/75 text-sm mb-1.5 line-clamp-2">{q.question}</p>
                        <div className="flex gap-3 text-xs flex-wrap">
                          <span className="text-white/35">Your: <span className={q.is_correct ? 'text-emerald-400' : 'text-red-400'}>{q.selectedLabel || '—'}</span></span>
                          {!q.is_correct && <span className="text-white/35">Correct: <span className="text-emerald-400">{q.correct_option}</span></span>}
                        </div>
                        {!q.is_correct && q.explanation && (
                          <p className="text-white/30 text-xs mt-1.5 line-clamp-2">💡 {q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setStarted(false); setAnswers({}); setCurrent(0); }} className="flex-1 btn-outline py-3">Retake Quiz</button>
              <button onClick={() => navigate(`/chapter/${chapterId}`)} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Chapter
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium text-white/35">📋 Quiz Mode</span>
          <div className={`flex items-center gap-2 glass-navy rounded-xl px-4 py-2 border ${timeLeft < 60 ? 'border-red-500/30 bg-red-500/[0.06]' : 'border-white/[0.06]'}`}>
            <Clock className={`w-4 h-4 ${timerColor}`} />
            <span className={`font-bold text-base tabular-nums ${timerColor}`}>{formatTime(timeLeft)}</span>
          </div>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            className="btn-gold text-xs py-2 px-4 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-white/35 font-medium flex-shrink-0">{answeredCount}/{questions.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {/* Question */}
            <div className="card-premium rounded-2xl p-7 mb-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-600 to-gold-400 opacity-50" />
              <div className="flex items-center justify-between mb-4">
                <span className="badge-gold text-[10px]">Q {current + 1} of {questions.length}</span>
                {answers[current] !== undefined && <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Answered</span>}
              </div>
              <p className="text-white text-lg font-semibold leading-relaxed">{q?.question}</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-6">
              {OPTION_KEYS.map((key, idx) => (
                <button key={idx} onClick={() => setAnswers(prev => ({ ...prev, [current]: idx }))}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                    answers[current] === idx
                      ? 'border-gold-500/60 bg-gold-500/10 text-white'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-gold-500/30 hover:bg-gold-500/[0.04] hover:text-white'
                  }`}>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    answers[current] === idx ? 'bg-gold-500/25 text-gold-300 border border-gold-500/30' : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                  }`}>{OPTION_LABELS[idx]}</span>
                  <span className="text-sm leading-relaxed pt-0.5">{q?.[key]}</span>
                </button>
              ))}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-30">
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              <div className="flex gap-1.5 overflow-x-auto max-w-[200px] px-1">
                {questions.slice(Math.max(0, current - 2), Math.min(questions.length, current + 5)).map((_, localIdx) => {
                  const globalIdx = Math.max(0, current - 2) + localIdx;
                  return (
                    <button key={globalIdx} onClick={() => setCurrent(globalIdx)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-bold flex-shrink-0 transition-all ${
                        globalIdx === current ? 'bg-gold-500 text-navy-950' :
                        answers[globalIdx] !== undefined ? 'bg-purple-500/30 text-purple-300' :
                        'bg-white/[0.06] text-white/35'
                      }`}>
                      {globalIdx + 1}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-30">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
