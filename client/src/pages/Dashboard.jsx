import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Clock, Award, ChevronRight, Play, CheckCircle } from 'lucide-react';
import api from '../api';

const ProgressRing = ({ progress, size = 80, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#grad)" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SubjectCard = ({ subject, index }) => {
  const total = parseInt(subject.total_chapters) || 0;
  const completed = parseInt(subject.completed_chapters) || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-2xl p-6 card-hover group border border-white/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at top left, ${subject.color}15, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-3xl">{subject.icon}</span>
            <h3 className="text-lg font-bold text-white mt-2">{subject.name}</h3>
            <p className="text-white/40 text-sm">{total} chapters</p>
          </div>
          <div className="relative">
            <ProgressRing progress={progress} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
          </div>
        </div>
        <div className="progress-bar mb-3">
          <div className="progress-fill" style={{ width: `${progress}%`, background: subject.color || undefined }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">{completed}/{total} completed</span>
          <Link to={`/subject/${subject.id}`} className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl transition-all duration-200 hover:opacity-90"
            style={{ background: `${subject.color}20`, color: subject.color }}>
            Continue <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-courses');

  useEffect(() => {
    Promise.all([
      api.get('/users/my-progress'),
      api.get('/subjects'),
    ]).then(([progressRes, subjectsRes]) => {
      setProgress(progressRes.data);
      setAllSubjects(subjectsRes.data);
      const enrolledIds = new Set(progressRes.data.map(p => p.id));
      setSubjects(progressRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalCompleted = progress.reduce((sum, s) => sum + parseInt(s.completed_chapters || 0), 0);
  const totalChapters = progress.reduce((sum, s) => sum + parseInt(s.total_chapters || 0), 0);

  const handleEnroll = async (subjectId) => {
    try {
      await api.post(`/users/enroll/${subjectId}`);
      const res = await api.get('/users/my-progress');
      setProgress(res.data);
      setSubjects(res.data);
    } catch {}
  };

  const enrolledIds = new Set(progress.map(p => p.id));
  const unenrolled = allSubjects.filter(s => !enrolledIds.has(s.id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/50">Continue your learning journey where you left off.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Enrolled Courses', value: progress.length, icon: <BookOpen className="w-5 h-5" />, color: '#6366f1' },
            { label: 'Chapters Done', value: totalCompleted, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981' },
            { label: 'Total Chapters', value: totalChapters, icon: <Clock className="w-5 h-5" />, color: '#f59e0b' },
            { label: 'Completion', value: totalChapters > 0 ? `${Math.round((totalCompleted/totalChapters)*100)}%` : '0%', icon: <TrendingUp className="w-5 h-5" />, color: '#8b5cf6' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5 border border-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['my-courses', 'explore'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === tab ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'glass text-white/60 hover:text-white hover:bg-white/10'}`}>
              {tab === 'my-courses' ? 'My Courses' : 'Explore All'}
            </button>
          ))}
        </div>

        {activeTab === 'my-courses' ? (
          subjects.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
              <p className="text-white/40 mb-6">Explore available subjects and enroll in your first course.</p>
              <button onClick={() => setActiveTab('explore')} className="btn-primary">Explore Subjects</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((s, i) => <SubjectCard key={s.id} subject={s} index={i} />)}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSubjects.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 card-hover border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at top left, ${s.color}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <span className="text-3xl">{s.icon}</span>
                  <h3 className="text-lg font-bold text-white mt-3 mb-1">{s.name}</h3>
                  <p className="text-white/40 text-sm mb-4 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30">{s.chapter_count || 0} chapters</span>
                    {enrolledIds.has(s.id) ? (
                      <Link to={`/subject/${s.id}`} className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                        <Play className="w-3 h-3" /> Continue
                      </Link>
                    ) : (
                      <button onClick={() => handleEnroll(s.id)} className="btn-primary text-sm py-1.5 px-4">Enroll</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
