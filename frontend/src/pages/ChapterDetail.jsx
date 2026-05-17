import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle, Circle, BookOpen, Play,
  Brain, Timer, FileText, Trophy, ChevronRight, BarChart3, Zap
} from 'lucide-react';
import api from '../api';

const ModeCard = ({ icon, title, desc, badge, color, onClick, stats }) => (
  <motion.button
    whileHover={{ y: -4, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="text-left w-full card-premium p-6 relative overflow-hidden group transition-all duration-300"
    style={{ '--card-color': color }}
  >
    <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
      style={{ background: color }} />
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-white text-base">{title}</h3>
          {badge && <span className="badge-gold text-[10px]">{badge}</span>}
        </div>
        <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
        {stats && (
          <div className="flex items-center gap-4 mt-3">
            {stats.map((s, i) => (
              <span key={i} className="text-xs font-semibold" style={{ color: `${color}cc` }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
    </div>
  </motion.button>
);

export default function ChapterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mcqStats, setMcqStats] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    Promise.all([
      api.get(`/chapters/${id}`),
      api.get(`/mcqs/stats/chapter/${id}`).catch(() => ({ data: { question_count: 0, sessions: [] } })),
    ]).then(([chRes, statsRes]) => {
      setChapter(chRes.data);
      setMcqStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const toggleComplete = async () => {
    setSaving(true);
    try {
      const val = !completed;
      await api.put(`/chapters/${id}/progress`, { completed: val });
      setCompleted(val);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-white/35">Chapter not found</p>
    </div>
  );

  const sessionStats = mcqStats?.sessions || [];
  const practiceSession = sessionStats.find(s => s.mode === 'practice');
  const quizSession = sessionStats.find(s => s.mode === 'quiz');
  const examSession = sessionStats.find(s => s.mode === 'exam');
  const qCount = mcqStats?.question_count || 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(`/subject/${chapter.subject_id}`)}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {chapter.subject_name}
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold mb-4 border"
            style={{ background: `${chapter.subject_color || '#7c3aed'}12`, color: chapter.subject_color || '#a78bfa', borderColor: `${chapter.subject_color || '#7c3aed'}25` }}>
            <BookOpen className="w-3 h-3" /> {chapter.subject_name}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">{chapter.title}</h1>
          <div className="flex items-center gap-5 text-sm text-white/35 flex-wrap">
            {chapter.duration_minutes > 0 && (
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {chapter.duration_minutes} min</span>
            )}
            {qCount > 0 && (
              <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-purple-400" /> {qCount} MCQs available</span>
            )}
            {completed && <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle className="w-4 h-4" /> Completed</span>}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { key: 'content', label: 'Study Material', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { key: 'practice', label: 'MCQ Practice', icon: <Brain className="w-3.5 h-3.5" />, badge: qCount > 0 ? `${qCount} Qs` : null },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === t.key ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white shadow-glow-purple' : 'glass-card text-white/50 hover:text-white'}`}>
              {t.icon} {t.label}
              {t.badge && <span className="badge-gold">{t.badge}</span>}
            </button>
          ))}
        </div>

        {activeTab === 'content' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {chapter.video_url && (
              <div className="card-premium rounded-2xl overflow-hidden mb-8 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe src={chapter.video_url} className="absolute inset-0 w-full h-full" allowFullScreen title={chapter.title} />
              </div>
            )}
            {chapter.content ? (
              <div className="card-premium rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <div className="text-white/65 leading-[1.9] text-[15px] whitespace-pre-wrap">{chapter.content}</div>
              </div>
            ) : (
              <div className="card-premium rounded-2xl p-12 text-center mb-8">
                <BookOpen className="w-12 h-12 text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Study material coming soon</p>
              </div>
            )}
            <div className="flex items-center justify-center">
              <button onClick={toggleComplete} disabled={saving}
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${completed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25' : 'btn-primary glow-purple'} disabled:opacity-50`}>
                {saving ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : completed ? <><CheckCircle className="w-5 h-5" /> Completed — Mark Incomplete</>
                  : <><Circle className="w-5 h-5" /> Mark as Complete</>}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'practice' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {qCount === 0 ? (
              <div className="card-premium rounded-3xl p-16 text-center">
                <Brain className="w-14 h-14 text-white/15 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No MCQs yet</h3>
                <p className="text-white/35 text-sm">MCQs for this chapter haven't been added by the admin yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: 'Questions', val: qCount, icon: '📝' },
                    { label: 'Best Score', val: examSession ? `${Math.round(examSession.avg_score)}%` : '—', icon: '🏆' },
                    { label: 'Attempts', val: sessionStats.reduce((s, x) => s + parseInt(x.count), 0), icon: '🎯' },
                  ].map((s, i) => (
                    <div key={i} className="card-premium p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-lg font-black text-white">{s.val}</div>
                      <div className="text-xs text-white/35">{s.label}</div>
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold-400" /> Choose Your Mode
                </h2>

                <ModeCard
                  icon={<Brain className="w-5 h-5" />}
                  title="Practice Mode"
                  desc="Learn at your own pace. See explanations after each answer, bookmark questions, and retry wrong ones."
                  color="#7c3aed"
                  badge="Unlimited"
                  stats={practiceSession ? [`${parseInt(practiceSession.count)} sessions`, `Avg: ${Math.round(practiceSession.avg_score)}%`] : ['No sessions yet']}
                  onClick={() => navigate(`/chapter/${id}/practice`)}
                />
                <ModeCard
                  icon={<Timer className="w-5 h-5" />}
                  title="Quiz Mode"
                  desc="Timed chapter quiz. Answer all questions within the time limit and get an instant score report."
                  color="#f59e0b"
                  badge="Timed"
                  stats={quizSession ? [`${parseInt(quizSession.count)} attempts`, `Best: ${Math.round(quizSession.avg_score)}%`] : ['No attempts yet']}
                  onClick={() => navigate(`/chapter/${id}/quiz`)}
                />
                <ModeCard
                  icon={<FileText className="w-5 h-5" />}
                  title="Full Exam Mode"
                  desc="Simulate a real CA exam. Strict timer, auto-submit, and detailed performance analytics."
                  color="#10b981"
                  badge="Full Mock"
                  stats={examSession ? [`${parseInt(examSession.count)} exams`, `Best: ${Math.round(examSession.avg_score)}%`] : ['No exams taken']}
                  onClick={() => navigate(`/chapter/${id}/exam`)}
                />

                {/* History link */}
                <Link to={`/chapter/${id}/results`}
                  className="flex items-center gap-3 card-premium p-4 mt-2 hover:border-purple-500/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/12 border border-slate-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 font-medium text-sm">View Past Sessions</p>
                    <p className="text-white/30 text-xs">{sessionStats.reduce((s, x) => s + parseInt(x.count), 0)} total sessions</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
