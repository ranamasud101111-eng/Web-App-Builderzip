import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Zap, ChevronRight, BookOpen, Layers, ArrowLeft,
  Clock, Target, CheckCircle, Play, Loader2
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const LEVELS = [
  { name: 'Certificate', icon: '🎓', color: '#10b981', desc: 'Foundation level CA subjects' },
  { name: 'Professional', icon: '💼', color: '#3b82f6', desc: 'Intermediate CA subjects' },
  { name: 'Advanced', icon: '🏆', color: '#f59e0b', desc: 'Advanced CA subjects' },
];

export default function QuizHub() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState('level');
  const [level, setLevel] = useState(null);
  const [subject, setSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    if (!level) return;
    setLoadingSubjects(true);
    api.get('/subjects')
      .then(r => setSubjects(r.data.filter(s => s.class_level === level.name)))
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setLoadingSubjects(false));
  }, [level]);

  useEffect(() => {
    if (!subject) return;
    setLoadingChapters(true);
    api.get(`/subjects/${subject.id}`)
      .then(r => setChapters(r.data.chapters || []))
      .catch(() => toast.error('Failed to load chapters'))
      .finally(() => setLoadingChapters(false));
  }, [subject]);

  const selectLevel = (lv) => {
    setLevel(lv);
    setSubject(null);
    setSubjects([]);
    setChapters([]);
    setStep('subject');
  };

  const selectSubject = (s) => {
    setSubject(s);
    setChapters([]);
    setStep('chapter');
  };

  const startQuiz = (chapter) => {
    navigate(`/chapter/${chapter.id}/quiz`);
  };

  const cardBase = isDark
    ? 'bg-[rgba(14,22,74,0.7)] border border-white/[0.08] hover:border-violet-500/30'
    : 'bg-white border border-violet-100 hover:border-violet-300 shadow-sm hover:shadow-md';

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/50' : 'text-slate-500';

  return (
    <div className="px-5 sm:px-7 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {step !== 'level' && (
            <button onClick={() => {
              if (step === 'chapter') { setStep('subject'); setChapters([]); }
              else if (step === 'subject') { setStep('level'); setLevel(null); setSubjects([]); }
            }}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/[0.07] text-white/40 hover:text-white/80' : 'hover:bg-violet-50 text-slate-400 hover:text-slate-700'}`}>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold leading-tight ${textPrimary}`}>Quick Quiz</h1>
            <p className={`text-xs font-medium ${textSecondary}`}>10 questions · 10 minutes · Instant results</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span className={step === 'level' ? 'text-violet-500' : textSecondary}>Level</span>
          <ChevronRight className={`w-3 h-3 ${textSecondary}`} />
          <span className={step === 'subject' ? 'text-violet-500' : level ? textSecondary : `opacity-30 ${textSecondary}`}>Subject</span>
          <ChevronRight className={`w-3 h-3 ${textSecondary}`} />
          <span className={step === 'chapter' ? 'text-violet-500' : subject ? textSecondary : `opacity-30 ${textSecondary}`}>Chapter</span>
        </div>
      </motion.div>

      {/* Quiz Info Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`rounded-2xl p-4 mb-6 flex flex-wrap gap-4 ${isDark ? 'bg-violet-500/[0.07] border border-violet-500/15' : 'bg-violet-50 border border-violet-100'}`}>
        {[
          { icon: Target, label: '10 MCQs', sub: 'Random from chapter' },
          { icon: Clock, label: '10 Minutes', sub: 'Auto-submit on time' },
          { icon: CheckCircle, label: 'Instant Score', sub: 'See results right away' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-violet-500/15' : 'bg-violet-100'}`}>
              <Icon className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className={`text-xs font-bold ${textPrimary}`}>{label}</p>
              <p className={`text-[10px] ${textSecondary}`}>{sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Level */}
        {step === 'level' && (
          <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>Select your level</p>
            {LEVELS.map((lv, i) => (
              <motion.button key={lv.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => selectLevel(lv)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 text-left group ${cardBase}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${lv.color}18`, border: `1.5px solid ${lv.color}30` }}>
                  {lv.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base ${textPrimary}`}>{lv.name}</p>
                  <p className={`text-xs mt-0.5 ${textSecondary}`}>{lv.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isDark ? 'text-white/20 group-hover:text-violet-400' : 'text-slate-300 group-hover:text-violet-500'}`} />
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* STEP 2: Subject */}
        {step === 'subject' && (
          <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${level.color}20` }}>{level.icon}</div>
              <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>{level.name} — Select subject</p>
            </div>
            {loadingSubjects ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              </div>
            ) : subjects.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-100'}`}>
                <BookOpen className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
                <p className={`font-semibold ${textPrimary}`}>No subjects found</p>
                <p className={`text-sm mt-1 ${textSecondary}`}>No subjects added for {level.name} level yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((s, i) => (
                  <motion.button key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => selectSubject(s)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 text-left group ${cardBase}`}>
                    <div className="text-xl flex-shrink-0">{s.icon || '📚'}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${textPrimary}`}>{s.name}</p>
                      <p className={`text-[11px] mt-0.5 ${textSecondary}`}>{s.chapter_count || 0} chapters</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isDark ? 'text-white/20 group-hover:text-violet-400' : 'text-slate-300 group-hover:text-violet-500'}`} />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: Chapter */}
        {step === 'chapter' && (
          <motion.div key="chapter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-lg">{subject.icon || '📚'}</div>
              <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>{subject.name} — Select chapter</p>
            </div>
            {loadingChapters ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              </div>
            ) : chapters.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-slate-50 border border-slate-100'}`}>
                <Layers className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
                <p className={`font-semibold ${textPrimary}`}>No chapters found</p>
                <p className={`text-sm mt-1 ${textSecondary}`}>No chapters added to this subject yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((ch, i) => (
                  <motion.button key={ch.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => startQuiz(ch)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 text-left group ${cardBase}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${isDark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-100 text-violet-600'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${textPrimary}`}>{ch.name}</p>
                      <p className={`text-[11px] mt-0.5 ${textSecondary}`}>{ch.mcq_count || 0} questions available</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0
                      ${isDark ? 'bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25' : 'bg-violet-100 text-violet-600 group-hover:bg-violet-200'}`}>
                      <Play className="w-3 h-3" /> Start Quiz
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
