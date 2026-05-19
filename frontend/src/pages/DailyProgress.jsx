import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  ArrowLeft, Calendar, Brain, CheckCircle, XCircle, TrendingUp,
  AlertTriangle, Target, Activity, Clock, ChevronRight, BookOpen, Flame
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const TABS = ['Daily', 'Weekly', 'Monthly'];

function SuggestionBanner({ correctRate, weakSubjects }) {
  const { isDark } = useTheme();
  if (correctRate === null) return null;
  const isLow = correctRate < 50;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 mb-6 flex items-start gap-4"
      style={isLow
        ? { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }
        : { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
      {isLow
        ? <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        : <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
      <div>
        <p className={`font-bold text-sm ${isLow ? 'text-amber-300' : 'text-emerald-300'}`}>
          {isLow ? 'Needs Improvement' : 'Great Performance!'}
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
          {isLow
            ? `Your correct rate is ${correctRate}%. You should study weak chapters manually again before practicing.`
            : `You scored ${correctRate}% correctly today. Keep up the great work!`}
        </p>
        {isLow && weakSubjects.length > 0 && (
          <p className="text-xs mt-2 text-amber-400/70">
            Weak areas: {weakSubjects.slice(0, 3).map(s => s.subject_name).join(', ')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function DailyProgress() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily');

  useEffect(() => {
    api.get('/progress/daily')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-violet-100 shadow-sm';
  const textPrimary = isDark ? 'text-white/90' : 'text-slate-800';
  const textMuted = isDark ? 'text-white/40' : 'text-slate-400';
  const chartColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 relative">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-l-transparent border-r-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  const today = data?.today || {};
  const correctRate = today.total_answered > 0
    ? Math.round((today.total_correct / today.total_answered) * 100)
    : null;

  const chartData = activeTab === 'Daily'
    ? (data?.daily || [])
    : activeTab === 'Weekly'
      ? (data?.weekly || [])
      : (data?.monthly || []);

  const weakSubjects = data?.weakSubjects || [];
  const subjectStats = data?.subjectStats || [];

  return (
    <div className="px-4 pb-16 max-w-5xl mx-auto">
      <Link to="/dashboard"
        className="flex items-center gap-2 mb-8 text-sm group transition-colors"
        style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.15)' }}>
            <Calendar className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-black ${textPrimary}`}>Daily Progress</h1>
            <p className={`text-sm ${textMuted}`}>Track your performance over time</p>
          </div>
        </div>
      </motion.div>

      {/* Suggestion Banner */}
      {correctRate !== null && (
        <SuggestionBanner correctRate={correctRate} weakSubjects={weakSubjects} />
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'MCQs Today', value: today.total_answered || 0, icon: Brain, color: '#8b5cf6' },
          { label: 'Correct', value: today.total_correct || 0, icon: CheckCircle, color: '#10b981' },
          { label: 'Wrong', value: today.total_wrong || 0, icon: XCircle, color: '#f43f5e' },
          { label: 'Accuracy', value: correctRate !== null ? `${correctRate}%` : '—', icon: Target, color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`${card} rounded-2xl p-4`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}25`, color: s.color }}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className={`text-[11px] font-medium mt-0.5 ${textMuted}`}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`${card} rounded-2xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className={`font-bold text-sm ${textPrimary}`}>MCQ Activity</h2>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                  activeTab === t
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : isDark
                      ? 'text-white/35 hover:text-white'
                      : 'text-slate-400 hover:text-slate-700'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <Brain className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-white/15' : 'text-slate-300'}`} />
            <p className={textMuted}>No practice data yet. Start practicing!</p>
            <Link to="/practice" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2 px-4">
              <Brain className="w-4 h-4" /> Start Practicing
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad-correct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-wrong" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColor} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: isDark ? '#0d1b3e' : '#fff', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#374151' }}
              />
              <Area type="monotone" dataKey="correct" name="Correct" stroke="#10b981" strokeWidth={2} fill="url(#grad-correct)" dot={false} />
              <Area type="monotone" dataKey="wrong" name="Wrong" stroke="#f43f5e" strokeWidth={2} fill="url(#grad-wrong)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Subject-wise weak areas */}
      {subjectStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className={`${card} rounded-2xl p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <h2 className={`font-bold text-sm ${textPrimary}`}>Subject Performance</h2>
          </div>
          <div className="space-y-4">
            {subjectStats.map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-semibold ${textPrimary}`}>{s.subject_name}</span>
                    <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.08)' }}>
                    <motion.div className="h-2 rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                      style={{ background: color }} />
                  </div>
                  <p className={`text-[10px] mt-1 ${textMuted}`}>{s.correct}/{s.total} correct</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!today.total_answered && subjectStats.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`${card} rounded-3xl text-center py-16`}>
          <Flame className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-white/15' : 'text-slate-300'}`} />
          <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>No activity yet</h3>
          <p className={`text-sm mb-6 ${textMuted}`}>Complete MCQ practice sessions to see your progress here.</p>
          <Link to="/practice" className="btn-primary inline-flex items-center gap-2">
            <Brain className="w-4 h-4" /> Start Practicing
          </Link>
        </motion.div>
      )}
    </div>
  );
}
