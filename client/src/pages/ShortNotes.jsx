import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ArrowLeft, FileText, Download,
  Loader2, EyeOff, BookOpen, AlignLeft, ExternalLink,
} from 'lucide-react';
import api from '../api';

/* ─── Colour palette per level index ─── */
const LEVEL_PALETTE = [
  { gradient: 'from-purple-600/25 to-violet-800/10', accent: '#a855f7', ring: 'ring-purple-500/30' },
  { gradient: 'from-amber-600/25 to-yellow-700/10',  accent: '#f59e0b', ring: 'ring-amber-500/30'  },
  { gradient: 'from-cyan-600/25 to-sky-700/10',      accent: '#06b6d4', ring: 'ring-cyan-500/30'   },
  { gradient: 'from-emerald-600/25 to-green-700/10', accent: '#10b981', ring: 'ring-emerald-500/30' },
];
const palette = (i) => LEVEL_PALETTE[i % LEVEL_PALETTE.length];

/* ─── Breadcrumb ─── */
function Breadcrumb({ level, subject, chapter, onLevel, onSubject, onRoot }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white/40 flex-wrap">
      <button onClick={onRoot} className="hover:text-white/80 transition-colors">Short Notes</button>
      {level && <>
        <ChevronRight size={12} />
        <button onClick={onLevel} className="hover:text-white/80 transition-colors">{level.name}</button>
      </>}
      {subject && <>
        <ChevronRight size={12} />
        <button onClick={onSubject} className="hover:text-white/80 transition-colors">{subject.name}</button>
      </>}
      {chapter && <>
        <ChevronRight size={12} />
        <span className="text-white/70">{chapter.title}</span>
      </>}
    </div>
  );
}

/* ─── Card ─── */
const Card = ({ children, onClick, className = '' }) => (
  <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
    onClick={onClick}
    className={`cursor-pointer p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all ${className}`}>
    {children}
  </motion.div>
);

/* ────────────────────────────────────────── */
export default function ShortNotes() {
  const [pageLoading, setPageLoading] = useState(true);
  const [globalVisible, setGlobalVisible] = useState(true);
  const [levels, setLevels] = useState([]);

  /* Navigation state */
  const [view, setView] = useState('levels');          /* 'levels' | 'subjects' | 'chapters' | 'note' */
  const [currentLevel,   setCurrentLevel]   = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);

  /* Lists */
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  /* Note */
  const [note,        setNote]        = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);

  /* Loading spinners */
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCh,  setLoadingCh]  = useState(false);

  /* ─── Boot ─── */
  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, levelsRes] = await Promise.all([
          api.get('/shortnotes/settings'),
          api.get('/shortnotes/levels'),
        ]);
        setGlobalVisible(settingsRes.data?.shortnotes_visible !== false);
        setLevels((levelsRes.data || []).filter(l => l.is_visible));
      } catch {}
      finally { setPageLoading(false); }
    })();
  }, []);

  /* ─── Select level ─── */
  const selectLevel = async (level) => {
    setCurrentLevel(level);
    setCurrentSubject(null);
    setCurrentChapter(null);
    setSubjects([]);
    setLoadingSub(true);
    setView('subjects');
    try {
      const r = await api.get(`/shortnotes/levels/${level.id}/subjects`);
      setSubjects((r.data || []).filter(s => s.is_visible));
    } catch { setSubjects([]); }
    finally { setLoadingSub(false); }
  };

  /* ─── Select subject ─── */
  const selectSubject = async (subject) => {
    setCurrentSubject(subject);
    setCurrentChapter(null);
    setChapters([]);
    setLoadingCh(true);
    setView('chapters');
    try {
      const r = await api.get(`/shortnotes/subjects/${subject.id}/chapters`);
      setChapters((r.data || []).filter(c => c.is_visible));
    } catch { setChapters([]); }
    finally { setLoadingCh(false); }
  };

  /* ─── Select chapter → load note ─── */
  const selectChapter = async (chapter) => {
    setCurrentChapter(chapter);
    setNote(null);
    setNoteLoading(true);
    setView('note');
    try {
      const r = await api.get(`/shortnotes/chapters/${chapter.id}/note`);
      setNote(r.data || null);
    } catch { setNote(null); }
    finally { setNoteLoading(false); }
  };

  /* ─── Navigation helpers ─── */
  const goRoot    = () => { setView('levels');   setCurrentLevel(null);   setCurrentSubject(null); setCurrentChapter(null); };
  const goLevel   = () => { setView('subjects'); setCurrentSubject(null); setCurrentChapter(null); };
  const goSubject = () => { setView('chapters'); setCurrentChapter(null); };

  /* ─── Page loading ─── */
  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
      <Loader2 size={32} className="animate-spin text-purple-400" />
    </div>
  );

  /* ─── Hidden ─── */
  if (!globalVisible) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
      <div className="text-center max-w-sm">
        <EyeOff size={48} className="mx-auto mb-4 text-white/20" />
        <h2 className="text-xl font-bold text-white/70 mb-2">Short Notes Unavailable</h2>
        <p className="text-white/40 text-sm">Short Notes are currently not available. Please check back later.</p>
      </div>
    </div>
  );

  const bg = 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)';

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen size={24} className="text-purple-400" />
              Short Notes
            </h1>
            <div className="mt-2">
              <Breadcrumb
                level={currentLevel} subject={currentSubject} chapter={currentChapter}
                onRoot={goRoot} onLevel={goLevel} onSubject={goSubject}
              />
            </div>
          </div>
          {view !== 'levels' && (
            <button onClick={() => {
              if (view === 'note')     goSubject();
              else if (view === 'chapters') goLevel();
              else goRoot();
            }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white transition-all text-sm">
              <ArrowLeft size={15} />Back
            </button>
          )}
        </div>

        {/* ── Levels view ── */}
        <AnimatePresence mode="wait">
          {view === 'levels' && (
            <motion.div key="levels" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.length === 0 ? (
                <div className="col-span-full text-center py-16 text-white/30">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No levels available yet.</p>
                </div>
              ) : levels.map((level, i) => {
                const p = palette(i);
                return (
                  <Card key={level.id} onClick={() => selectLevel(level)}
                    className={`bg-gradient-to-br ${p.gradient}`}>
                    <div className="text-3xl mb-3">{level.icon}</div>
                    <h3 className="text-lg font-bold text-white">{level.name}</h3>
                    {level.description && <p className="text-sm text-white/50 mt-1">{level.description}</p>}
                    <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color: p.accent }}>
                      Explore subjects <ChevronRight size={12} />
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {/* ── Subjects view ── */}
          {view === 'subjects' && (
            <motion.div key="subjects" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }}>
              {loadingSub ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-purple-400" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No subjects available for this level yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {subjects.map((subject, i) => {
                    const p = palette(i);
                    return (
                      <Card key={subject.id} onClick={() => selectSubject(subject)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: `${p.accent}22` }}>
                            {subject.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{subject.name}</p>
                            {subject.description && <p className="text-xs text-white/40 truncate mt-0.5">{subject.description}</p>}
                          </div>
                          <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Chapters view ── */}
          {view === 'chapters' && (
            <motion.div key="chapters" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }}>
              {loadingCh ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-purple-400" />
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <FileText size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No chapters available for this subject yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter, i) => (
                    <Card key={chapter.id} onClick={() => selectChapter(chapter)}>
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white/50">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{chapter.title}</p>
                          {chapter.description && <p className="text-xs text-white/40 mt-0.5">{chapter.description}</p>}
                        </div>
                        {/* Note type badge */}
                        {chapter.note_type === 'pdf' && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-rose-500/15 text-rose-300 flex-shrink-0">
                            <FileText size={11} />PDF
                          </span>
                        )}
                        {chapter.note_type === 'text' && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-500/15 text-blue-300 flex-shrink-0">
                            <AlignLeft size={11} />Text
                          </span>
                        )}
                        {!chapter.note_type && (
                          <span className="text-xs text-white/20 flex-shrink-0">No note</span>
                        )}
                        <ChevronRight size={15} className="text-white/30 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Note view ── */}
          {view === 'note' && (
            <motion.div key="note" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.2 }}
              className="space-y-4">
              {/* Chapter header */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">{currentSubject?.name}</p>
                    <h2 className="text-xl font-bold text-white">{currentChapter?.title}</h2>
                    {currentChapter?.description && (
                      <p className="text-sm text-white/50 mt-1">{currentChapter.description}</p>
                    )}
                  </div>
                  {note?.type === 'pdf' && note.filename && (
                    <a href={`/api/shortnotes/file/${note.filename}`}
                      download={note.original_name}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors text-sm flex-shrink-0">
                      <Download size={14} />Download
                    </a>
                  )}
                </div>
              </div>

              {/* Note content */}
              {noteLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-purple-400" />
                </div>
              ) : !note ? (
                <div className="text-center py-16 text-white/30 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <FileText size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No short note available for this chapter yet.</p>
                </div>
              ) : !note.is_visible ? (
                <div className="text-center py-16 text-white/30 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <EyeOff size={36} className="mx-auto mb-3 opacity-30" />
                  <p>This note is currently unavailable.</p>
                </div>
              ) : note.type === 'pdf' ? (
                /* PDF viewer */
                <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <FileText size={14} className="text-rose-400" />
                      {note.original_name}
                    </div>
                    <a href={`/api/shortnotes/file/${note.filename}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      <ExternalLink size={12} />Open in new tab
                    </a>
                  </div>
                  <iframe
                    src={`/api/shortnotes/file/${note.filename}#toolbar=1&navpanes=1`}
                    title={note.original_name}
                    className="w-full bg-white"
                    style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
                  />
                </div>
              ) : (
                /* Text note */
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                    <AlignLeft size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-white/60">Short Note</span>
                  </div>
                  <div className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {note.text_content || <span className="text-white/30 italic">Empty note</span>}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
