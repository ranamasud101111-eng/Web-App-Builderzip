import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Flag,
  CheckCircle, XCircle, Lightbulb, RotateCcw, Trophy,
  Brain, ChevronRight, Home
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

const optionColor = (idx, selected, correct, revealed) => {
  if (!revealed) {
    return selected === idx
      ? 'border-purple-500/60 bg-purple-500/12 text-white'
      : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-purple-500/30 hover:bg-purple-500/[0.06] hover:text-white';
  }
  if (idx === correct) return 'border-emerald-500/60 bg-emerald-500/12 text-emerald-300';
  if (idx === selected && selected !== correct) return 'border-red-500/60 bg-red-500/12 text-red-300';
  return 'border-white/[0.04] bg-transparent text-white/30';
};

export default function PracticeMode() {
  const { id: chapterId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null); // index 0-3
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState({}); // {qIdx: {selected, is_correct, bookmarked, wrong}}
  const [bookmarks, setBookmarks] = useState(new Set());
  const [wrongOnly, setWrongOnly] = useState(false);
  const [showExpl, setShowExpl] = useState(false);
  const [done, setDone] = useState(false);
  const [filterList, setFilterList] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/mcqs/chapter/${chapterId}?mode=practice`),
      api.get(`/chapters/${chapterId}`),
    ]).then(async ([qRes, cRes]) => {
      setQuestions(qRes.data.questions);
      setChapter(cRes.data);
      setFilterList(qRes.data.questions.map((_, i) => i));
      // Create session
      const session = await api.post('/mcqs/sessions', {
        chapter_id: parseInt(chapterId),
        subject_id: cRes.data.subject_id,
        mode: 'practice',
        total_questions: qRes.data.total,
      });
      setSessionId(session.data.id);
    }).catch(err => toast.error('Failed to load questions'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  const currentQ = questions[filterList[current]];
  const totalFiltered = filterList.length;

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleReveal = async () => {
    if (selected === null) return;
    setRevealed(true);
    const q = currentQ;
    const correctIdx = OPTION_LABELS.indexOf(q.correct_option);
    const is_correct = selected === correctIdx;

    setAnswers(prev => ({
      ...prev,
      [filterList[current]]: { selected, is_correct, bookmarked: prev[filterList[current]]?.bookmarked || false }
    }));

    if (sessionId) {
      try {
        await api.put(`/mcqs/sessions/${sessionId}/answer`, {
          mcq_id: q.id,
          selected_option: OPTION_LABELS[selected],
        });
      } catch {}
    }
  };

  const handleNext = () => {
    if (current < totalFiltered - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
      setShowExpl(false);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      const prevAns = answers[filterList[current - 1]];
      if (prevAns) {
        setSelected(prevAns.selected);
        setRevealed(true);
      } else {
        setSelected(null);
        setRevealed(false);
      }
      setShowExpl(false);
    }
  };

  const handleBookmark = async () => {
    const q = currentQ;
    const isBookmarked = bookmarks.has(q.id);
    try {
      if (isBookmarked) {
        await api.delete(`/mcqs/bookmarks/${q.id}`);
        setBookmarks(prev => { const s = new Set(prev); s.delete(q.id); return s; });
        toast.success('Bookmark removed');
      } else {
        await api.post(`/mcqs/bookmarks/${q.id}`);
        setBookmarks(prev => new Set([...prev, q.id]));
        toast.success('Bookmarked!');
      }
    } catch { toast.error('Failed'); }
  };

  const handleRetryWrong = () => {
    const wrongIdxs = Object.entries(answers)
      .filter(([_, v]) => !v.is_correct)
      .map(([k]) => parseInt(k));
    if (!wrongIdxs.length) { toast.info('No wrong answers to retry!'); return; }
    setFilterList(wrongIdxs);
    setCurrent(0); setSelected(null); setRevealed(false); setShowExpl(false);
    setWrongOnly(true);
  };

  const handleFinish = async () => {
    if (sessionId) {
      const correct = Object.values(answers).filter(a => a.is_correct).length;
      try {
        await api.put(`/mcqs/sessions/${sessionId}/complete`, { status: 'completed', time_taken_seconds: 0 });
      } catch {}
    }
    setDone(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  if (!questions.length) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <Brain className="w-14 h-14 text-white/15 mx-auto mb-4" />
        <p className="text-white/35">No questions available</p>
        <button onClick={() => navigate(`/chapter/${chapterId}`)} className="btn-primary mt-4 px-6 py-2.5">Go Back</button>
      </div>
    </div>
  );

  if (done) {
    const total = Object.keys(answers).length;
    const correct = Object.values(answers).filter(a => a.is_correct).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="card-premium rounded-3xl p-10 max-w-md w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e'}
                strokeWidth="6" strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{pct}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Practice Complete!</h2>
          <p className="text-white/40 mb-6">{correct} correct out of {total} attempted</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass-navy rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-emerald-400">{correct}</div>
              <div className="text-[10px] text-white/35">Correct</div>
            </div>
            <div className="glass-navy rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-red-400">{total - correct}</div>
              <div className="text-[10px] text-white/35">Wrong</div>
            </div>
            <div className="glass-navy rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-white/60">{questions.length - total}</div>
              <div className="text-[10px] text-white/35">Skipped</div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {Object.values(answers).some(a => !a.is_correct) && (
              <button onClick={() => { setDone(false); handleRetryWrong(); }} className="btn-primary py-3 flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retry Wrong Answers
              </button>
            )}
            <button onClick={() => { setDone(false); setFilterList(questions.map((_,i)=>i)); setCurrent(0); setSelected(null); setRevealed(false); setAnswers({}); setWrongOnly(false); }}
              className="btn-outline py-3">Practice Again</button>
            <button onClick={() => navigate(`/chapter/${chapterId}`)} className="text-white/35 text-sm hover:text-white transition-colors">← Back to Chapter</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const correctIdx = currentQ ? OPTION_LABELS.indexOf(currentQ.correct_option) : -1;
  const progress = ((current + 1) / totalFiltered) * 100;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.is_correct).length;

  return (
    <div className="pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(`/chapter/${chapterId}`)}
            className="flex items-center gap-2 text-white/35 hover:text-white text-sm group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/35 font-medium">
              {wrongOnly ? '⚠️ Retry wrong' : '🧠 Practice'}
            </span>
            <span className="glass-navy rounded-xl px-3 py-1.5 text-xs font-semibold text-purple-300">
              {current + 1} / {totalFiltered}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/35">
            <span className="text-emerald-400 font-bold">{correctCount}</span>/<span>{answeredCount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-8">
          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${filterList[current]}-${current}`}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}>

            {/* Question card */}
            <div className="card-premium rounded-2xl p-7 mb-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-violet-900 opacity-60" />
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="badge-purple text-[10px] flex-shrink-0">Q {filterList[current] + 1}</span>
                <button onClick={handleBookmark}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all ${bookmarks.has(currentQ?.id) ? 'text-gold-400 bg-gold-500/12 border border-gold-500/20' : 'text-white/25 hover:text-gold-400 glass border border-white/[0.06]'}`}>
                  {bookmarks.has(currentQ?.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-white text-lg font-semibold leading-relaxed">{currentQ?.question}</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-6">
              {OPTION_KEYS.map((key, idx) => (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={revealed}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${optionColor(idx, selected, correctIdx, revealed)}`}>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                    revealed && idx === correctIdx ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' :
                    revealed && idx === selected && selected !== correctIdx ? 'bg-red-500/25 text-red-400 border border-red-500/30' :
                    selected === idx ? 'bg-purple-500/25 text-purple-300 border border-purple-500/30' :
                    'bg-white/[0.05] text-white/40 border border-white/[0.08]'
                  }`}>
                    {revealed && idx === correctIdx ? <CheckCircle className="w-4 h-4" /> :
                     revealed && idx === selected && selected !== correctIdx ? <XCircle className="w-4 h-4" /> :
                     OPTION_LABELS[idx]}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{currentQ?.[key]}</span>
                </button>
              ))}
            </div>

            {/* Explanation */}
            {revealed && currentQ?.explanation && (
              <AnimatePresence>
                {showExpl && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="card-premium rounded-2xl p-5 mb-5 border-amber-500/20 overflow-hidden">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gold-400 mb-1.5 uppercase tracking-wide">Explanation</p>
                        <p className="text-white/60 text-sm leading-relaxed">{currentQ.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Action row */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handlePrev} disabled={current === 0}
                className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-30">
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>

              {!revealed ? (
                <button onClick={handleReveal} disabled={selected === null}
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40">
                  Check Answer <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  {currentQ?.explanation && (
                    <button onClick={() => setShowExpl(s => !s)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5 ${showExpl ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'glass border-white/[0.08] text-white/50 hover:text-white'}`}>
                      <Lightbulb className="w-3.5 h-3.5" /> {showExpl ? 'Hide' : 'Explain'}
                    </button>
                  )}
                  <button onClick={handleNext}
                    className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                    {current < totalFiltered - 1 ? <><span>Next</span><ArrowRight className="w-4 h-4" /></> : <><Trophy className="w-4 h-4" /><span>Finish</span></>}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
              <button onClick={handleRetryWrong} className="text-xs text-white/25 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> Retry wrong only
              </button>
              <button onClick={handleFinish} className="text-xs text-white/25 hover:text-white transition-colors flex items-center gap-1.5">
                End session <Trophy className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
