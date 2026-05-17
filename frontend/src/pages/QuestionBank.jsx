import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ArrowLeft, HelpCircle, FileText, AlignLeft,
  Loader2, EyeOff, BookOpen, ExternalLink, Download,
  CheckCircle, XCircle, RotateCcw, Trophy, ChevronLeft,
} from 'lucide-react';
import api from '../api';

const PALETTE = [
  { gradient:'from-indigo-600/25 to-violet-800/10', accent:'#818cf8', badge:'bg-indigo-500/20 text-indigo-300' },
  { gradient:'from-amber-600/25 to-yellow-700/10',  accent:'#f59e0b', badge:'bg-amber-500/20 text-amber-300'   },
  { gradient:'from-cyan-600/25 to-sky-700/10',      accent:'#06b6d4', badge:'bg-cyan-500/20 text-cyan-300'     },
  { gradient:'from-emerald-600/25 to-green-700/10', accent:'#10b981', badge:'bg-emerald-500/20 text-emerald-300' },
];
const pal = (i) => PALETTE[i % PALETTE.length];

/* ─── MCQ Quiz View ─── */
function QuizView({ chapterId, onBack }) {
  const [mcqs, setMcqs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [selected, setSelected]       = useState(null);
  const [showResult, setShowResult]   = useState(false);
  const [score, setScore]             = useState(0);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await api.get(`/qbank/chapters/${chapterId}/mcqs`); setMcqs(r.data||[]); }
      catch {} finally { setLoading(false); }
    })();
  }, [chapterId]);

  const current = mcqs[currentIdx];

  const handleAnswer = (opt) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
    if (opt === current.correct_option) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx >= mcqs.length - 1) { setDone(true); return; }
    setCurrentIdx(i => i + 1);
    setSelected(null);
    setShowResult(false);
  };

  const restart = () => { setCurrentIdx(0); setSelected(null); setShowResult(false); setScore(0); setDone(false); };

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-indigo-400"/></div>;

  if (!mcqs.length) return (
    <div className="text-center py-16 text-white/30 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <HelpCircle size={36} className="mx-auto mb-3 opacity-30"/>
      <p>No questions available for this chapter.</p>
    </div>
  );

  /* ── Quiz complete ── */
  if (done) {
    const pct = Math.round((score / mcqs.length) * 100);
    const grade = pct >= 80 ? { label:'Excellent!', color:'text-emerald-400', icon:'🏆' }
                : pct >= 60 ? { label:'Good Work!', color:'text-amber-400',   icon:'⭐' }
                :             { label:'Keep Trying', color:'text-rose-400',    icon:'📚' };
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.3 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
        <div className="text-5xl mb-4">{grade.icon}</div>
        <h2 className={`text-3xl font-bold ${grade.color}`}>{grade.label}</h2>
        <p className="text-white/50 mt-2">You scored</p>
        <div className="my-6">
          <span className="text-6xl font-bold text-white">{score}</span>
          <span className="text-2xl text-white/40">/{mcqs.length}</span>
        </div>
        <div className="w-full bg-white/[0.06] rounded-full h-3 mb-6 max-w-xs mx-auto">
          <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${pct}%` }}/>
        </div>
        <p className="text-white/50 text-sm mb-6">{pct}% correct</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.07] text-white/70 hover:bg-white/[0.12] transition-colors text-sm">
            <RotateCcw size={15}/>Retry Quiz
          </button>
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
            <ArrowLeft size={15}/>Back
          </button>
        </div>
      </motion.div>
    );
  }

  const opts = ['a','b','c','d'];
  const optLabels = { a:'A', b:'B', c:'C', d:'D' };

  const getOptClass = (opt) => {
    if (!showResult) return 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.09] hover:border-white/20 text-white/85 cursor-pointer';
    if (opt === current.correct_option) return 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200';
    if (opt === selected && opt !== current.correct_option) return 'bg-red-500/20 border border-red-500/40 text-red-200';
    return 'bg-white/[0.02] border border-white/[0.05] text-white/40';
  };

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-white/50">
        <span>Question {currentIdx + 1} of {mcqs.length}</span>
        <span className="text-emerald-400 font-medium">{score} correct</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentIdx + (showResult ? 1 : 0)) / mcqs.length) * 100}%` }}/>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIdx} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-4">
            <p className="text-white font-medium text-base leading-relaxed">{current.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {opts.map(opt => (
              <button key={opt} onClick={() => handleAnswer(opt)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left ${getOptClass(opt)}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                  ${showResult && opt===current.correct_option ? 'bg-emerald-500 text-white'
                  : showResult && opt===selected && opt!==current.correct_option ? 'bg-red-500 text-white'
                  : selected===opt && !showResult ? 'bg-indigo-500 text-white'
                  : 'bg-white/[0.07] text-white/50'}`}>
                  {optLabels[opt]}
                </span>
                <span className="flex-1 text-sm leading-snug">{current[`option_${opt}`]}</span>
                {showResult && opt===current.correct_option && <CheckCircle size={18} className="text-emerald-400 flex-shrink-0"/>}
                {showResult && opt===selected && opt!==current.correct_option && <XCircle size={18} className="text-red-400 flex-shrink-0"/>}
              </button>
            ))}
          </div>

          {/* Explanation + Next */}
          {showResult && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
              {current.explanation && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs font-semibold text-indigo-300 mb-1">Explanation</p>
                  <p className="text-sm text-white/75 leading-relaxed">{current.explanation}</p>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity">
                  {currentIdx >= mcqs.length - 1 ? 'See Results' : 'Next'} <ChevronRight size={15}/>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── PDF View ─── */
function PDFView({ content }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <FileText size={14} className="text-rose-400"/>
          {content.original_name}
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/qbank/file/${content.filename}`} download={content.original_name}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.07] text-white/60 hover:bg-white/[0.12] hover:text-white transition-colors">
            <Download size={12}/>Download
          </a>
          <a href={`/api/qbank/file/${content.filename}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <ExternalLink size={12}/>Open
          </a>
        </div>
      </div>
      <iframe src={`/api/qbank/file/${content.filename}#toolbar=1&navpanes=1`} title={content.original_name}
        className="w-full bg-white" style={{ height:'calc(100vh - 300px)', minHeight:'500px' }}/>
    </div>
  );
}

/* ─── Text View ─── */
function TextView({ content }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
        <AlignLeft size={16} className="text-blue-400"/>
        <span className="text-sm font-medium text-white/60">Text Notes</span>
      </div>
      <div className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
        {content.text_content || <span className="text-white/30 italic">Empty note</span>}
      </div>
    </div>
  );
}

/* ─── Breadcrumb ─── */
function Breadcrumb({ level, subject, chapter, onRoot, onLevel, onSubject }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white/40 flex-wrap">
      <button onClick={onRoot} className="hover:text-white/80 transition-colors">Question Bank</button>
      {level && <><ChevronRight size={12}/><button onClick={onLevel} className="hover:text-white/80 transition-colors">{level.name}</button></>}
      {subject && <><ChevronRight size={12}/><button onClick={onSubject} className="hover:text-white/80 transition-colors">{subject.name}</button></>}
      {chapter && <><ChevronRight size={12}/><span className="text-white/70">{chapter.title}</span></>}
    </div>
  );
}

/* ════ MAIN ════ */
export default function QuestionBank() {
  const [pageLoading, setPageLoading]   = useState(true);
  const [globalVisible, setGlobalVisible] = useState(true);
  const [levels, setLevels]             = useState([]);

  const [view, setView]                 = useState('levels');
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);

  const [subjects, setSubjects]         = useState([]);
  const [chapters, setChapters]         = useState([]);
  const [contents, setContents]         = useState({});

  const [activeContentTab, setActiveContentTab] = useState(null);

  const [loadingSub, setLoadingSub]     = useState(false);
  const [loadingCh,  setLoadingCh]      = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, levelsRes] = await Promise.all([api.get('/qbank/settings'), api.get('/qbank/levels')]);
        setGlobalVisible(settingsRes.data?.qbank_visible !== false);
        setLevels((levelsRes.data||[]).filter(l => l.is_visible));
      } catch {} finally { setPageLoading(false); }
    })();
  }, []);

  const selectLevel = async (level) => {
    setCurrentLevel(level); setCurrentSubject(null); setCurrentChapter(null);
    setSubjects([]); setLoadingSub(true); setView('subjects');
    try { const r = await api.get(`/qbank/levels/${level.id}/subjects`); setSubjects((r.data||[]).filter(s => s.is_visible)); }
    catch {} finally { setLoadingSub(false); }
  };

  const selectSubject = async (subject) => {
    setCurrentSubject(subject); setCurrentChapter(null);
    setChapters([]); setLoadingCh(true); setView('chapters');
    try { const r = await api.get(`/qbank/subjects/${subject.id}/chapters`); setChapters((r.data||[]).filter(c => c.is_visible)); }
    catch {} finally { setLoadingCh(false); }
  };

  const selectChapter = async (chapter) => {
    setCurrentChapter(chapter); setContents({});
    setLoadingContent(true); setView('content');
    try {
      const r = await api.get(`/qbank/chapters/${chapter.id}/contents`);
      const visible = {};
      Object.entries(r.data||{}).forEach(([type, c]) => { if (c.is_visible !== false) visible[type] = c; });
      setContents(visible);
      const types = Object.keys(visible);
      setActiveContentTab(types[0] || null);
    } catch {} finally { setLoadingContent(false); }
  };

  const goRoot    = () => { setView('levels');   setCurrentLevel(null);   setCurrentSubject(null); setCurrentChapter(null); };
  const goLevel   = () => { setView('subjects'); setCurrentSubject(null); setCurrentChapter(null); };
  const goSubject = () => { setView('chapters'); setCurrentChapter(null); };
  const goBack    = () => {
    if (view==='content')   goSubject();
    else if (view==='chapters') goLevel();
    else goRoot();
  };

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#020818' }}>
      <Loader2 size={32} className="animate-spin text-indigo-400"/>
    </div>
  );

  if (!globalVisible) return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-[68px]" style={{ background:'#020818' }}>
      <div className="text-center max-w-sm">
        <EyeOff size={48} className="mx-auto mb-4 text-white/20"/>
        <h2 className="text-xl font-bold text-white/70 mb-2">Question Bank Unavailable</h2>
        <p className="text-white/40 text-sm">The Question Bank is not available at this time.</p>
      </div>
    </div>
  );

  const contentTypes = Object.keys(contents);
  const TYPE_CONFIG = {
    mcq:  { label:'MCQ Quiz',  icon:<HelpCircle  size={14} className="text-purple-400"/>, badge:'bg-purple-500/20 text-purple-300' },
    pdf:  { label:'PDF Notes', icon:<FileText    size={14} className="text-rose-400"/>,   badge:'bg-rose-500/20 text-rose-300'     },
    text: { label:'Text Notes',icon:<AlignLeft   size={14} className="text-blue-400"/>,   badge:'bg-blue-500/20 text-blue-300'     },
  };

  return (
    <div className="min-h-screen" style={{ background:'#020818' }}>
      <div className="max-w-4xl mx-auto px-4 pt-[84px] pb-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <HelpCircle size={24} className="text-indigo-400"/>Question Bank
            </h1>
            <div className="mt-2">
              <Breadcrumb level={currentLevel} subject={currentSubject} chapter={currentChapter}
                onRoot={goRoot} onLevel={goLevel} onSubject={goSubject}/>
            </div>
          </div>
          {view !== 'levels' && (
            <button onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white transition-all text-sm flex-shrink-0">
              <ArrowLeft size={15}/>Back
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Levels ── */}
          {view==='levels' && (
            <motion.div key="levels" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.length===0 ? (
                <div className="col-span-full text-center py-16 text-white/30">
                  <HelpCircle size={40} className="mx-auto mb-3 opacity-30"/>
                  <p>No levels available yet.</p>
                </div>
              ) : levels.map((level, i) => {
                const p = pal(i);
                return (
                  <motion.div key={level.id} whileHover={{scale:1.015}} whileTap={{scale:0.985}}
                    onClick={() => selectLevel(level)}
                    className={`cursor-pointer p-5 rounded-2xl border border-white/[0.08] bg-gradient-to-br ${p.gradient} hover:border-white/20 transition-all`}>
                    <div className="text-3xl mb-3">{level.icon}</div>
                    <h3 className="text-lg font-bold text-white">{level.name}</h3>
                    {level.description && <p className="text-sm text-white/50 mt-1">{level.description}</p>}
                    <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{color:p.accent}}>
                      Explore <ChevronRight size={12}/>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── Subjects ── */}
          {view==='subjects' && (
            <motion.div key="subjects" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
              {loadingSub ? <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400"/></div>
              : subjects.length===0 ? <div className="text-center py-16 text-white/30"><BookOpen size={36} className="mx-auto mb-3 opacity-30"/><p>No subjects available yet.</p></div>
              : <div className="grid sm:grid-cols-2 gap-3">
                  {subjects.map((subject, i) => {
                    const p = pal(i);
                    return (
                      <motion.div key={subject.id} whileHover={{scale:1.015}} whileTap={{scale:0.985}}
                        onClick={() => selectSubject(subject)}
                        className="cursor-pointer p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 transition-all flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:`${p.accent}22`}}>
                          {subject.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{subject.name}</p>
                          {subject.description && <p className="text-xs text-white/40 truncate mt-0.5">{subject.description}</p>}
                        </div>
                        <ChevronRight size={16} className="text-white/30 flex-shrink-0"/>
                      </motion.div>
                    );
                  })}
                </div>
              }
            </motion.div>
          )}

          {/* ── Chapters ── */}
          {view==='chapters' && (
            <motion.div key="chapters" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
              {loadingCh ? <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400"/></div>
              : chapters.length===0 ? <div className="text-center py-16 text-white/30"><HelpCircle size={36} className="mx-auto mb-3 opacity-30"/><p>No chapters available yet.</p></div>
              : <div className="space-y-2">
                  {chapters.map((chapter, i) => {
                    const visibleContents = (chapter.contents||[]).filter(c => c.visible!==false);
                    return (
                      <motion.div key={chapter.id} whileHover={{scale:1.005}} whileTap={{scale:0.995}}
                        onClick={() => selectChapter(chapter)}
                        className="cursor-pointer p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 transition-all flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white/50">
                          {i+1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{chapter.title}</p>
                          {chapter.description && <p className="text-xs text-white/40 mt-0.5 truncate">{chapter.description}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {visibleContents.map(c => {
                            const cfg = TYPE_CONFIG[c.type];
                            return cfg ? <span key={c.type} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg ${cfg.badge}`}>{cfg.icon}{cfg.label}</span> : null;
                          })}
                          {visibleContents.length===0 && <span className="text-xs text-white/20">No content</span>}
                        </div>
                        <ChevronRight size={15} className="text-white/30 flex-shrink-0"/>
                      </motion.div>
                    );
                  })}
                </div>
              }
            </motion.div>
          )}

          {/* ── Content view ── */}
          {view==='content' && (
            <motion.div key="content" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}
              className="space-y-4">
              {/* Chapter header */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">{currentSubject?.name}</p>
                <h2 className="text-xl font-bold text-white">{currentChapter?.title}</h2>
                {currentChapter?.description && <p className="text-sm text-white/50 mt-1">{currentChapter.description}</p>}
              </div>

              {loadingContent ? (
                <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-indigo-400"/></div>
              ) : contentTypes.length===0 ? (
                <div className="text-center py-16 text-white/30 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <EyeOff size={36} className="mx-auto mb-3 opacity-30"/>
                  <p>No content available for this chapter yet.</p>
                </div>
              ) : (
                <>
                  {/* Content type tabs (if multiple) */}
                  {contentTypes.length > 1 && (
                    <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl">
                      {contentTypes.map(type => {
                        const cfg = TYPE_CONFIG[type];
                        return (
                          <button key={type} onClick={() => setActiveContentTab(type)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeContentTab===type ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>
                            {cfg?.icon}{cfg?.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Content */}
                  {activeContentTab==='mcq' && <QuizView chapterId={currentChapter?.id} onBack={goSubject}/>}
                  {activeContentTab==='pdf' && contents.pdf && <PDFView content={contents.pdf}/>}
                  {activeContentTab==='text' && contents.text && <TextView content={contents.text}/>}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
