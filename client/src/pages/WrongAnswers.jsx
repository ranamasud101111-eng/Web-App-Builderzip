import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, XCircle, CheckCircle, Lightbulb, Filter, ChevronDown, Brain, RotateCcw } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

export default function WrongAnswers() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/mcqs/wrong-answers')
      .then(r => setQuestions(r.data))
      .catch(() => toast.error('Failed to load wrong answers'))
      .finally(() => setLoading(false));
  }, []);

  const levels = ['all', ...new Set(questions.map(q => q.level).filter(Boolean))];
  const subjects = ['all', ...new Set(
    questions.filter(q => filterLevel === 'all' || q.level === filterLevel).map(q => q.subject_name).filter(Boolean)
  )];
  const chaptersRaw = [...new Set(
    questions.filter(q =>
      (filterLevel === 'all' || q.level === filterLevel) &&
      (filterSubject === 'all' || q.subject_name === filterSubject)
    ).map(q => q.chapter_title).filter(Boolean)
  )];
  const chapters = ['all', ...chaptersRaw];

  const filtered = questions.filter(q =>
    (filterLevel === 'all' || q.level === filterLevel) &&
    (filterSubject === 'all' || q.subject_name === filterSubject) &&
    (filterChapter === 'all' || q.chapter_title === filterChapter)
  );

  // Group by level > subject > chapter
  const grouped = {};
  filtered.forEach(q => {
    const lvl = q.level || 'Uncategorised';
    const subj = q.subject_name || 'Unknown Subject';
    const chap = q.chapter_title || 'Unknown Chapter';
    if (!grouped[lvl]) grouped[lvl] = {};
    if (!grouped[lvl][subj]) grouped[lvl][subj] = {};
    if (!grouped[lvl][subj][chap]) grouped[lvl][subj][chap] = [];
    grouped[lvl][subj][chap].push(q);
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-red-500 border-l-transparent border-r-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/35 hover:text-white text-sm group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
              <XCircle className="w-7 h-7 text-red-400" /> Wrong Answers
            </h1>
            <p className="text-white/40 text-sm">
              {questions.length === 0 ? 'No wrong answers yet' : `${questions.length} incorrect answer${questions.length > 1 ? 's' : ''} to revise`}
            </p>
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' : 'glass border-white/[0.08] text-white/50 hover:text-white'}`}>
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="card-premium rounded-2xl p-5 mb-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Level', value: filterLevel, onChange: (v) => { setFilterLevel(v); setFilterSubject('all'); setFilterChapter('all'); }, options: levels },
                  { label: 'Subject', value: filterSubject, onChange: (v) => { setFilterSubject(v); setFilterChapter('all'); }, options: subjects },
                  { label: 'Chapter', value: filterChapter, onChange: setFilterChapter, options: chapters },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-2 block">{label}</label>
                    <div className="relative">
                      <select value={value} onChange={e => onChange(e.target.value)}
                        className="w-full glass-navy border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white appearance-none bg-transparent pr-10 focus:outline-none focus:border-purple-500/40">
                        {options.map(o => <option key={o} value={o} className="bg-[#0d1b3e]">{o === 'all' ? `All ${label}s` : o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {questions.length === 0 && (
          <div className="text-center py-24 card-premium rounded-3xl">
            <CheckCircle className="w-14 h-14 text-emerald-400/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All correct so far!</h3>
            <p className="text-white/35 mb-6 text-sm">Wrong answers appear here after you attempt practice or quiz sessions.</p>
            <Link to="/practice" className="btn-primary inline-flex items-center gap-2">
              <Brain className="w-4 h-4" /> Start Practicing
            </Link>
          </div>
        )}

        {/* Grouped content */}
        {Object.keys(grouped).length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([level, subjects]) => (
              <div key={level}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">{level === 'Certificate' ? '📜' : level === 'Professional' ? '💼' : level === 'Advanced' ? '🏆' : '📚'}</span>
                  <h2 className="text-lg font-black text-white">{level}</h2>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                {Object.entries(subjects).map(([subjectName, chapters]) => (
                  <div key={subjectName} className="mb-6">
                    <h3 className="text-sm font-bold text-white/60 mb-3 pl-2 border-l-2 border-purple-500/40">{subjectName}</h3>
                    {Object.entries(chapters).map(([chapterName, qs]) => (
                      <div key={chapterName} className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-white/35 uppercase tracking-wide">{chapterName}</span>
                          <span className="badge-purple text-[10px]">{qs.length} wrong</span>
                        </div>
                        <div className="space-y-3">
                          {qs.map((q, qi) => (
                            <QuestionCard key={q.id} q={q} qi={qi} expanded={expanded === q.id} onToggle={() => setExpanded(expanded === q.id ? null : q.id)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && questions.length > 0 && (
          <div className="text-center py-16 card-premium rounded-3xl">
            <p className="text-white/40">No results match the current filter.</p>
            <button onClick={() => { setFilterLevel('all'); setFilterSubject('all'); setFilterChapter('all'); }}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2 mx-auto">
              <RotateCcw className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ q, qi, expanded, onToggle }) {
  const myIdx = OPTION_LABELS.indexOf((q.my_answer || '').toUpperCase());
  const correctIdx = OPTION_LABELS.indexOf((q.correct_option || '').toUpperCase());

  return (
    <motion.div layout className="card-premium rounded-2xl overflow-hidden border-red-500/10">
      <button onClick={onToggle} className="w-full p-5 text-left flex items-start gap-4">
        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{q.question}</p>
          <div className="flex gap-3 mt-2 text-xs flex-wrap">
            <span className="text-white/30">Your answer: <span className="text-red-400 font-semibold">{q.my_answer?.toUpperCase() || '—'}</span></span>
            <span className="text-white/30">Correct: <span className="text-emerald-400 font-semibold">{q.correct_option?.toUpperCase()}</span></span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-2">
              {OPTION_KEYS.map((key, idx) => {
                const isCorrect = idx === correctIdx;
                const isWrong = idx === myIdx && myIdx !== correctIdx;
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                    isCorrect ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300' :
                    isWrong ? 'border-red-500/30 bg-red-500/[0.06] text-red-300' :
                    'border-white/[0.05] text-white/35'
                  }`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCorrect ? 'bg-emerald-500/25' : isWrong ? 'bg-red-500/25' : 'bg-white/[0.05]'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : isWrong ? <XCircle className="w-3.5 h-3.5" /> : OPTION_LABELS[idx]}
                    </span>
                    <span className="leading-relaxed">{q[key]}</span>
                  </div>
                );
              })}
              {q.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200/70 text-sm leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
