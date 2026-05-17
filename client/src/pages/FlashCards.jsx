import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Layers, BookOpen, EyeOff, Loader2, Zap, RotateCcw, ChevronLeft, Check } from 'lucide-react';
import api from '../api';

const LEVEL_COLORS = ['from-yellow-600/20 to-amber-800/10', 'from-purple-600/20 to-violet-800/10', 'from-cyan-600/20 to-sky-700/10'];
const LEVEL_ACCENT = ['#f59e0b', '#8b5cf6', '#06b6d4'];

export default function FlashCards() {
  const [loading,     setLoading]     = useState(true);
  const [visible,     setVisible]     = useState(true);
  const [levels,      setLevels]      = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [chapters,    setChapters]    = useState([]);
  const [cardSet,     setCardSet]     = useState([]);

  const [curLevel,   setCurLevel]   = useState(null);
  const [curSubject, setCurSubject] = useState(null);
  const [curChapter, setCurChapter] = useState(null);

  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCh,  setLoadingCh]  = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);

  // Card viewer state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped,   setFlipped]   = useState(false);
  const [done,      setDone]      = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sRes, lRes] = await Promise.all([
          api.get('/flashcards/settings'),
          api.get('/flashcards/levels'),
        ]);
        setVisible(sRes.data.flashcards_visible);
        setLevels(lRes.data.filter(l => l.is_visible));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const selectLevel = async (level) => {
    setCurLevel(level); setCurSubject(null); setCurChapter(null); setCardSet([]);
    setLoadingSub(true);
    try {
      const r = await api.get(`/flashcards/levels/${level.id}/subjects`);
      setSubjects(r.data.filter(s => s.is_visible));
    } catch { setSubjects([]); }
    finally { setLoadingSub(false); }
  };

  const selectSubject = async (subj) => {
    setCurSubject(subj); setCurChapter(null); setCardSet([]);
    setLoadingCh(true);
    try {
      const r = await api.get(`/flashcards/subjects/${subj.id}/chapters`);
      setChapters(r.data.filter(c => c.is_visible));
    } catch { setChapters([]); }
    finally { setLoadingCh(false); }
  };

  const selectChapter = async (ch) => {
    setCurChapter(ch); setCardSet([]); setCardIndex(0); setFlipped(false); setDone(false);
    setLoadingCards(true);
    try {
      const r = await api.get(`/flashcards/chapters/${ch.id}/cards`);
      setCardSet(r.data);
    } catch { setCardSet([]); }
    finally { setLoadingCards(false); }
  };

  const goBack = () => {
    if (curChapter) { setCurChapter(null); setCardSet([]); setCardIndex(0); setFlipped(false); setDone(false); return; }
    if (curSubject) { setCurSubject(null); setChapters([]); return; }
    if (curLevel)   { setCurLevel(null);   setSubjects([]); }
  };

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      if (cardIndex < cardSet.length - 1) { setCardIndex(i => i + 1); }
      else { setDone(true); }
    }, 180);
  };

  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => {
      if (cardIndex > 0) setCardIndex(i => i - 1);
    }, 180);
  };

  const restart = () => { setCardIndex(0); setFlipped(false); setDone(false); };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
    </div>
  );

  if (!visible) return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <EyeOff className="w-7 h-7 text-white/20" />
      </div>
      <p className="text-white/30 font-medium">Flash Cards are currently unavailable</p>
      <p className="text-white/15 text-sm mt-1">Check back later</p>
    </div>
  );

  const currentCard = cardSet[cardIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
        <button onClick={() => { setCurLevel(null); setCurSubject(null); setCurChapter(null); setCardSet([]); }}
          className={`font-medium transition-colors ${!curLevel ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /> Flash Cards</span>
        </button>
        {curLevel && (
          <><ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <button onClick={() => { setCurSubject(null); setCurChapter(null); setCardSet([]); }}
              className={`transition-colors ${!curSubject ? 'text-white font-medium' : 'text-white/40 hover:text-white/70'}`}>
              {curLevel.icon} {curLevel.name}
            </button>
          </>
        )}
        {curSubject && (
          <><ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <button onClick={() => { setCurChapter(null); setCardSet([]); setCardIndex(0); setFlipped(false); setDone(false); }}
              className={`transition-colors ${!curChapter ? 'text-white font-medium' : 'text-white/40 hover:text-white/70'}`}>
              {curSubject.icon} {curSubject.name}
            </button>
          </>
        )}
        {curChapter && (
          <><ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-white font-medium truncate max-w-[160px]">{curChapter.name}</span>
          </>
        )}
      </div>

      {/* Back button */}
      {curLevel && (
        <button onClick={goBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-5 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>
      )}

      {/* ── CARD VIEWER ── */}
      {curChapter && (
        <AnimatePresence mode="wait">
          {loadingCards ? (
            <motion.div key="loading" className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            </motion.div>
          ) : cardSet.length === 0 ? (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-400/50" />
              </div>
              <p className="text-white/40 font-medium">No flash cards in this chapter yet</p>
            </motion.div>
          ) : done ? (
            /* ── Session Complete ── */
            <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-white font-black text-2xl mb-2">All Done!</h2>
              <p className="text-white/40 text-base mb-2">You reviewed all <span className="text-yellow-400 font-bold">{cardSet.length}</span> flash cards</p>
              <p className="text-white/25 text-sm mb-8">{curChapter.name} · {curSubject?.icon} {curSubject?.name}</p>
              <div className="flex gap-3">
                <button onClick={restart}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl transition-colors">
                  <RotateCcw className="w-4 h-4" /> Study Again
                </button>
                <button onClick={() => { setCurChapter(null); setCardSet([]); setDone(false); }}
                  className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white/55 hover:text-white hover:border-white/25 rounded-2xl transition-colors text-sm">
                  Back to Chapters
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Card ── */
            <motion.div key="cards" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/40 text-sm font-medium">Card {cardIndex + 1} of {cardSet.length}</span>
                <div className="flex-1 mx-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${((cardIndex + 1) / cardSet.length) * 100}%` }} />
                </div>
                <span className="text-yellow-400/60 text-xs font-semibold">{Math.round(((cardIndex+1)/cardSet.length)*100)}%</span>
              </div>

              <p className="text-center text-white/30 text-xs mb-4">
                {flipped ? '✅ Answer revealed' : '👆 Tap card to reveal answer'}
              </p>

              {/* Flip card */}
              <div className="fc-scene w-full mb-6" style={{ height: 320 }}>
                <div className={`fc-card w-full h-full ${flipped ? 'flipped' : ''}`}
                  onClick={() => setFlipped(f => !f)}>

                  {/* Front */}
                  <div className="fc-face"
                    style={{ background:'linear-gradient(135deg,rgba(14,22,74,0.95) 0%,rgba(6,11,36,0.98) 100%)', border:'1px solid rgba(234,179,8,0.25)' }}>
                    <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-400">
                      Question
                    </div>
                    <div className="absolute top-4 right-4 text-white/10 text-5xl font-black select-none">Q</div>
                    <p className="text-white font-semibold text-lg sm:text-xl text-center leading-relaxed max-w-sm">
                      {currentCard?.front}
                    </p>
                    <div className="absolute bottom-4 text-white/15 text-xs">Click to flip</div>
                  </div>

                  {/* Back */}
                  <div className="fc-face fc-back"
                    style={{ background:'linear-gradient(135deg,rgba(30,15,74,0.97) 0%,rgba(10,6,40,0.99) 100%)', border:'1px solid rgba(139,92,246,0.35)' }}>
                    <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400">
                      Answer
                    </div>
                    <div className="absolute top-4 right-4 text-white/10 text-5xl font-black select-none">A</div>
                    <p className="text-white/90 text-base sm:text-lg text-center leading-relaxed max-w-sm">
                      {currentCard?.back}
                    </p>
                    <div className="absolute bottom-4 text-white/15 text-xs">Click to flip back</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <button onClick={prevCard} disabled={cardIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button onClick={() => setFlipped(f => !f)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] text-white/55 hover:text-white transition-all text-sm font-medium">
                  <RotateCcw className="w-3.5 h-3.5" /> Flip
                </button>

                <button onClick={nextCard}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors">
                  {cardIndex < cardSet.length - 1 ? (<>Next <ChevronRight className="w-4 h-4" /></>) : (<>Finish <Check className="w-4 h-4" /></>)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── CHAPTERS LIST ── */}
      {curSubject && !curChapter && (
        <AnimatePresence mode="wait">
          <motion.div key="chapters" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="mb-5">
              <h2 className="text-white font-bold text-xl">{curSubject.icon} {curSubject.name}</h2>
              {curSubject.description && <p className="text-white/40 text-sm mt-1">{curSubject.description}</p>}
            </div>
            {loadingCh ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <BookOpen className="w-10 h-10 text-white/15 mx-auto mb-3" />
                <p className="text-white/30 font-medium">No chapters yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((ch, i) => (
                  <motion.button key={ch.id} onClick={() => selectChapter(ch)}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                    className="w-full rounded-2xl border border-white/[0.08] bg-[#080f2e]/60 p-4 flex items-center gap-4 text-left group hover:border-yellow-500/25 transition-all">
                    <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 font-semibold text-sm group-hover:text-white transition-colors">{ch.name}</p>
                      {ch.description && <p className="text-white/35 text-xs truncate mt-0.5">{ch.description}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── SUBJECTS LIST ── */}
      {curLevel && !curSubject && (
        <AnimatePresence mode="wait">
          <motion.div key="subjects" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="mb-5">
              <h2 className="text-white font-bold text-xl">{curLevel.icon} {curLevel.name}</h2>
              {curLevel.description && <p className="text-white/40 text-sm mt-1">{curLevel.description}</p>}
            </div>
            {loadingSub ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /></div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <BookOpen className="w-10 h-10 text-white/15 mx-auto mb-3" />
                <p className="text-white/30 font-medium">No subjects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subj, i) => (
                  <motion.button key={subj.id} onClick={() => selectSubject(subj)}
                    initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                    className="rounded-2xl border border-white/[0.08] bg-[#080f2e]/60 p-5 text-left group hover:border-yellow-500/25 hover:-translate-y-0.5 transition-all">
                    <div className="text-3xl mb-3">{subj.icon}</div>
                    <h3 className="text-white font-bold text-base group-hover:text-white">{subj.name}</h3>
                    {subj.description && <p className="text-white/35 text-xs mt-1 line-clamp-2">{subj.description}</p>}
                    <div className="flex items-center gap-1 mt-3 text-yellow-400/60 text-xs group-hover:text-yellow-400 transition-colors font-semibold">
                      Study cards <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── LEVELS HOME ── */}
      {!curLevel && (
        <AnimatePresence mode="wait">
          <motion.div key="levels" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-white font-black text-2xl">Flash Cards</h1>
                  <p className="text-white/35 text-sm">Quick study cards with instant flip</p>
                </div>
              </div>
            </div>
            {levels.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-white/[0.07]">
                <Zap className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-medium">No flash cards available yet</p>
                <p className="text-white/15 text-sm mt-1">Check back soon</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {levels.map((level, i) => (
                  <motion.button key={level.id} onClick={() => selectLevel(level)}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                    className={`rounded-2xl border border-white/[0.08] p-6 text-left group hover:-translate-y-1 transition-all bg-gradient-to-br ${LEVEL_COLORS[i % LEVEL_COLORS.length]} hover:border-white/20`}>
                    <div className="text-4xl mb-4">{level.icon}</div>
                    <h3 className="text-white font-black text-xl mb-1">{level.name}</h3>
                    {level.description && <p className="text-white/40 text-sm leading-relaxed">{level.description}</p>}
                    <div className="flex items-center gap-1.5 mt-4 font-semibold text-sm transition-colors"
                      style={{ color: LEVEL_ACCENT[i % LEVEL_ACCENT.length] }}>
                      <span>Start studying</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
