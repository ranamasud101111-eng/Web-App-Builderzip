import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import { motion } from 'framer-motion';
import {
  BookOpen, TrendingUp, CheckCircle, ChevronRight,
  Play, Trophy, BarChart3, Target, Flame, Layers, Plus, ArrowRight, FileText,
  Zap, HelpCircle, Brain, XCircle, Bookmark, Shuffle, Video, Star, Sparkles
} from 'lucide-react';
import api from '../api';
import { SkeletonStatCard, SkeletonCard } from '../components/Skeleton';

const ProgressRing = ({ progress, size = 72, stroke = 5, color = '#7c3aed' }) => {
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

const SubjectCard = ({ subject, index }) => {
  const total = parseInt(subject.total_chapters) || 0;
  const done = parseInt(subject.completed_chapters) || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const color = subject.color || '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className="card-premium p-6 group relative"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{subject.icon}</div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight mb-1">{subject.name}</h3>
            <span className="text-xs text-white/35">{total} chapters</span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <ProgressRing progress={pct} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{pct}%</span>
          </div>
        </div>
      </div>
      <div className="progress-bar mb-3">
        <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">{done} / {total} done</span>
        <Link to={`/subject/${subject.id}`}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200"
          style={{ background: `${color}18`, color }}>
          Continue <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { modules, loading: modulesLoading } = useModuleSettings();
  const isAdmin = user?.role === 'admin';
  const [progress, setProgress] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my-courses');

  useEffect(() => {
    Promise.all([api.get('/users/my-progress'), api.get('/subjects')])
      .then(([pRes, sRes]) => {
        setProgress(pRes.data);
        setAllSubjects(sRes.data);
      }).finally(() => setLoading(false));
  }, []);

  const enrolled = new Set(progress.map(p => p.id));
  const unenrolled = allSubjects.filter(s => !enrolled.has(s.id));
  const totalDone = progress.reduce((s, x) => s + parseInt(x.completed_chapters || 0), 0);
  const totalChaps = progress.reduce((s, x) => s + parseInt(x.total_chapters || 0), 0);
  const overallPct = totalChaps > 0 ? Math.round((totalDone / totalChaps) * 100) : 0;

  const handleEnroll = async (id) => {
    try {
      await api.post(`/users/enroll/${id}`);
      const r = await api.get('/users/my-progress');
      setProgress(r.data);
    } catch {}
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="shimmer h-4 w-40 rounded mb-3" />
        <div className="shimmer h-10 w-72 rounded-xl mb-2" />
        <div className="shimmer h-3 w-56 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  const statCards = [
    { label: 'Enrolled Subjects', value: progress.length, icon: <Layers className="w-5 h-5" />, color: '#7c3aed', sub: 'subjects enrolled', to: '/dashboard' },
    { label: 'Completed', value: totalDone, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981', sub: 'chapters done', to: '/progress' },
    { label: 'Total Chapters', value: totalChaps, icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b', sub: 'available', to: '/progress' },
    { label: 'Overall Progress', value: `${overallPct}%`, icon: <TrendingUp className="w-5 h-5" />, color: '#06b6d4', sub: 'completion rate', to: '/progress' },
  ];

  return (
    <div className="max-w-6xl mx-auto">

      {/* Welcome Hero Section */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="card-premium p-6 sm:p-8 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-48 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-500/22">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">Keep your streak going!</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-white/40 mt-2 text-sm sm:text-base">
                Every chapter brings you closer to your ICAB CA dream. Keep pushing!
              </p>
              <div className="flex items-center gap-3 mt-5">
                <Link to="/practice" className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Start Practice
                </Link>
                <Link to="/exams" className="btn-outline text-sm py-2.5 px-5 inline-flex items-center gap-2">
                  <Target className="w-4 h-4" /> Mock Test
                </Link>
              </div>
            </div>

            {/* Overall Progress Ring */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div className="relative">
                <ProgressRing progress={overallPct} size={96} stroke={7} color="#7c3aed" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-white">{overallPct}%</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-white/45 text-center">Overall Progress</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <Link key={i} to={s.to || '#'} className="block group">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card-premium p-5 h-full cursor-pointer hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
              <div>
                <div className="text-[11px] text-white/35 font-medium uppercase tracking-wide">{s.label}</div>
                <div className="text-[10px] text-white/20 mt-0.5">{s.sub}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* MCQ Quick Access */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">MCQ Practice Hub</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/practice', icon: <Brain className="w-5 h-5" />, label: 'Practice', sub: 'Level → Subject → Chapter', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
            { to: '/custom-exam', icon: <Shuffle className="w-5 h-5" />, label: 'Custom Exam', sub: 'Build your own', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
            { to: '/wrong-answers', icon: <XCircle className="w-5 h-5" />, label: 'Wrong Answers', sub: 'Review mistakes', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
            { to: '/bookmarks', icon: <Bookmark className="w-5 h-5" />, label: 'Bookmarks', sub: 'Saved questions', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="card-premium p-4 flex flex-col gap-3 hover:-translate-y-0.5 group transition-all duration-200">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: item.bg, border: `1px solid ${item.border}`, color: item.color }}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">{item.label}</p>
                <p className="text-white/30 text-[11px] mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick navigation row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/leaderboard" className="card-premium p-4 flex items-center gap-3 hover:border-amber-500/30 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Leaderboard</p>
            <p className="text-white/35 text-xs truncate">See your Bangladesh ranking</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
        </Link>
        <Link to="/exams" className="card-premium p-4 flex items-center gap-3 hover:border-purple-500/30 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Mock Tests</p>
            <p className="text-white/35 text-xs truncate">Practice timed exams</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
        </Link>
        <Link to="/progress" className="card-premium p-4 flex items-center gap-3 hover:border-cyan-500/30 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Analytics</p>
            <p className="text-white/35 text-xs truncate">Detailed performance report</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
        </Link>
      </div>

      {/* Module cards */}
      {!modulesLoading && (() => {
        const moduleCards = [
          { key: 'classes', to: '/classes', title: 'Video Classes', desc: 'Watch lecture videos for every level', icon: <Video className="w-5 h-5 text-purple-400" />, color: '#7c3aed', visible: isAdmin || modules.classes },
          { key: 'shortnotes', to: '/shortnotes', title: 'Short Notes', desc: 'Download PDF notes by subject', icon: <FileText className="w-5 h-5 text-emerald-400" />, color: '#10b981', visible: isAdmin || modules.shortnotes },
          { key: 'flashcards', to: '/flashcards', title: 'Flash Cards', desc: 'Smart cards for every subject', icon: <Zap className="w-5 h-5 text-amber-400" />, color: '#f59e0b', visible: isAdmin || modules.flashcards },
          { key: 'qbank', to: '/question-bank', title: 'Question Bank', desc: 'Curated MCQs by level & subject', icon: <HelpCircle className="w-5 h-5 text-indigo-400" />, color: '#6366f1', visible: isAdmin || modules.qbank },
        ].filter(m => m.visible);

        if (moduleCards.length === 0) return null;
        return (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Study Modules</h2>
            </div>
            <div className={`grid grid-cols-1 ${moduleCards.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
              {moduleCards.map(m => (
                <Link key={m.key} to={m.to}
                  className="card-premium p-5 flex items-center gap-4 hover:-translate-y-0.5 group transition-all duration-200">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${m.color}12`, border: `1px solid ${m.color}22` }}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-base">{m.title}</p>
                    <p className="text-white/35 text-sm">{m.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/55 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Subject tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['my-courses', 'explore'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${tab === t ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white shadow-glow-purple' : 'glass-card text-white/50 hover:text-white'}`}>
            {t === 'my-courses' ? `My Courses (${progress.length})` : `Explore (${allSubjects.length})`}
          </button>
        ))}
      </div>

      {/* Subject content */}
      {tab === 'my-courses' ? (
        progress.length === 0 ? (
          <div className="text-center py-20 card-premium rounded-3xl">
            <BookOpen className="w-14 h-14 text-white/15 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses enrolled yet</h3>
            <p className="text-white/35 mb-6 text-sm">Explore subjects and enroll to start learning.</p>
            <button onClick={() => setTab('explore')} className="btn-primary inline-flex items-center gap-2">
              Explore Subjects <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {progress.map((s, i) => <SubjectCard key={s.id} subject={s} index={i} />)}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allSubjects.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card-premium p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{s.icon}</div>
                {s.class_level && (
                  <span className="badge-gold">{isNaN(s.class_level) ? s.class_level : `Class ${s.class_level}`}</span>
                )}
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">{s.name}</h3>
              <p className="text-white/35 text-sm mb-5 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">{s.chapter_count || 0} chapters</span>
                {enrolled.has(s.id) ? (
                  <Link to={`/subject/${s.id}`} className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-1.5 rounded-xl transition-colors hover:bg-emerald-500/25">
                    <Play className="w-3 h-3" /> Continue
                  </Link>
                ) : (
                  <button onClick={() => handleEnroll(s.id)} className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5">
                    <Plus className="w-3 h-3" /> Enroll
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
