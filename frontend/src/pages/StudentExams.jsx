import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Clock, Trophy, Target, CheckCircle, ArrowLeft,
  Play, BookOpen, FileText, ChevronRight, Loader2, Layers, Brain
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const LEVELS = [
  { name: 'Certificate', icon: '📜', color: '#3b82f6' },
  { name: 'Professional', icon: '💼', color: '#8b5cf6' },
  { name: 'Advanced', icon: '🏆', color: '#f59e0b' },
];
const DIFF_COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#f43f5e', mixed: '#7c3aed' };

export default function StudentExams() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState('level');
  const [level, setLevel] = useState(null);
  const [subject, setSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    api.get('/exams')
      .then(r => setAllExams(r.data))
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, []);

  const selectLevel = (lv) => {
    setLevel(lv);
    const lvSubjects = [...new Map(
      allExams
        .filter(e => e.level_name === lv.name || !e.level_name)
        .map(e => [e.subject_id, { id: e.subject_id, name: e.subject_name, icon: e.subject_icon }])
    ).values()].filter(s => s.id);

    if (lvSubjects.length === 0) {
      const filtered = allExams.filter(e => e.level_name === lv.name || !e.level_name);
      setExams(filtered);
      setStep('exams');
    } else {
      setSubjects(lvSubjects);
      setStep('subject');
    }
  };

  const selectSubject = (s) => {
    setSubject(s);
    const filtered = allExams.filter(e => e.subject_id === s.id);
    setExams(filtered);
    setStep('exams');
  };

  const goBack = () => {
    if (step === 'subject') { setStep('level'); setSubjects([]); }
    else if (step === 'exams') { step === 'exams' && subject ? setStep('subject') : setStep('level'); }
  };

  const card = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-violet-100 shadow-sm';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-white/40' : 'text-slate-400';

  if (initialLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
    </div>
  );

  return (
    <div className="pb-16 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        {step !== 'level' && (
          <button onClick={goBack}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/[0.07] text-white/40 hover:text-white' : 'hover:bg-violet-50 text-slate-400 hover:text-slate-700'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className={`text-2xl font-black ${textPrimary}`}>Mock Exams</h1>
          <p className={`text-sm ${textMuted}`}>Timed practice exams — real exam conditions</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className={`flex items-center gap-1.5 mb-6 text-[11px] font-semibold ${textMuted}`}>
        <span className={step === 'level' ? 'text-violet-400' : ''}>{level?.name || 'Level'}</span>
        <ChevronRight className="w-3 h-3" />
        <span className={step === 'subject' ? 'text-violet-400' : ''}>{subject?.name || 'Subject'}</span>
        <ChevronRight className="w-3 h-3" />
        <span className={step === 'exams' ? 'text-violet-400' : ''}>Exams</span>
      </div>

      <AnimatePresence mode="wait">

        {/* Step 1: Select Level */}
        {step === 'level' && (
          <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-3">
            {LEVELS.map((lv, i) => (
              <motion.button key={lv.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => selectLevel(lv)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all text-left group ${card} hover:border-violet-500/30`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${lv.color}15`, border: `1.5px solid ${lv.color}28` }}>
                  {lv.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-base ${textPrimary}`}>{lv.name}</p>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    {allExams.filter(e => !e.level_name || e.level_name === lv.name).length} exams available
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
              </motion.button>
            ))}

            {/* Show all option */}
            <motion.button
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
              onClick={() => { setExams(allExams); setStep('exams'); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${card} hover:border-violet-500/30`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1.5px solid rgba(139,92,246,0.2)' }}>
                📋
              </div>
              <div className="flex-1">
                <p className={`font-bold ${textPrimary}`}>All Exams</p>
                <p className={`text-xs mt-0.5 ${textMuted}`}>{allExams.length} total</p>
              </div>
              <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Select Subject */}
        {step === 'subject' && (
          <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {subjects.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-white/15' : 'text-slate-300'}`} />
                <p className={textMuted}>No exams found for {level?.name}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((s, i) => (
                  <motion.button key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => selectSubject(s)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-left group ${card} hover:border-violet-500/30`}>
                    <span className="text-xl">{s.icon || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${textPrimary}`}>{s.name}</p>
                      <p className={`text-[11px] ${textMuted}`}>
                        {allExams.filter(e => e.subject_id === s.id).length} exams
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
                  </motion.button>
                ))}
                {/* All in level */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: subjects.length * 0.06 }}
                  onClick={() => { setExams(allExams.filter(e => e.level_name === level?.name || !e.level_name)); setStep('exams'); }}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-left group ${card} hover:border-violet-500/30 col-span-full sm:col-auto`}>
                  <Layers className={`w-5 h-5 text-violet-400`} />
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${textPrimary}`}>All {level?.name}</p>
                    <p className={`text-[11px] ${textMuted}`}>View all exams in this level</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Exams Grid */}
        {step === 'exams' && (
          <motion.div key="exams" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {exams.length === 0 ? (
              <div className={`${card} rounded-3xl text-center py-24`}>
                <GraduationCap className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-white/10' : 'text-slate-200'}`} />
                <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>No exams available</h3>
                <p className={`text-sm ${textMuted}`}>Check back soon — your teachers are preparing exams for you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {exams.map((exam, i) => {
                  const diffColor = DIFF_COLORS[exam.difficulty] || '#7c3aed';
                  const canStart = !!exam.chapter_id;
                  return (
                    <motion.div key={exam.id}
                      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className={`${card} p-6 rounded-2xl flex flex-col gap-4 group hover:border-purple-500/30 transition-all duration-200`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ background: `${diffColor}15`, color: diffColor, borderColor: `${diffColor}30` }}>
                              {exam.difficulty || 'mixed'}
                            </span>
                            {exam.subject_name && (
                              <span className="flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.05] px-2 py-0.5 rounded-full">
                                <span>{exam.subject_icon}</span> {exam.subject_name}
                              </span>
                            )}
                          </div>
                          <h3 className={`font-bold text-base leading-snug ${textPrimary}`}>{exam.title}</h3>
                          {exam.description && (
                            <p className={`text-xs mt-1 line-clamp-2 ${textMuted}`}>{exam.description}</p>
                          )}
                          {exam.chapter_title && (
                            <p className={`flex items-center gap-1 text-xs mt-1.5 ${textMuted}`}>
                              <FileText className="w-3 h-3" /> {exam.chapter_title}
                            </p>
                          )}
                        </div>
                        <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: `${diffColor}12`, border: `1px solid ${diffColor}25` }}>
                          <GraduationCap className="w-5 h-5" style={{ color: diffColor }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { icon: <Clock className="w-3.5 h-3.5" />, value: `${exam.duration_minutes}m`, label: 'Duration' },
                          { icon: <Target className="w-3.5 h-3.5" />, value: exam.question_count, label: 'Questions' },
                          { icon: <Trophy className="w-3.5 h-3.5" />, value: exam.total_marks, label: 'Marks' },
                          { icon: <CheckCircle className="w-3.5 h-3.5" />, value: exam.passing_marks, label: 'Pass' },
                        ].map((s, j) => (
                          <div key={j} className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div className={`flex items-center justify-center gap-1 mb-0.5 ${textMuted}`}>{s.icon}</div>
                            <div className={`font-bold text-sm ${textPrimary}`}>{s.value}</div>
                            <div className={`text-[10px] ${textMuted}`}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {canStart ? (
                        <Link to={`/chapter/${exam.chapter_id}/exam`}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                          style={{ background: `linear-gradient(135deg, ${diffColor}cc, ${diffColor}99)` }}>
                          <Play className="w-4 h-4" />
                          Start Exam
                        </Link>
                      ) : exam.subject_id ? (
                        <Link to={`/subject/${exam.subject_id}`}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border ${
                            isDark ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white border-white/10'
                              : 'bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700 border-slate-200'
                          }`}>
                          <BookOpen className="w-4 h-4" />
                          View Subject
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm border cursor-not-allowed ${
                          isDark ? 'text-white/25 border-white/[0.06]' : 'text-slate-300 border-slate-100'
                        }`}>
                          Coming Soon
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
