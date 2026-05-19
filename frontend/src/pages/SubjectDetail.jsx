import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeft, BookOpen, Lock, ChevronRight, CheckCircle,
  Brain, BarChart3, Target, TrendingUp
} from 'lucide-react';
import api from '../api';

function ChapterMCQBar({ total, attempted, correct }) {
  const pct = total > 0 ? Math.round((attempted / total) * 100) : 0;
  const correctPct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const remaining = Math.max(0, total - attempted);
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <span className="text-white/30">{total} MCQs total</span>
          <span className="text-emerald-400 font-medium">{attempted} attempted</span>
          <span className="text-amber-400">{remaining} remaining</span>
        </div>
        <span className="font-bold" style={{ color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e' }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 80 ? 'linear-gradient(90deg,#10b981,#059669)' :
              pct >= 50 ? 'linear-gradient(90deg,#f59e0b,#d97706)' :
                'linear-gradient(90deg,#8b5cf6,#7c3aed)',
          }} />
      </div>
      {attempted > 0 && (
        <div className="text-[10px] text-white/25">Accuracy: {correctPct}% correct</div>
      )}
    </div>
  );
}

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/subjects/${id}?user_id=${user?.id || ''}`),
      api.get(`/users/enrolled/${id}`).catch(() => ({ data: { enrolled: false } })),
    ]).then(([sRes, eRes]) => {
      setSubject(sRes.data);
      setEnrolled(eRes.data.enrolled);
    }).finally(() => setLoading(false));
  }, [id, user?.id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try { await api.post(`/users/enroll/${id}`); setEnrolled(true); }
    finally { setEnrolling(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
      </div>
    </div>
  );

  if (!subject) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white/35">Subject not found</p>
    </div>
  );

  const chapters = subject.chapters || [];
  const totalMCQs = chapters.reduce((s, c) => s + parseInt(c.total_mcqs || 0), 0);
  const totalAttempted = chapters.reduce((s, c) => s + parseInt(c.attempted_mcqs || 0), 0);
  const totalCorrect = chapters.reduce((s, c) => s + parseInt(c.correct_mcqs || 0), 0);
  const overallPct = totalMCQs > 0 ? Math.round((totalAttempted / totalMCQs) * 100) : 0;

  return (
    <div className="pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ background: `radial-gradient(circle at top right, ${subject.color || '#7c3aed'}, transparent 60%)` }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${subject.color || '#7c3aed'}, transparent)`, opacity: 0.7 }} />

          <div className="relative z-10 flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-start gap-5">
              <div className="text-5xl">{subject.icon}</div>
              <div>
                <h1 className="text-3xl font-black text-white mb-2">{subject.name}</h1>
                <p className="text-white/45 mb-4 max-w-xl">{subject.description}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-white/35">
                    <BookOpen className="w-4 h-4" /> {chapters.length} chapters
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/35">
                    <Brain className="w-4 h-4" /> {totalMCQs} MCQs
                  </span>
                  {subject.class_level && (
                    <span className="badge-gold">{isNaN(subject.class_level) ? subject.class_level : `Class ${subject.class_level}`}</span>
                  )}
                  {enrolled && <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Enrolled</span>}
                </div>
              </div>
            </div>
            {!enrolled && (
              <button onClick={handleEnroll} disabled={enrolling}
                className="btn-gold flex items-center gap-2 py-3 px-7 font-bold disabled:opacity-50 flex-shrink-0">
                {enrolling ? <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> : 'Enroll Now'}
              </button>
            )}
          </div>

          {/* Overall MCQ progress bar */}
          {enrolled && totalMCQs > 0 && (
            <div className="relative z-10 mt-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-white/70">Overall MCQ Progress</span>
                </div>
                <span className="text-sm font-black text-violet-300">{overallPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)' }} />
              </div>
              <div className="flex items-center gap-6 mt-2 text-xs text-white/35">
                <span>{totalAttempted} attempted</span>
                <span className="text-emerald-400">{totalCorrect} correct</span>
                <span className="text-amber-400">{totalMCQs - totalAttempted} remaining</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Chapter list */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Course Chapters</h2>
            <span className="text-white/30 text-sm">({chapters.length})</span>
          </div>

          <div className="flex flex-col gap-3">
            {chapters.map((ch, i) => {
              const totalMcq = parseInt(ch.total_mcqs || 0);
              const attempted = parseInt(ch.attempted_mcqs || 0);
              const correct = parseInt(ch.correct_mcqs || 0);
              const pct = totalMcq > 0 ? Math.round((attempted / totalMcq) * 100) : 0;

              return (
                <motion.div key={ch.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  {(enrolled || ch.is_preview) ? (
                    <div className="card-premium p-5 group hover:border-purple-500/30 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5"
                          style={{ background: `linear-gradient(135deg, ${subject.color || '#7c3aed'}, ${subject.color || '#7c3aed'}88)` }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">{ch.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {ch.is_preview && <span className="text-xs text-emerald-400 font-medium">Free Preview</span>}
                              {totalMcq > 0 && pct === 100 && (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                  <CheckCircle className="w-3 h-3" /> Done
                                </span>
                              )}
                            </div>
                          </div>

                          {/* MCQ stats */}
                          {totalMcq > 0 ? (
                            <ChapterMCQBar total={totalMcq} attempted={attempted} correct={correct} />
                          ) : (
                            <p className="text-xs text-white/25 mt-1">No MCQs yet</p>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            <Link to={`/chapter/${ch.id}`}
                              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                              style={{ background: `${subject.color || '#7c3aed'}15`, color: subject.color || '#8b5cf6', border: `1px solid ${subject.color || '#7c3aed'}25` }}>
                              View Chapter <ChevronRight className="w-3 h-3" />
                            </Link>
                            {totalMcq > 0 && (
                              <Link to={`/chapter/${ch.id}/practice`}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
                                <Brain className="w-3 h-3" /> Practice MCQs
                              </Link>
                            )}
                            {totalMcq >= 5 && (
                              <Link to={`/chapter/${ch.id}/exam`}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                                <Target className="w-3 h-3" /> Full Exam
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 card-premium p-5 opacity-50 cursor-not-allowed">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white/50 font-semibold text-sm truncate">{ch.title}</h3>
                        <p className="text-xs text-white/25 mt-0.5">Enroll to access this chapter</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {chapters.length === 0 && (
              <div className="text-center py-14 text-white/25 text-sm">No chapters available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
