import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  BookOpen, TrendingUp, CheckCircle, ChevronRight, Play, Trophy,
  BarChart3, Target, Flame, Layers, Plus, ArrowRight, FileText,
  Zap, HelpCircle, Brain, XCircle, Bookmark, Shuffle, Video,
  Sparkles, Star, Clock, Award, Activity, Calendar, ArrowUpRight
} from 'lucide-react';
import api from '../api';

/* ─── Animated progress ring ──────────────────────────────────────────────── */
const GlowRing = ({ pct = 0, size = 120, stroke = 8, color = '#8b5cf6', glow = true }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {glow && (
        <div className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, filter: 'blur(8px)' }} />
      )}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: glow ? `drop-shadow(0 0 6px ${color})` : 'none' }} />
      </svg>
    </div>
  );
};

/* ─── Tiny inline sparkline ────────────────────────────────────────────────── */
const Spark = ({ data = [], color = '#8b5cf6' }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
        fill={`url(#spark-${color.replace('#', '')})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

/* ─── Dummy weekly activity data ────────────────────────────────────────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekData = DAYS.map((d, i) => ({ d, v: Math.floor(Math.random() * 80) + 20 }));
const mockSparkEnrolled = [{ v: 2 }, { v: 3 }, { v: 3 }, { v: 4 }, { v: 4 }, { v: 5 }, { v: 5 }];
const mockSparkProgress = [{ v: 10 }, { v: 18 }, { v: 22 }, { v: 30 }, { v: 38 }, { v: 44 }, { v: 50 }];
const mockSparkChapters = [{ v: 5 }, { v: 10 }, { v: 14 }, { v: 20 }, { v: 25 }, { v: 30 }, { v: 35 }];
const mockSparkTests = [{ v: 0 }, { v: 1 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 3 }];

/* ─── Recent activity mock ────────────────────────────────────────────────── */
const RECENT = [
  { icon: Brain, label: 'Completed MCQ Practice', sub: 'Financial Accounting — Ch. 3', time: '2h ago', color: '#8b5cf6' },
  { icon: CheckCircle, label: 'Chapter Completed', sub: 'Business Law — Introduction', time: '5h ago', color: '#10b981' },
  { icon: Trophy, label: 'Ranked #12 on Leaderboard', sub: 'Weekly mock test ranking', time: '1d ago', color: '#f59e0b' },
  { icon: Bookmark, label: 'Saved 3 Questions', sub: 'Auditing — Ch. 2', time: '2d ago', color: '#06b6d4' },
];

/* ─── Upcoming tests mock ─────────────────────────────────────────────────── */
const UPCOMING = [
  { name: 'Financial Accounting', date: 'Today, 6:00 PM', level: 'Certificate', color: '#8b5cf6', urgent: true },
  { name: 'Business Law', date: 'Tomorrow, 10:00 AM', level: 'Professional', color: '#06b6d4', urgent: false },
  { name: 'Auditing Mock Test', date: 'Sat, 3:00 PM', level: 'Certificate', color: '#10b981', urgent: false },
];

/* ─── Stat card ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, color, spark, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card-premium p-5 flex flex-col gap-3 group hover:-translate-y-1 cursor-default"
    style={{ minWidth: 0 }}>
    <div className="flex items-start justify-between">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14`, border: `1px solid ${color}25`, color }}>
        <Icon className="w-4 h-4" />
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
    </div>
    <div>
      <div className="text-2xl font-black text-white leading-none">{value}</div>
      <div className="text-[11px] text-white/40 font-semibold uppercase tracking-wide mt-1">{label}</div>
      <div className="text-[10px] text-white/22 mt-0.5">{sub}</div>
    </div>
    <div className="mt-auto -mx-1">
      <Spark data={spark} color={color} />
    </div>
  </motion.div>
);

/* ─── Subject card (enrolled) ─────────────────────────────────────────────── */
const SubjectCard = ({ subject, index }) => {
  const total = parseInt(subject.total_chapters) || 0;
  const done = parseInt(subject.completed_chapters) || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const color = subject.color || '#8b5cf6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="card-premium p-5 group hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{subject.icon}</div>
          <div>
            <h3 className="font-bold text-white text-[13px] leading-tight">{subject.name}</h3>
            <span className="text-[11px] text-white/30">{total} chapters</span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <GlowRing pct={pct} size={48} stroke={4} color={color} glow={false} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">{pct}%</span>
          </div>
        </div>
      </div>
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/25">{done}/{total} done</span>
        <Link to={`/subject/${subject.id}`}
          className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          Continue <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
};

/* ─── Explore card ────────────────────────────────────────────────────────── */
const ExploreCard = ({ s, enrolled, onEnroll, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
    className="card-premium p-5 group hover:-translate-y-1">
    <div className="flex items-start justify-between mb-3">
      <div className="text-2xl">{s.icon}</div>
      <div className="flex items-center gap-2">
        <span className="badge-green">Free</span>
        {s.class_level && (
          <span className="badge-purple">{isNaN(s.class_level) ? s.class_level : `Class ${s.class_level}`}</span>
        )}
      </div>
    </div>
    <h3 className="font-bold text-white text-[13px] mb-1 leading-tight">{s.name}</h3>
    <p className="text-white/30 text-[11px] mb-4 line-clamp-2 leading-relaxed">{s.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/25 flex items-center gap-1">
        <BookOpen className="w-3 h-3" /> {s.chapter_count || 0} chapters
      </span>
      {enrolled ? (
        <Link to={`/subject/${s.id}`}
          className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-500/12 text-emerald-400 border border-emerald-500/22 hover:bg-emerald-500/20 transition-colors">
          <Play className="w-3 h-3" /> Continue
        </Link>
      ) : (
        <button onClick={onEnroll}
          className="flex items-center gap-1 btn-primary text-[11px] py-1.5 px-3">
          <Plus className="w-3 h-3" /> Enroll
        </button>
      )}
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  const { modules, loading: mLoading } = useModuleSettings();
  const isAdmin = user?.role === 'admin';

  const [progress, setProgress] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('enrolled');

  useEffect(() => {
    Promise.all([api.get('/users/my-progress'), api.get('/subjects')])
      .then(([pR, sR]) => { setProgress(pR.data); setAllSubjects(sR.data); })
      .finally(() => setLoading(false));
  }, []);

  const enrolledIds = new Set(progress.map(p => p.id));
  const totalDone = progress.reduce((s, x) => s + parseInt(x.completed_chapters || 0), 0);
  const totalChaps = progress.reduce((s, x) => s + parseInt(x.total_chapters || 0), 0);
  const overallPct = totalChaps > 0 ? Math.round((totalDone / totalChaps) * 100) : 0;

  const handleEnroll = async (id) => {
    try { await api.post(`/users/enroll/${id}`); const r = await api.get('/users/my-progress'); setProgress(r.data); } catch {}
  };

  const showModule = (key) => isAdmin || (!mLoading && modules[key]);

  /* ── Quick action tiles ─────────────────────────────────────────────────── */
  const quickActions = [
    { to: '/practice', icon: Brain, label: 'MCQ Practice', sub: 'Start session', color: '#8b5cf6' },
    { to: '/custom-exam', icon: Shuffle, label: 'Custom Exam', sub: 'Build your set', color: '#3b82f6' },
    { to: '/wrong-answers', icon: XCircle, label: 'Wrong Answers', sub: 'Fix mistakes', color: '#f43f5e' },
    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks', sub: 'Saved questions', color: '#f59e0b' },
    { to: '/exams', icon: Target, label: 'Mock Tests', sub: 'Full timed exam', color: '#10b981' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', sub: 'Your ranking', color: '#fbbf24' },
  ];

  const moduleCards = [
    { key: 'classes', to: '/classes', label: 'Study Materials', icon: Video, color: '#7c3aed' },
    { key: 'shortnotes', to: '/shortnotes', label: 'Notes', icon: FileText, color: '#10b981' },
    { key: 'flashcards', to: '/flashcards', label: 'Flashcards', icon: Zap, color: '#f59e0b' },
    { key: 'qbank', to: '/question-bank', label: 'Question Bank', icon: HelpCircle, color: '#6366f1' },
  ].filter(m => showModule(m.key));

  if (loading) return (
    <div className="px-5 sm:px-7 max-w-[1400px] mx-auto space-y-6">
      <div className="shimmer h-52 rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-36 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="px-5 sm:px-7 max-w-[1400px] mx-auto space-y-6">

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(14,8,50,0.95) 0%, rgba(8,4,32,0.98) 50%, rgba(4,8,28,0.99) 100%)',
          border: '1px solid rgba(139,92,246,0.18)',
          boxShadow: '0 0 80px rgba(124,58,237,0.1), inset 0 1px 0 rgba(139,92,246,0.15)',
        }}>

        {/* Background glows */}
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-10 right-20 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.3), transparent)' }} />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none hero-grid" />

        <div className="relative p-7 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">

            {/* Left: Welcome text */}
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-black text-amber-400 tracking-wide uppercase">Study streak active</span>
                </div>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] mb-3">
                Welcome back,<br />
                <span style={{ background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 40%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {user?.name?.split(' ')[0]} 👋
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-white/40 text-[15px] leading-relaxed max-w-md mb-7">
                Every chapter you complete brings you closer to cracking your ICAB CA exams. Keep the momentum going!
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center gap-3">
                <Link to="/practice" className="btn-primary inline-flex items-center gap-2 text-sm py-3 px-6">
                  <Brain className="w-4 h-4" /> Start Practice
                </Link>
                <Link to="/exams"
                  className="inline-flex items-center gap-2 text-sm py-3 px-6 rounded-2xl font-semibold transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                  <Target className="w-4 h-4" /> Mock Test
                </Link>
              </motion.div>
            </div>

            {/* Right: Stats cluster */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">

              {/* Big progress ring */}
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="flex items-center gap-5 p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="relative">
                  <GlowRing pct={overallPct} size={100} stroke={8} color="#8b5cf6" glow />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white leading-none">{overallPct}%</span>
                    <span className="text-[9px] text-white/35 font-bold mt-0.5">Done</span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-[15px] leading-none">{totalDone}</p>
                  <p className="text-white/35 text-[11px] font-medium mt-0.5">Chapters done</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span className="text-[10px] text-white/40">{progress.length} subjects enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-[10px] text-white/40">{totalChaps} total chapters</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Streak mini card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] text-amber-400/70 font-bold uppercase tracking-wide">Study Streak</p>
                  <p className="text-white font-black text-[18px] leading-none">7 <span className="text-[12px] text-white/40 font-semibold">days</span></p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ STAT CARDS ═════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrolled Subjects" value={progress.length} sub="subjects" icon={Layers} color="#8b5cf6" spark={mockSparkEnrolled} delay={0.05} />
        <StatCard label="Chapters Done" value={totalDone} sub="completed" icon={CheckCircle} color="#10b981" spark={mockSparkChapters} delay={0.1} />
        <StatCard label="Overall Progress" value={`${overallPct}%`} sub="completion" icon={TrendingUp} color="#06b6d4" spark={mockSparkProgress} delay={0.15} />
        <StatCard label="Mock Tests" value="0" sub="attempted" icon={Target} color="#f59e0b" spark={mockSparkTests} delay={0.2} />
      </div>

      {/* ═══ MAIN 2-COLUMN GRID ═════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT column (2/3) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-violet-400" />
              <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.16em]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((a, i) => (
                <motion.div key={a.to}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={a.to}
                    className="card-premium p-4 flex items-center gap-3 group hover:-translate-y-1 transition-all duration-200">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${a.color}12`, border: `1px solid ${a.color}22`, color: a.color }}>
                      <a.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-[12px] leading-tight truncate">{a.label}</p>
                      <p className="text-white/30 text-[10px] mt-0.5 truncate">{a.sub}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card-premium p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-white text-[14px]">Weekly Activity</h2>
                <p className="text-white/30 text-[11px] mt-0.5">Questions answered per day</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">+24% this week</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(5,9,30,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, fontSize: 11, color: 'white' }}
                  cursor={{ fill: 'rgba(139,92,246,0.06)' }}
                  formatter={(v) => [`${v} Qs`, 'Answered']} />
                <Bar dataKey="v" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Continue Learning / Explore */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.16em]">Subjects</h2>
              </div>
              <div className="flex gap-1.5">
                {['enrolled', 'explore'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200"
                    style={tab === t
                      ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                    {t === 'enrolled' ? `My Courses (${progress.length})` : `Explore (${allSubjects.length})`}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'enrolled' ? (
              progress.length === 0 ? (
                <div className="card-premium rounded-2xl py-16 text-center">
                  <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-base mb-2">No courses yet</h3>
                  <p className="text-white/30 text-sm mb-5">Switch to Explore to find and enroll in subjects.</p>
                  <button onClick={() => setTab('explore')} className="btn-primary inline-flex items-center gap-2">
                    Explore Subjects <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {progress.map((s, i) => <SubjectCard key={s.id} subject={s} index={i} />)}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allSubjects.map((s, i) => (
                  <ExploreCard key={s.id} s={s} index={i}
                    enrolled={enrolledIds.has(s.id)}
                    onEnroll={() => handleEnroll(s.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT column (1/3) */}
        <div className="space-y-5">

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="font-black text-white text-[13px]">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {RECENT.map((r, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${r.color}12`, border: `1px solid ${r.color}20`, color: r.color }}>
                    <r.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/80 leading-tight truncate">{r.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 truncate">{r.sub}</p>
                  </div>
                  <span className="text-[10px] text-white/20 flex-shrink-0 font-medium">{r.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Mock Tests */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="card-premium p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-black text-white text-[13px]">Upcoming Tests</h3>
              </div>
              <Link to="/exams" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors">View all</Link>
            </div>
            <div className="space-y-3">
              {UPCOMING.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white/80 truncate">{t.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{t.date}</p>
                  </div>
                  {t.urgent && (
                    <span className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide flex-shrink-0">Today</span>
                  )}
                </div>
              ))}
            </div>
            <Link to="/exams"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold transition-all"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', color: 'rgba(6,182,212,0.8)' }}>
              <Target className="w-3.5 h-3.5" /> View All Exams
            </Link>
          </motion.div>

          {/* Study streak calendar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-white text-[13px]">Study Streak</h3>
              <span className="ml-auto text-[10px] font-black text-amber-400">7 days 🔥</span>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] text-white/25 font-bold">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }, (_, i) => {
                const intensity = i < 7 ? 0 : i < 14 ? 1 : i < 21 ? 2 : 3;
                const active = Math.random() > 0.35;
                const colors = ['rgba(255,255,255,0.04)', 'rgba(139,92,246,0.25)', 'rgba(139,92,246,0.5)', 'rgba(139,92,246,0.85)'];
                return (
                  <div key={i}
                    className="aspect-square rounded-sm transition-all hover:scale-110 cursor-default"
                    style={{ background: active ? colors[intensity] : colors[0], boxShadow: active && intensity > 1 ? '0 0 4px rgba(139,92,246,0.4)' : 'none' }} />
                );
              })}
            </div>
            <p className="text-[10px] text-white/25 mt-3 text-center">Last 4 weeks of activity</p>
          </motion.div>

          {/* Module cards */}
          {moduleCards.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="card-premium p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="font-black text-white text-[13px]">Study Modules</h3>
              </div>
              <div className="space-y-2">
                {moduleCards.map(m => (
                  <Link key={m.key} to={m.to}
                    className="flex items-center gap-3 p-3 rounded-xl group transition-all hover:-translate-x-0.5"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${m.color}12`, border: `1px solid ${m.color}20`, color: m.color }}>
                      <m.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[12px] font-semibold text-white/70 group-hover:text-white transition-colors flex-1">{m.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Performance snapshot */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-white text-[13px]">Performance</h3>
              <Link to="/progress" className="ml-auto text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors">Details</Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Accuracy', val: 68, color: '#10b981' },
                { label: 'Completion', val: overallPct, color: '#8b5cf6' },
                { label: 'Speed', val: 74, color: '#06b6d4' },
              ].map(p => (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-white/40 font-semibold">{p.label}</span>
                    <span className="text-[11px] font-black text-white/70">{p.val}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.val}%`, background: `linear-gradient(90deg,${p.color}99,${p.color})` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
