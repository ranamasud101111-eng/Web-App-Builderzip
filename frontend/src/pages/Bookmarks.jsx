import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bookmark, BookmarkCheck, CheckCircle, XCircle,
  Lightbulb, Filter, ChevronDown, Brain, RotateCcw, Trash2
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

export default function Bookmarks() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/mcqs/bookmarks')
      .then(r => setQuestions(r.data))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (id) => {
    try {
      await api.delete(`/mcqs/bookmarks/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Bookmark removed');
    } catch { toast.error('Failed to remove bookmark'); }
  };

  const levels = ['all', ...new Set(questions.map(q => q.subject_name ? null : null).filter(Boolean))]; // populated below
  const levelSet = ['all', ...new Set(questions.map(q => {
    // bookmarks don't carry level directly, we enrich from subject
    return null; // enriched below via subject filter
  }).filter(Boolean))];

  // Unique subjects and chapters from bookmark data
  const subjectNames = ['all', ...new Set(questions.map(q => q.subject_name).filter(Boolean))];
  const chapterNames = ['all', ...new Set(
    questions.filter(q => filterSubject === 'all' || q.subject_name === filterSubject)
      .map(q => q.chapter_title).filter(Boolean)
  )];

  const filtered = questions.filter(q =>
    (filterSubject === 'all' || q.subject_name === filterSubject) &&
    (filterChapter === 'all' || q.chapter_title === filterChapter)
  );

  // Group by subject > chapter
  const grouped = {};
  filtered.forEach(q => {
    const subj = q.subject_name || 'Unknown Subject';
    const chap = q.chapter_title || 'Unknown Chapter';
    if (!grouped[subj]) grouped[subj] = {};
    if (!grouped[subj][chap]) grouped[subj][chap] = [];
    grouped[subj][chap].push(q);
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gold-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 border-l-transparent border-r-transparent border-b-transparent animate-spin" style={{ borderTopColor: '#f59e0b' }} />
      </div>
    </div>
  );

  return (
    <div className="pb-16 px-4">
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
              <BookmarkCheck className="w-7 h-7 text-amber-400" /> Bookmarks
            </h1>
            <p className="text-white/40 text-sm">
              {questions.length === 0 ? 'No bookmarks saved' : `${questions.length} saved question${questions.length > 1 ? 's' : ''}`}
            </p>
          </div>
          {questions.length > 0 && (
            <button onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'glass border-white/[0.08] text-white/50 hover:text-white'}`}>
              <Filter className="w-4 h-4" /> Filter
            </button>
          )}
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="card-premium rounded-2xl p-5 mb-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Subject', value: filterSubject, onChange: (v) => { setFilterSubject(v); setFilterChapter('all'); }, options: subjectNames },
                  { label: 'Chapter', value: filterChapter, onChange: setFilterChapter, options: chapterNames },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-2 block">{label}</label>
                    <div className="relative">
                      <select value={value} onChange={e => onChange(e.target.value)}
                        className="w-full glass-navy border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white appearance-none bg-transparent pr-10 focus:outline-none focus:border-amber-500/40">
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
            <Bookmark className="w-14 h-14 text-amber-400/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No bookmarks yet</h3>
            <p className="text-white/35 mb-6 text-sm">Bookmark questions while practicing using the bookmark icon.</p>
            <Link to="/practice" className="btn-primary inline-flex items-center gap-2">
              <Brain className="w-4 h-4" /> Start Practicing
            </Link>
          </div>
        )}

        {/* Grouped content */}
        {Object.keys(grouped).length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([subjectName, chapters]) => (
              <div key={subjectName}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-base font-black text-white">{subjectName}</h2>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                {Object.entries(chapters).map(([chapterName, qs]) => (
                  <div key={chapterName} className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-white/35 uppercase tracking-wide">{chapterName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">{qs.length} saved</span>
                    </div>
                    <div className="space-y-3">
                      {qs.map((q) => (
                        <BookmarkCard key={q.id} q={q} expanded={expanded === q.id}
                          onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
                          onRemove={() => removeBookmark(q.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && questions.length > 0 && (
          <div className="text-center py-16 card-premium rounded-3xl">
            <p className="text-white/40">No results match the current filter.</p>
            <button onClick={() => { setFilterSubject('all'); setFilterChapter('all'); }}
              className="mt-4 text-sm text-amber-400 hover:text-amber-300 flex items-center gap-2 mx-auto">
              <RotateCcw className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BookmarkCard({ q, expanded, onToggle, onRemove }) {
  const correctIdx = OPTION_LABELS.indexOf((q.correct_option || '').toUpperCase());

  return (
    <motion.div layout className="card-premium rounded-2xl overflow-hidden border-amber-500/10">
      <div className="flex items-start gap-0">
        <button onClick={onToggle} className="flex-1 p-5 text-left flex items-start gap-4">
          <BookmarkCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{q.question}</p>
            <p className="text-amber-400/60 text-xs mt-1.5">Correct: {q.correct_option?.toUpperCase()}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={onRemove} className="p-5 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-2">
              {OPTION_KEYS.map((key, idx) => {
                const isCorrect = idx === correctIdx;
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                    isCorrect ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300' : 'border-white/[0.05] text-white/45'
                  }`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCorrect ? 'bg-emerald-500/25' : 'bg-white/[0.05]'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : OPTION_LABELS[idx]}
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
