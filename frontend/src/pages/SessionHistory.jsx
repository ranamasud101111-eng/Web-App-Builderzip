import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Timer, FileText, CheckCircle, XCircle, Clock, BarChart3, Trophy } from 'lucide-react';
import api from '../api';

const modeConfig = {
  practice: { label: 'Practice', icon: <Brain className="w-4 h-4" />, color: '#7c3aed', badge: 'bg-purple-500/12 text-purple-400 border-purple-500/20' },
  quiz: { label: 'Quiz', icon: <Timer className="w-4 h-4" />, color: '#f59e0b', badge: 'bg-gold-500/12 text-gold-400 border-gold-500/20' },
  exam: { label: 'Exam', icon: <FileText className="w-4 h-4" />, color: '#10b981', badge: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
};

const formatDuration = (s) => {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export default function SessionHistory() {
  const { id: chapterId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/mcqs/sessions/history?chapter_id=${chapterId}`),
      api.get(`/chapters/${chapterId}`),
    ]).then(([sRes, cRes]) => {
      setSessions(sRes.data);
      setChapter(cRes.data);
    }).finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  const bestExam = sessions.filter(s => s.mode === 'exam' && s.score_percent).sort((a, b) => b.score_percent - a.score_percent)[0];
  const totalSessions = sessions.length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(`/chapter/${chapterId}`)}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Chapter
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Session History</h1>
          <p className="text-white/35 text-sm">{chapter?.title}</p>
        </div>

        {/* Summary */}
        {totalSessions > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card-premium p-5 text-center">
              <div className="text-2xl font-black gradient-text mb-1">{totalSessions}</div>
              <div className="text-xs text-white/35">Total Sessions</div>
            </div>
            <div className="card-premium p-5 text-center">
              <div className="text-2xl font-black text-gold-400 mb-1">{bestExam ? `${Math.round(bestExam.score_percent)}%` : '—'}</div>
              <div className="text-xs text-white/35">Best Exam Score</div>
            </div>
            <div className="card-premium p-5 text-center">
              <div className="text-2xl font-black text-purple-400 mb-1">
                {sessions.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs text-white/35">Completed</div>
            </div>
          </div>
        )}

        {/* Session list */}
        {sessions.length === 0 ? (
          <div className="text-center py-20 card-premium rounded-3xl">
            <BarChart3 className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No sessions yet</h3>
            <p className="text-white/35 text-sm mb-6">Start practicing to see your history here.</p>
            <Link to={`/chapter/${chapterId}`} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s, i) => {
              const cfg = modeConfig[s.mode] || modeConfig.practice;
              const pct = s.score_percent ? Math.round(s.score_percent) : null;
              const pctColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#f97316' : '#f43f5e';
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="card-premium p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${cfg.badge}`}>{cfg.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${s.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : s.status === 'timed_out' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.06] text-white/30'}`}>
                          {s.status === 'timed_out' ? 'Timed out' : s.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/30 flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(s.time_taken_seconds)}</span>
                        {s.answered > 0 && (
                          <>
                            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" />{s.correct}</span>
                            <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" />{s.wrong}</span>
                            <span>{s.answered}/{s.total_questions} answered</span>
                          </>
                        )}
                        <span>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {pct !== null && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black" style={{ color: pctColor }}>{pct}%</div>
                        <div className="text-[10px] text-white/25">Score</div>
                      </div>
                    )}
                  </div>
                  {s.answered > 0 && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${s.total_questions > 0 ? (s.correct / s.total_questions) * 100 : 0}%`, background: `linear-gradient(90deg, ${pctColor}, ${pctColor}aa)` }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
