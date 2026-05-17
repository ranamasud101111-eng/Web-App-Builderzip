import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import { motion } from 'framer-motion';
import {
  BookOpen, TrendingUp, Clock, CheckCircle, ChevronRight,
  Play, Trophy, BarChart3, Target, Flame, Layers, Plus, ArrowRight, FileText,
  Zap, HelpCircle, Brain, XCircle, Bookmark, Shuffle
} from 'lucide-react';
import api from '../api';

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
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  const statCards = [
    { label: 'Enrolled', value: progress.length, icon: <Layers className="w-5 h-5" />, color: '#7c3aed', sub: 'subjects', to: '/dashboard' },
    { label: 'Completed', value: totalDone, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981', sub: 'chapters', to: '/progress' },
    { label: 'Total Chapters', value: totalChaps, icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b', sub: 'chapters', to: '/progress' },
    { label: 'Progress', value: `${overallPct}%`, icon: <TrendingUp className="w-5 h-5" />, color: '#06b6d4', sub: 'overall', to: '/progress' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-gold-400" />
            <span className="text-sm text-white/45 font-medium">Study dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/35 mt-2 text-base">Keep pushing — every chapter gets you closer to your CA.</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((s, i) => (
            <Link key={i} to={s.to || '#'} className="block group">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card-premium p-5 h-full cursor-pointer hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                  {s.icon}
                </div>
                <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-white/35 font-medium uppercase tracking-wide">{s.label}</div>
                    <div className="text-[10px] text-white/20 mt-0.5">{s.sub}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/45 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* MCQ Learning Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wide">MCQ Practice</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: '/practice', icon: <Brain className="w-5 h-5" />, label: 'Practice', sub: 'Level → Subject → Chapter', color: '#8b5cf6', bg: 'bg-purple-500/12', border: 'border-purple-500/20', hover: 'hover:border-purple-500/35' },
              { to: '/custom-exam', icon: <Shuffle className="w-5 h-5" />, label: 'Custom Exam', sub: 'Build your own exam', color: '#3b82f6', bg: 'bg-blue-500/12', border: 'border-blue-500/20', hover: 'hover:border-blue-500/35' },
              { to: '/wrong-answers', icon: <XCircle className="w-5 h-5" />, label: 'Wrong Answers', sub: 'Review mistakes', color: '#f43f5e', bg: 'bg-red-500/12', border: 'border-red-500/20', hover: 'hover:border-red-500/35' },
              { to: '/bookmarks', icon: <Bookmark className="w-5 h-5" />, label: 'Bookmarks', sub: 'Saved questions', color: '#f59e0b', bg: 'bg-amber-500/12', border: 'border-amber-500/20', hover: 'hover:border-amber-500/35' },
            ].map((item, i) => (
              <Link key={item.to} to={item.to}
                className={`card-premium p-4 flex flex-col gap-3 ${item.hover} transition-all hover:-translate-y-0.5 group`}>
                <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  style={{ color: item.color }}>
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

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link to="/leaderboard" className="card-premium p-5 flex items-center gap-4 hover:border-gold-500/30 transition-colors group">
            <div className="w-11 h-11 rounded-2xl bg-gold-500/12 border border-gold-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Leaderboard</p>
              <p className="text-white/35 text-xs">See your national ranking</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors" />
          </Link>
          <Link to="/exams" className="card-premium p-5 flex items-center gap-4 hover:border-purple-500/30 transition-colors group">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/12 border border-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Mock Tests</p>
              <p className="text-white/35 text-xs">Practice timed exams</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors" />
          </Link>
          <Link to="/progress" className="card-premium p-5 flex items-center gap-4 hover:border-cyan-500/30 transition-colors group">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/12 border border-cyan-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Analytics</p>
              <p className="text-white/35 text-xs">Detailed performance report</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors" />
          </Link>
        </div>

        {/* Dynamic module cards — hidden modules are excluded for students */}
        {!modulesLoading && (() => {
          const moduleCards = [
            {
              key: 'classes',
              to: '/classes',
              title: 'Video Classes',
              desc: 'Watch lecture videos — Certificate, Professional & Advanced',
              icon: <Layers className="w-5 h-5 text-purple-400" />,
              from: 'from-purple-600/20', to2: 'to-violet-800/10',
              border: 'border-purple-500/20', hover: 'hover:border-purple-500/30',
              visible: isAdmin || modules.classes,
            },
            {
              key: 'shortnotes',
              to: '/shortnotes',
              title: 'Short Notes',
              desc: 'View & download PDF notes — Certificate, Professional & Advanced',
              icon: <FileText className="w-5 h-5 text-emerald-400" />,
              from: 'from-emerald-600/20', to2: 'to-teal-800/10',
              border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/30',
              visible: isAdmin || modules.shortnotes,
            },
            {
              key: 'flashcards',
              to: '/flashcards',
              title: 'Flash Cards',
              desc: 'Study with intelligent flash cards for every subject and level',
              icon: <Zap className="w-5 h-5 text-yellow-400" />,
              from: 'from-yellow-600/20', to2: 'to-amber-800/10',
              border: 'border-yellow-500/20', hover: 'hover:border-yellow-500/30',
              visible: isAdmin || modules.flashcards,
            },
            {
              key: 'qbank',
              to: '/question-bank',
              title: 'Question Bank',
              desc: 'Practice with curated MCQs organised by level and subject',
              icon: <HelpCircle className="w-5 h-5 text-indigo-400" />,
              from: 'from-indigo-600/20', to2: 'to-blue-800/10',
              border: 'border-indigo-500/20', hover: 'hover:border-indigo-500/30',
              visible: isAdmin || modules.qbank,
            },
          ].filter(m => m.visible);

          if (moduleCards.length === 0) return null;
          return (
            <div className={`grid grid-cols-1 ${moduleCards.length > 1 ? 'md:grid-cols-2' : ''} gap-4 mb-10`}>
              {moduleCards.map(m => (
                <Link key={m.key} to={m.to}
                  className={`card-premium p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 group ${m.hover}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.from} ${m.to2} border ${m.border} flex items-center justify-center flex-shrink-0`}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-base">{m.title}</p>
                    <p className="text-white/35 text-sm">{m.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {['my-courses', 'explore'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${tab === t ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white shadow-glow-purple' : 'glass-card text-white/50 hover:text-white'}`}>
              {t === 'my-courses' ? `My Courses (${progress.length})` : `Explore (${allSubjects.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'my-courses' ? (
          progress.length === 0 ? (
            <div className="text-center py-24 card-premium rounded-3xl">
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
    </div>
  );
}
