import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, CheckCircle, TrendingUp, Target,
  Layers, BarChart3, ChevronRight, Trophy, Clock,
  Play, Flame, Star
} from 'lucide-react';
import api from '../api';
import { PageLoader } from '../components/Skeleton';

const ProgressRing = ({ progress, size = 56, stroke = 5, color = '#7c3aed' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
};

export default function StudentProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/my-progress')
      .then(r => setProgress(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDone = progress.reduce((s, x) => s + parseInt(x.completed_chapters || 0), 0);
  const totalChaps = progress.reduce((s, x) => s + parseInt(x.total_chapters || 0), 0);
  const overallPct = totalChaps > 0 ? Math.round((totalDone / totalChaps) * 100) : 0;
  const fullyDone = progress.filter(p => {
    const total = parseInt(p.total_chapters || 0);
    const done = parseInt(p.completed_chapters || 0);
    return total > 0 && done >= total;
  }).length;
  const inProgress = progress.filter(p => {
    const done = parseInt(p.completed_chapters || 0);
    return done > 0 && done < parseInt(p.total_chapters || 0);
  }).length;

  const sorted = [...progress].sort((a, b) => {
    const pctA = parseInt(a.total_chapters) > 0 ? parseInt(a.completed_chapters || 0) / parseInt(a.total_chapters) : 0;
    const pctB = parseInt(b.total_chapters) > 0 ? parseInt(b.completed_chapters || 0) / parseInt(b.total_chapters) : 0;
    return pctB - pctA;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-gold-400" />
            <span className="text-sm text-white/45 font-medium">Performance Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Your Progress, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/35 mt-2 text-sm">Detailed view of your learning journey across all subjects.</p>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Enrolled', value: progress.length, sub: 'subjects', icon: <Layers className="w-5 h-5" />, color: '#7c3aed' },
            { label: 'Completed', value: totalDone, sub: 'chapters', icon: <CheckCircle className="w-5 h-5" />, color: '#10b981' },
            { label: 'Total', value: totalChaps, sub: 'chapters', icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b' },
            { label: 'Overall', value: `${overallPct}%`, sub: 'progress', icon: <TrendingUp className="w-5 h-5" />, color: '#06b6d4' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card-premium p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-white/35 font-medium uppercase tracking-wide">{s.label}</div>
              <div className="text-[10px] text-white/20 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Overall progress ring */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card-premium p-6 flex flex-col items-center justify-center text-center">
            <div className="relative mb-3">
              <ProgressRing progress={overallPct} size={100} stroke={8} color="#7c3aed" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{overallPct}%</span>
              </div>
            </div>
            <p className="text-white font-bold text-sm">Overall Completion</p>
            <p className="text-white/30 text-xs mt-1">{totalDone} of {totalChaps} chapters</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="card-premium p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">Course Status</span>
            </div>
            {[
              { label: 'Completed', count: fullyDone, color: '#10b981', total: progress.length },
              { label: 'In Progress', count: inProgress, color: '#f59e0b', total: progress.length },
              { label: 'Not Started', count: progress.length - fullyDone - inProgress, color: '#f43f5e', total: progress.length },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/50">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.count}</span>
                </div>
                <div className="progress-bar h-1.5">
                  <motion.div className="progress-fill h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: s.total > 0 ? `${(s.count / s.total) * 100}%` : '0%' }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.7 }}
                    style={{ background: s.color }} />
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card-premium p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 mb-1">
              <Star className="w-4 h-4 text-gold-400" />
              <span className="text-white font-semibold text-sm">Achievements</span>
            </div>
            {[
              { label: 'Enrolled in subjects', value: progress.length > 0, icon: '📚', desc: `${progress.length} subject${progress.length !== 1 ? 's' : ''}` },
              { label: 'First chapter done', value: totalDone > 0, icon: '⭐', desc: totalDone > 0 ? `${totalDone} chapters` : 'Not yet' },
              { label: 'Subject mastered', value: fullyDone > 0, icon: '🏆', desc: fullyDone > 0 ? `${fullyDone} complete` : 'Keep going!' },
            ].map((a, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${a.value ? 'bg-white/[0.05]' : 'opacity-40'}`}>
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className={`text-xs font-semibold ${a.value ? 'text-white/80' : 'text-white/30'}`}>{a.label}</p>
                  <p className="text-[10px] text-white/30">{a.desc}</p>
                </div>
                {a.value && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Subject breakdown */}
        {progress.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card-premium rounded-3xl text-center py-20">
            <BookOpen className="w-14 h-14 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No subjects enrolled yet</h3>
            <p className="text-white/35 text-sm mb-6">Enroll in subjects to track your progress here.</p>
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
              Browse Subjects <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="card-premium rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-purple-400" />
                <h2 className="font-semibold text-white text-sm">Subject Breakdown</h2>
              </div>
              <span className="badge-purple">{progress.length} enrolled</span>
            </div>
            <div className="flex flex-col divide-y divide-white/[0.04]">
              {sorted.map((s, i) => {
                const total = parseInt(s.total_chapters || 0);
                const done = parseInt(s.completed_chapters || 0);
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const color = s.color || '#7c3aed';
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <span className="text-2xl flex-shrink-0 w-8">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/85 font-semibold text-sm truncate pr-3">{s.name}</p>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="progress-bar h-1.5">
                        <motion.div className="progress-fill h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.7 }}
                          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                      </div>
                      <p className="text-white/25 text-xs mt-1">{done} of {total} chapters</p>
                    </div>
                    <Link to={`/subject/${s.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
                      style={{ background: `${color}18`, color }}>
                      <Play className="w-3 h-3" /> Continue
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
