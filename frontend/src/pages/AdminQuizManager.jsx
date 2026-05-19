import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, BookOpen, Layers, ChevronRight, ArrowLeft, CheckCircle,
  Brain, Save, Loader2, RefreshCw, X, AlertCircle, HelpCircle
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const LEVELS = [
  { name: 'Certificate', icon: '📜', color: '#3b82f6' },
  { name: 'Professional', icon: '💼', color: '#8b5cf6' },
  { name: 'Advanced', icon: '🏆', color: '#f59e0b' },
];

export default function AdminQuizManager() {
  const { isDark } = useTheme();
  const [step, setStep] = useState('level');
  const [level, setLevel] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [allMCQs, setAllMCQs] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectLevel = async (lv) => {
    setLevel(lv);
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.filter(s => s.class_level === lv.name));
      setStep('subject');
    } catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const selectSubject = async (s) => {
    setSubject(s);
    setLoading(true);
    try {
      const res = await api.get(`/subjects/${s.id}/chapters`);
      setChapters(res.data || []);
      setStep('chapter');
    } catch { toast.error('Failed to load chapters'); }
    finally { setLoading(false); }
  };

  const selectChapter = async (c) => {
    setChapter(c);
    setSelectedIds([]);
    setLoading(true);
    try {
      const res = await api.get(`/mcqs/chapter/${c.id}`);
      setAllMCQs(res.data.questions || []);
      setStep('select');
    } catch { toast.error('Failed to load MCQs'); }
    finally { setLoading(false); }
  };

  const toggleMCQ = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 10) { toast.warning('Maximum 10 MCQs per quiz'); return prev; }
      return [...prev, id];
    });
  };

  const generateQuiz = async () => {
    if (selectedIds.length < 1) return toast.error('Select at least 1 MCQ');
    setSaving(true);
    try {
      await api.post('/mcqs/quiz-template', {
        chapter_id: chapter.id,
        mcq_ids: selectedIds,
        title: `${chapter.title} Quiz`,
      });
      toast.success(`Quiz generated with ${selectedIds.length} questions!`);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz');
    } finally { setSaving(false); }
  };

  const goBack = () => {
    if (step === 'subject') { setStep('level'); setSubjects([]); }
    else if (step === 'chapter') { setStep('subject'); setChapters([]); }
    else if (step === 'select') { setStep('chapter'); setAllMCQs([]); setSelectedIds([]); }
  };

  const card = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-violet-100 shadow-sm';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-white/40' : 'text-slate-400';

  return (
    <div className="px-4 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          {step !== 'level' && (
            <button onClick={goBack}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/[0.07] text-white/40 hover:text-white' : 'hover:bg-violet-50 text-slate-400 hover:text-slate-700'}`}>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textPrimary}`}>Quiz Manager</h1>
            <p className={`text-xs ${textMuted}`}>Level → Subject → Chapter → Select 10 MCQs</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mt-4 text-[11px] font-semibold flex-wrap">
          {[
            { label: level?.name || 'Level', active: step === 'level' },
            { label: subject?.name || 'Subject', active: step === 'subject' },
            { label: chapter?.title || 'Chapter', active: step === 'chapter' },
            { label: 'Select MCQs', active: step === 'select' },
          ].map((b, i) => (
            <React.Fragment key={i}>
              <span className={`transition-colors ${b.active ? 'text-violet-500' : textMuted}`}>{b.label}</span>
              {i < 3 && <ChevronRight className={`w-3 h-3 ${textMuted}`} />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* Step 1: Level */}
        {step === 'level' && (
          <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-3">
            {LEVELS.map((lv, i) => (
              <motion.button key={lv.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => selectLevel(lv)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 text-left group ${card} hover:border-violet-500/30`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${lv.color}18`, border: `1.5px solid ${lv.color}30` }}>
                  {lv.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-base ${textPrimary}`}>{lv.name}</p>
                </div>
                <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Step 2: Subject */}
        {step === 'subject' && (
          <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {loading ? <Spinner /> : subjects.length === 0 ? (
              <Empty icon={BookOpen} msg="No subjects found for this level" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((s, i) => (
                  <motion.button key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => selectSubject(s)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-left group ${card} hover:border-violet-500/30`}>
                    <span className="text-xl">{s.icon || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${textPrimary}`}>{s.name}</p>
                      <p className={`text-[11px] ${textMuted}`}>{s.chapter_count || 0} chapters</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Chapter */}
        {step === 'chapter' && (
          <motion.div key="chapter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {loading ? <Spinner /> : chapters.length === 0 ? (
              <Empty icon={Layers} msg="No chapters in this subject" />
            ) : (
              <div className="space-y-2">
                {chapters.map((c, i) => (
                  <motion.button key={c.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => selectChapter(c)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left group ${card} hover:border-violet-500/30`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${isDark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-100 text-violet-600'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${textPrimary}`}>{c.title}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-violet-400 transition-colors`} />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 4: Select MCQs */}
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Selection header */}
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${textMuted}`}>
                {chapter?.title} — Select up to <strong className={isDark ? 'text-white' : 'text-slate-700'}>10 MCQs</strong>
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${selectedIds.length === 10 ? 'text-amber-400' : 'text-violet-400'}`}>
                  {selectedIds.length}/10
                </span>
                <button onClick={generateQuiz} disabled={saving || selectedIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Generate Quiz
                </button>
              </div>
            </div>

            {loading ? <Spinner /> : allMCQs.length === 0 ? (
              <Empty icon={HelpCircle} msg="No MCQs in this chapter. Add MCQs first." />
            ) : (
              <div className="space-y-2">
                {allMCQs.map((q, i) => {
                  const sel = selectedIds.includes(q.id);
                  return (
                    <motion.button key={q.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      onClick={() => toggleMCQ(q.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl transition-all text-left ${
                        sel
                          ? 'border border-violet-500/50 bg-violet-500/[0.08]'
                          : `${card} hover:border-violet-500/20`
                      }`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        sel ? 'bg-violet-500 border-0' : isDark ? 'bg-white/[0.06] border border-white/15' : 'bg-slate-100 border border-slate-200'
                      }`}>
                        {sel
                          ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                          : <span className={`text-[10px] font-bold ${textMuted}`}>{i + 1}</span>}
                      </div>
                      <p className={`text-sm leading-relaxed flex-1 ${sel ? (isDark ? 'text-white' : 'text-slate-800') : textPrimary}`}>
                        {q.question}
                      </p>
                    </motion.button>
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

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-l-transparent border-r-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );
}

function Empty({ icon: Icon, msg }) {
  return (
    <div className="text-center py-20 card-premium rounded-3xl">
      <Icon className="w-12 h-12 text-white/15 mx-auto mb-4" />
      <p className="text-white/40">{msg}</p>
    </div>
  );
}
