import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight, ArrowLeft, FileText, Download, Loader2,
  EyeOff, BookOpen, FileSearch, ExternalLink
} from 'lucide-react';
import api from '../api';

const LEVEL_COLORS = ['#7c3aed', '#f59e0b', '#06b6d4'];
const LEVEL_BG = [
  'from-purple-600/20 to-violet-800/10',
  'from-amber-600/20 to-yellow-700/10',
  'from-cyan-600/20 to-sky-700/10',
];

export default function ShortNotes() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [levels, setLevels] = useState([]);

  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCh, setLoadingCh] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [settingsRes, levelsRes] = await Promise.all([
          api.get('/shortnotes/settings'),
          api.get('/shortnotes/levels'),
        ]);
        setVisible(settingsRes.data.shortnotes_visible);
        setLevels(levelsRes.data.filter(l => l.is_visible));
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const selectLevel = async (level) => {
    setCurrentLevel(level);
    setCurrentSubject(null);
    setCurrentChapter(null);
    setLoadingSub(true);
    try {
      const r = await api.get(`/shortnotes/levels/${level.id}/subjects`);
      setSubjects(r.data.filter(s => s.is_visible));
    } catch { setSubjects([]); }
    finally { setLoadingSub(false); }
  };

  const selectSubject = async (subject) => {
    setCurrentSubject(subject);
    setCurrentChapter(null);
    setLoadingCh(true);
    try {
      const r = await api.get(`/shortnotes/subjects/${subject.id}/chapters`);
      setChapters(r.data.filter(c => c.is_visible));
    } catch { setChapters([]); }
    finally { setLoadingCh(false); }
  };

  const selectChapter = (chapter) => setCurrentChapter(chapter);

  const goBack = () => {
    if (currentChapter) { setCurrentChapter(null); return; }
    if (currentSubject) { setCurrentSubject(null); return; }
    if (currentLevel) { setCurrentLevel(null); }
  };

  const getPdfUrl = (filename) => `/api/shortnotes/file/${filename}`;

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
    </div>
  );

  if (!visible) return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <EyeOff className="w-7 h-7 text-white/20" />
      </div>
      <p className="text-white/30 font-medium">Short Notes are currently unavailable</p>
      <p className="text-white/15 text-sm mt-1">Check back later</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
        <button
          onClick={() => { setCurrentLevel(null); setCurrentSubject(null); setCurrentChapter(null); }}
          className={`font-medium transition-colors ${!currentLevel ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
          <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> Short Notes</span>
        </button>
        {currentLevel && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <button onClick={() => { setCurrentSubject(null); setCurrentChapter(null); }}
              className={`transition-colors ${!currentSubject ? 'text-white font-medium' : 'text-white/40 hover:text-white/70'}`}>
              {currentLevel.icon} {currentLevel.name}
            </button>
          </>
        )}
        {currentSubject && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <button onClick={() => setCurrentChapter(null)}
              className={`transition-colors ${!currentChapter ? 'text-white font-medium' : 'text-white/40 hover:text-white/70'}`}>
              {currentSubject.icon} {currentSubject.name}
            </button>
          </>
        )}
        {currentChapter && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-white font-medium truncate max-w-[160px]">{currentChapter.title}</span>
          </>
        )}
      </div>

      {/* Back button */}
      {currentLevel && (
        <button onClick={goBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-5 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      )}

      {/* VIEW: PDF Viewer */}
      {currentChapter && (
        <motion.div key="pdf-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-premium overflow-hidden">
            {currentChapter.filename ? (
              <>
                {/* PDF toolbar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{currentChapter.original_name || currentChapter.title}</p>
                      {currentChapter.file_size && (
                        <p className="text-white/30 text-xs">{formatSize(currentChapter.file_size)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={getPdfUrl(currentChapter.filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white text-xs font-medium transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                    <a
                      href={getPdfUrl(currentChapter.filename)}
                      download={currentChapter.original_name || `${currentChapter.title}.pdf`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 text-xs font-semibold transition-all border border-purple-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                </div>

                {/* Embedded PDF */}
                <div className="w-full bg-[#0a0f2e]" style={{ height: '75vh', minHeight: '480px' }}>
                  <iframe
                    src={`${getPdfUrl(currentChapter.filename)}#toolbar=1&navpanes=1&view=FitH`}
                    title={currentChapter.title}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <FileSearch className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/30 font-medium">No PDF uploaded yet</p>
                <p className="text-white/15 text-sm mt-1">The admin hasn't uploaded notes for this chapter</p>
              </div>
            )}

            {/* Chapter info */}
            <div className="p-5 border-t border-white/[0.07]">
              <h1 className="text-white font-bold text-xl mb-1">{currentChapter.title}</h1>
              {currentChapter.description && (
                <p className="text-white/45 text-sm leading-relaxed">{currentChapter.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-white/25 text-xs">{currentSubject?.icon} {currentSubject?.name}</span>
                <span className="text-white/15">·</span>
                <span className="text-white/25 text-xs">{currentLevel?.icon} {currentLevel?.name}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW: Chapters List */}
      {currentSubject && !currentChapter && (
        <motion.div key="chapters-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5">
            <h2 className="text-white font-bold text-xl">{currentSubject.icon} {currentSubject.name}</h2>
            {currentSubject.description && <p className="text-white/40 text-sm mt-1">{currentSubject.description}</p>}
          </div>
          {loadingCh ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16 card-premium">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/30 font-medium">No chapters yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((ch, i) => (
                <motion.button key={ch.id} onClick={() => selectChapter(ch)}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="w-full card-premium p-4 flex items-center gap-4 text-left group hover:border-purple-500/30 transition-all">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${ch.filename ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                    <FileText className={`w-5 h-5 ${ch.filename ? 'text-red-400' : 'text-white/20'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 font-semibold text-sm group-hover:text-white transition-colors">{ch.title}</p>
                    {ch.description && <p className="text-white/35 text-xs truncate mt-0.5">{ch.description}</p>}
                    {ch.filename ? (
                      <p className="text-emerald-400/60 text-[10px] mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 inline-block" />
                        PDF available · {formatSize(ch.file_size)}
                      </p>
                    ) : (
                      <p className="text-white/20 text-[10px] mt-0.5">No PDF uploaded</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* VIEW: Subjects List */}
      {currentLevel && !currentSubject && (
        <motion.div key="subjects-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5">
            <h2 className="text-white font-bold text-xl">{currentLevel.icon} {currentLevel.name}</h2>
            {currentLevel.description && <p className="text-white/40 text-sm mt-1">{currentLevel.description}</p>}
          </div>
          {loadingSub ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-16 card-premium">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/30 font-medium">No subjects yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((subj, i) => (
                <motion.button key={subj.id} onClick={() => selectSubject(subj)}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card-premium p-5 text-left group hover:border-purple-500/30 transition-all hover:-translate-y-0.5">
                  <div className="text-3xl mb-3">{subj.icon}</div>
                  <h3 className="text-white font-bold text-base group-hover:text-white transition-colors">{subj.name}</h3>
                  {subj.description && <p className="text-white/35 text-xs mt-1 line-clamp-2">{subj.description}</p>}
                  <div className="flex items-center gap-1 mt-3 text-purple-400/60 text-xs group-hover:text-purple-400 transition-colors">
                    <span>View chapters</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* VIEW: Levels (Home) */}
      {!currentLevel && (
        <motion.div key="levels-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-white font-bold text-2xl">Short Notes</h1>
            <p className="text-white/35 text-sm mt-1">Choose your level to access PDF notes</p>
          </div>
          {levels.length === 0 ? (
            <div className="text-center py-20 card-premium">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-white/30 font-medium">No short notes available yet</p>
              <p className="text-white/15 text-sm mt-1">Check back soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {levels.map((level, i) => (
                <motion.button key={level.id} onClick={() => selectLevel(level)}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`card-premium p-6 text-left group hover:-translate-y-1 transition-all bg-gradient-to-br ${LEVEL_BG[i % LEVEL_BG.length]} hover:border-white/20`}>
                  <div className="text-4xl mb-4">{level.icon}</div>
                  <h3 className="text-white font-black text-xl mb-1">{level.name}</h3>
                  {level.description && <p className="text-white/40 text-sm leading-relaxed">{level.description}</p>}
                  <div className="flex items-center gap-1.5 mt-4 font-semibold text-sm transition-colors"
                    style={{ color: LEVEL_COLORS[i % LEVEL_COLORS.length] }}>
                    <span>Open Notes</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
