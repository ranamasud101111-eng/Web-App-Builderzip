import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle,
  Trophy, Target, Zap, ChevronDown, HelpCircle, Layers, BarChart3, Flag
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];
const LEVELS = ['Certificate', 'Professional', 'Advanced'];

export default function CustomExam() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('build'); // build | exam | result
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Builder state
  const [level, setLevel] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMins, setDurationMins] = useState(30);

  // Exam state
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  // Load subjects when level changes
  useEffect(() => {
    if (!level) return;
    setLoadingSubjects(true);
    setSelectedSubjects([]);
    setSelectedChapters([]);
    setChapters([]);
    api.get('/subjects')
      .then(r => setSubjects(r.data.filter(s => s.class_level === level)))
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setLoadingSubjects(false));
  }, [level]);

  // Load chapters when subjects change
  useEffect(() => {
    if (!selectedSubjects.length) { setChapters([]); setSelectedChapters([]); return; }
    setLoadingChapters(true);
    setSelectedChapters([]);
    Promise.all(selectedSubjects.map(id => api.get(`/subjects/${id}`)))
      .then(results => {
        const allChapters = results.flatMap(r => (r.data.chapters || []).map(c => ({ ...c, subject_name: r.data.name })));
        setChapters(allChapters);
      })
      .catch(() => toast.error('Failed to load chapters'))
      .finally(() => setLoadingChapters(false));
  }, [selectedSubjects]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const generateExam = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/mcqs/custom-exam/generate', {
        level: level || undefined,
        subject_ids: selectedSubjects.length ? selectedSubjects : undefined,
        chapter_ids: selectedChapters.length ? selectedChapters : undefined,
        question_count: questionCount,
        duration_minutes: durationMins,
      });
      setQuestions(res.data.questions);
      setSessionId(res.data.session_id);
      const secs = durationMins * 60;
      setTimeLeft(secs);
      setTotalTime(secs);
      startRef.current = Date.now();
      setPhase('exam');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate exam');
    } finally { setGenerating(false); }
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    setConfirmSubmit(false);
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - (startRef.current || Date.now())) / 1000);

    try {
      const answerPromises = Object.entries(answers).map(([qIdx, optIdx]) => {
        const q = questions[parseInt(qIdx)];
        return api.put(`/mcqs/sessions/${sessionId}/answer`, {
          mcq_id: q.id, selected_option: OPTION_LABELS[optIdx],
        });
      });
      const answerResults = await Promise.all(answerPromises);
      await api.put(`/mcqs/sessions/${sessionId}/complete`, {
        status: autoSubmit ? 'timed_out' : 'completed', time_taken_seconds: timeTaken,
      });

      let correct = 0;
      const answerMap = {};
      Object.entries(answers).forEach(([qIdx, optIdx], i) => {
        answerMap[qIdx] = { optIdx, is_correct: answerResults[i]?.data?.is_correct, correct_option: answerResults[i]?.data?.correct_option };
      });

      const resultAnswers = questions.map((q, i) => {
        const selectedIdx = answers[i] !== undefined ? answers[i] : -1;
        const is_correct = answerMap[i]?.is_correct || false;
        if (is_correct) correct++;
        return {
          ...q,
          selectedIdx,
          selectedLabel: selectedIdx >= 0 ? OPTION_LABELS[selectedIdx] : null,
          is_correct,
          correct_option: answerMap[i]?.correct_option || q.correct_option || '?',
        };
      });

      const pct = Math.round((correct / questions.length) * 100);
      const unattempted = questions.length - Object.keys(answers).length;
      setResult({ correct, total: questions.length, pct, timeTaken, answers: resultAnswers, unattempted, autoSubmit });
      setPhase('result');
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  }, [answers, questions, sessionId, submitting]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = timeLeft < 120 ? '#f43f5e' : timeLeft < totalTime * 0.25 ? '#f59e0b' : '#10b981';
  const timerPct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;

  // ── Build Phase ──
  if (phase === 'build') return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/practice" className="flex items-center gap-2 text-white/35 hover:text-white text-sm group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Practice Hub
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/12 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Custom Exam</h1>
          <p className="text-white/40 text-sm">Build your own exam from available MCQs</p>
        </div>

        <div className="card-premium rounded-3xl p-8 space-y-6">

          {/* Level */}
          <div>
            <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-3 block">Level (optional)</label>
            <div className="grid grid-cols-3 gap-2">
              {['', ...LEVELS].map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${level === l ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'glass border-white/[0.08] text-white/40 hover:text-white'}`}>
                  {l || 'Any Level'}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          {level && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-3 block">Subjects (optional — leave blank for all)</label>
              {loadingSubjects ? <div className="text-white/30 text-sm">Loading…</div> : subjects.length === 0 ? (
                <p className="text-white/25 text-sm">No subjects found for this level.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => setSelectedSubjects(prev =>
                      prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                    )}
                      className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${selectedSubjects.includes(s.id) ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'glass border-white/[0.08] text-white/40 hover:text-white'}`}>
                      <span>{s.icon}</span> {s.name}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Chapters */}
          {selectedSubjects.length > 0 && chapters.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-3 block">Chapters (optional — leave blank for all)</label>
              {loadingChapters ? <div className="text-white/30 text-sm">Loading…</div> : (
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                  {chapters.map(c => (
                    <button key={c.id} onClick={() => setSelectedChapters(prev =>
                      prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                    )}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm border transition-all text-left ${selectedChapters.includes(c.id) ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'glass border-white/[0.06] text-white/45 hover:text-white'}`}>
                      <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${selectedChapters.includes(c.id) ? 'text-purple-400' : 'text-white/20'}`} />
                      <span className="flex-1 line-clamp-1">{c.title}</span>
                      <span className="text-xs text-white/25">{c.subject_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Count & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-3 block">Questions</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}
                  className="w-9 h-9 rounded-xl glass border border-white/[0.08] text-white/50 hover:text-white text-lg font-bold transition-colors">−</button>
                <div className="flex-1 text-center text-xl font-black text-white">{questionCount}</div>
                <button onClick={() => setQuestionCount(Math.min(100, questionCount + 5))}
                  className="w-9 h-9 rounded-xl glass border border-white/[0.08] text-white/50 hover:text-white text-lg font-bold transition-colors">+</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-3 block">Duration (mins)</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setDurationMins(Math.max(5, durationMins - 5))}
                  className="w-9 h-9 rounded-xl glass border border-white/[0.08] text-white/50 hover:text-white text-lg font-bold transition-colors">−</button>
                <div className="flex-1 text-center text-xl font-black text-white">{durationMins}</div>
                <button onClick={() => setDurationMins(Math.min(180, durationMins + 5))}
                  className="w-9 h-9 rounded-xl glass border border-white/[0.08] text-white/50 hover:text-white text-lg font-bold transition-colors">+</button>
              </div>
            </div>
          </div>

          <button onClick={generateExam} disabled={generating}
            className="w-full btn-primary py-4 font-bold flex items-center justify-center gap-2 text-base disabled:opacity-60">
            {generating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</> : <><Zap className="w-5 h-5" /> Generate Exam</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Exam Phase ──
  if (phase === 'exam') {
    const q = questions[current];
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white/45">Custom Exam</span>
            </div>
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${timeLeft < 120 ? 'bg-red-500/10 border-red-500/30' : 'glass-navy border-white/[0.08]'}`}>
              <div className="relative w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-6 h-6 -rotate-90">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke={timerColor} strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 10}`} strokeDashoffset={`${2 * Math.PI * 10 * (1 - timerPct / 100)}`} strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-bold tabular-nums text-sm" style={{ color: timerColor }}>{formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => setConfirmSubmit(true)} disabled={submitting}
              className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" /> Submit
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="glass-navy rounded-2xl p-4 border border-white/[0.06] sticky top-24">
                <p className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-3">Questions</p>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
                  {questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
                        i === current ? 'bg-purple-500 text-white shadow-sm' :
                        flagged.has(i) ? 'bg-amber-500/30 text-amber-300 border border-amber-500/30' :
                        answers[i] !== undefined ? 'bg-emerald-500/30 text-emerald-300' :
                        'bg-white/[0.05] text-white/30 hover:bg-white/[0.09]'
                      }`}>{i + 1}</button>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] text-center">
                  <div className="text-lg font-black text-white">{answeredCount}<span className="text-white/30 text-sm">/{questions.length}</span></div>
                  <div className="text-[10px] text-white/30">Answered</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <div className="card-premium rounded-2xl p-7 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-violet-400 opacity-50" />
                    <div className="flex items-center justify-between mb-5">
                      <span className="badge-purple text-[10px]">Q {current + 1} of {questions.length}</span>
                      <div className="flex items-center gap-2">
                        {q.chapter_title && <span className="text-[10px] text-white/25">{q.chapter_title}</span>}
                        <button onClick={() => setFlagged(prev => { const s = new Set(prev); s.has(current) ? s.delete(current) : s.add(current); return s; })}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${flagged.has(current) ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'glass border-white/[0.08] text-white/30 hover:text-amber-400'}`}>
                          <Flag className="w-3 h-3" /> {flagged.has(current) ? 'Flagged' : 'Flag'}
                        </button>
                      </div>
                    </div>
                    <p className="text-white text-lg font-semibold leading-relaxed">{q?.question}</p>
                  </div>

                  <div className="flex flex-col gap-3 mb-6">
                    {OPTION_KEYS.map((key, idx) => (
                      <button key={idx} onClick={() => setAnswers(prev => ({ ...prev, [current]: idx }))}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                          answers[current] === idx
                            ? 'border-purple-500/60 bg-purple-500/10 text-white'
                            : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-purple-500/30 hover:text-white'
                        }`}>
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          answers[current] === idx ? 'bg-purple-500/25 text-purple-300 border border-purple-500/30' : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                        }`}>{OPTION_LABELS[idx]}</span>
                        <span className="text-sm leading-relaxed pt-0.5">{q?.[key]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                      className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-30">
                      <ArrowLeft className="w-4 h-4" /> Prev
                    </button>
                    {answers[current] !== undefined && (
                      <button onClick={() => setAnswers(prev => { const n = { ...prev }; delete n[current]; return n; })}
                        className="text-xs text-white/25 hover:text-red-400 transition-colors">Clear</button>
                    )}
                    <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                      className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-30">
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {confirmSubmit && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="glass-navy rounded-3xl p-8 max-w-sm w-full border border-purple-500/15 text-center">
                  <Trophy className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Submit Exam?</h3>
                  <p className="text-white/45 text-sm mb-6">
                    {Object.keys(answers).length} of {questions.length} answered
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmSubmit(false)} className="flex-1 btn-outline py-3">Review</button>
                    <button onClick={() => handleSubmit(false)} disabled={submitting}
                      className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                      {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Trophy className="w-4 h-4" /> Confirm</>}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Result Phase ──
  if (phase === 'result' && result) {
    const { correct, total, pct, timeTaken, answers: rAnswers, unattempted, autoSubmit } = result;
    const wrong = total - correct - unattempted;
    const grade = pct >= 80 ? 'A' : pct >= 65 ? 'B' : pct >= 50 ? 'C' : pct >= 35 ? 'D' : 'F';
    const gradeColor = pct >= 80 ? '#10b981' : pct >= 65 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : pct >= 35 ? '#f97316' : '#f43f5e';
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-premium rounded-3xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: gradeColor }} />
              {autoSubmit && (
                <div className="flex items-center gap-2 glass-navy border border-amber-500/20 rounded-xl px-3 py-2 mb-5 w-fit">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold">Time expired — auto submitted</span>
                </div>
              )}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="text-center flex-shrink-0">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={gradeColor} strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black" style={{ color: gradeColor }}>{grade}</span>
                      <span className="text-sm text-white/50">{pct}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white mb-2">
                    {pct >= 80 ? '🏆 Outstanding!' : pct >= 65 ? '🎯 Well Done!' : pct >= 50 ? '📚 Satisfactory' : '💪 Needs Work'}
                  </h2>
                  <p className="text-white/45 mb-6">Custom Exam Results</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Correct', val: correct, color: '#10b981' },
                      { label: 'Wrong', val: wrong, color: '#f43f5e' },
                      { label: 'Skipped', val: unattempted, color: '#94a3b8' },
                      { label: 'Time', val: formatTime(timeTaken), color: '#a78bfa' },
                    ].map((s, i) => (
                      <div key={i} className="glass-navy rounded-xl p-3 text-center">
                        <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-[10px] text-white/30">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium rounded-2xl overflow-hidden mb-6">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.06]">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Answer Review</h3>
              </div>
              <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
                {rAnswers.map((q, i) => (
                  <div key={i} className={`px-6 py-4 ${q.is_correct ? '' : 'bg-red-500/[0.02]'}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-white/25 w-5 flex-shrink-0 mt-0.5">Q{i + 1}</span>
                      {q.selectedLabel
                        ? (q.is_correct ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />)
                        : <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/75 text-sm mb-1.5 line-clamp-2">{q.question}</p>
                        <div className="flex gap-4 text-xs flex-wrap">
                          {q.chapter_title && <span className="text-white/20">{q.chapter_title}</span>}
                          <span className="text-white/35">Your: <span className={q.is_correct ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{q.selectedLabel || '—'}</span></span>
                          {!q.is_correct && q.correct_option && (
                            <span className="text-white/35">Correct: <span className="text-emerald-400 font-semibold">{q.correct_option}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPhase('build'); setAnswers({}); setCurrent(0); setFlagged(new Set()); setResult(null); }}
                className="flex-1 btn-outline py-3">New Exam</button>
              <Link to="/wrong-answers" className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Review Wrong Answers
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
