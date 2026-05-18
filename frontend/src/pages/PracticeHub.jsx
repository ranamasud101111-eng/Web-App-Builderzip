import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Brain, BookOpen, Clock, Target,
  ChevronRight, Layers, CheckCircle, HelpCircle
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

const LEVELS = [
  { name: 'Certificate', icon: '📜', color: '#3b82f6', desc: 'Certificate Level — begin your ICAB CA journey' },
  { name: 'Professional', icon: '💼', color: '#8b5cf6', desc: 'Professional Level — build advanced competency' },
  { name: 'Advanced', icon: '🏆', color: '#f59e0b', desc: 'Advanced level — master the curriculum' },
];

const MODES = [
  { key: 'practice', label: 'Practice MCQ', icon: <Brain className="w-5 h-5" />, color: '#8b5cf6', desc: 'Solve all MCQs with instant feedback', path: (id) => `/chapter/${id}/practice` },
  { key: 'quiz', label: 'Chapter Quiz', icon: <Clock className="w-5 h-5" />, color: '#f59e0b', desc: '10 questions · 10 minutes · auto-submit', path: (id) => `/chapter/${id}/quiz` },
  { key: 'exam', label: 'Full Exam', icon: <Target className="w-5 h-5" />, color: '#10b981', desc: 'All MCQs · timed · full analysis', path: (id) => `/chapter/${id}/exam` },
];

export default function PracticeHub() {
  const navigate = useNavigate();
  const [step, setStep] = useState('level'); // level | subject | chapter | mode
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [mcqCounts, setMcqCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const selectLevel = async (level) => {
    setSelectedLevel(level);
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      const filtered = res.data.filter(s => s.class_level === level.name);
      setSubjects(filtered);
      setStep('subject');
    } catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const selectSubject = async (subject) => {
    setSelectedSubject(subject);
    setLoading(true);
    try {
      const res = await api.get(`/subjects/${subject.id}`);
      setChapters(res.data.chapters || []);
      // Fetch MCQ counts
      const counts = {};
      await Promise.all((res.data.chapters || []).map(async (c) => {
        try {
          const stat = await api.get(`/mcqs/stats/chapter/${c.id}`);
          counts[c.id] = stat.data.question_count || 0;
        } catch { counts[c.id] = 0; }
      }));
      setMcqCounts(counts);
      setStep('chapter');
    } catch { toast.error('Failed to load chapters'); }
    finally { setLoading(false); }
  };

  const selectChapter = (chapter) => {
    setSelectedChapter(chapter);
    setStep('mode');
  };

  const goBack = () => {
    if (step === 'subject') { setStep('level'); setSubjects([]); }
    else if (step === 'chapter') { setStep('subject'); setChapters([]); }
    else if (step === 'mode') { setStep('chapter'); }
  };

  const breadcrumb = [
    { label: 'Level', active: step === 'level' },
    { label: selectedLevel?.name || 'Subject', active: step === 'subject' },
    { label: selectedSubject?.name || 'Chapter', active: step === 'chapter' },
    { label: selectedChapter?.title || 'Mode', active: step === 'mode' },
  ];

  return (
    <div className="pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {step !== 'level' ? (
            <button onClick={goBack} className="flex items-center gap-2 text-white/35 hover:text-white text-sm group transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            </button>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-2 text-white/35 hover:text-white text-sm group transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
            </Link>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              <span className={`text-sm font-medium transition-colors ${b.active ? 'text-white' : 'text-white/30'}`}>{b.label}</span>
              {i < breadcrumb.length - 1 && <ChevronRight className="w-3 h-3 text-white/20" />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: Level */}
          {step === 'level' && (
            <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-3xl font-black text-white mb-2">Choose Level</h1>
              <p className="text-white/40 text-sm mb-8">Select the CA level you want to practice</p>
              <div className="flex flex-col gap-4">
                {LEVELS.map((level, i) => (
                  <motion.button key={level.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={() => selectLevel(level)}
                    className="card-premium p-6 text-left flex items-center gap-5 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="text-4xl">{level.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{level.name}</h3>
                      <p className="text-white/40 text-sm">{level.desc}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                      style={{ background: `${level.color}18`, border: `1px solid ${level.color}30` }}>
                      <ArrowRight className="w-4 h-4" style={{ color: level.color }} />
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Link to="/custom-exam"
                  className="card-premium p-5 flex items-center gap-4 flex-1 hover:border-purple-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/12 border border-purple-500/20 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Custom Exam</p>
                    <p className="text-white/35 text-xs">Pick your own mix of questions</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 ml-auto" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Step 2: Subject */}
          {step === 'subject' && (
            <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedLevel?.icon}</span>
                <h1 className="text-3xl font-black text-white">{selectedLevel?.name}</h1>
              </div>
              <p className="text-white/40 text-sm mb-8">Select a subject to practice</p>
              {loading ? <Spinner /> : subjects.length === 0 ? (
                <div className="text-center py-20 card-premium rounded-3xl">
                  <BookOpen className="w-12 h-12 text-white/15 mx-auto mb-4" />
                  <p className="text-white/40">No subjects found for this level</p>
                  <p className="text-white/25 text-sm mt-2">Add subjects with the "{selectedLevel?.name}" level in Admin.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {subjects.map((s, i) => (
                    <motion.button key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => selectSubject(s)}
                      className="card-premium p-5 text-left flex items-center gap-4 hover:border-white/20 hover:-translate-y-0.5 transition-all group">
                      <div className="text-2xl">{s.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{s.name}</h3>
                        <p className="text-white/35 text-xs mt-0.5">{s.chapter_count || 0} chapters</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${s.color || '#7c3aed'}18`, border: `1px solid ${s.color || '#7c3aed'}25` }}>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: s.color || '#7c3aed' }} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Chapter */}
          {step === 'chapter' && (
            <motion.div key="chapter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedSubject?.icon}</span>
                <span className="text-white/40 text-sm">{selectedSubject?.name}</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-8">Choose Chapter</h1>
              {loading ? <Spinner /> : chapters.length === 0 ? (
                <div className="text-center py-20 card-premium rounded-3xl">
                  <Layers className="w-12 h-12 text-white/15 mx-auto mb-4" />
                  <p className="text-white/40">No chapters in this subject yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {chapters.map((c, i) => {
                    const count = mcqCounts[c.id] || 0;
                    return (
                      <motion.button key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => selectChapter(c)}
                        disabled={count === 0}
                        className={`card-premium p-5 text-left flex items-center gap-4 transition-all ${count > 0 ? 'hover:border-white/20 hover:-translate-y-0.5 group' : 'opacity-40 cursor-not-allowed'}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                          style={{ background: `${selectedSubject?.color || '#7c3aed'}15`, color: selectedSubject?.color || '#7c3aed', border: `1px solid ${selectedSubject?.color || '#7c3aed'}20` }}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">{c.title}</h3>
                          <p className="text-white/35 text-xs mt-0.5">
                            {count > 0 ? `${count} MCQs available` : 'No MCQs yet'}
                          </p>
                        </div>
                        {count > 0 && <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 flex-shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Mode */}
          {step === 'mode' && (
            <motion.div key="mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/40 text-sm">{selectedSubject?.name}</span>
                <ChevronRight className="w-3 h-3 text-white/25" />
                <span className="text-white/40 text-sm">{selectedChapter?.title}</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-8">Choose Mode</h1>
              <div className="flex flex-col gap-4">
                {MODES.map((mode, i) => (
                  <motion.div key={mode.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Link to={mode.path(selectedChapter?.id)}
                      className="card-premium p-6 flex items-center gap-5 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 group block">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: `${mode.color}15`, border: `1px solid ${mode.color}25`, color: mode.color }}>
                        {mode.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-base mb-1">{mode.label}</h3>
                        <p className="text-white/40 text-sm">{mode.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
