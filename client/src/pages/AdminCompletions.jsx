import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Bell, BarChart3, TrendingUp, CheckCircle,
  Home, LogOut, Menu, X, Brain, GraduationCap, Shield,
  Loader2, ChevronRight, Trophy, Target, Activity, Award, Layers,
  Zap,
} from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function AdminCompletions() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/subjects', label: 'Subjects & Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/mcqs', label: 'MCQ Manager', icon: <Brain className="w-4 h-4" /> },
    { to: '/admin/exams', label: 'Exam Manager', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes', label: 'Classes', icon: <Layers className="w-4 h-4" /> },
    { to: '/admin/flashcards', label: 'Flash Cards', icon: <Zap className="w-4 h-4" /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Student View', icon: <Home className="w-4 h-4" /> },
  ];

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/users/stats')])
      .then(([uRes, sRes]) => {
        setUsers(uRes.data.filter(u => u.role === 'student'));
        setStats(sRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const students = users;
  const totalCompletions = stats?.total_completions || 0;
  const totalChapters = stats?.total_chapters || 0;
  const studentsWithCompletion = students.filter(u => parseInt(u.completed_chapters || 0) > 0).length;
  const topPerformers = [...students]
    .sort((a, b) => parseInt(b.completed_chapters || 0) - parseInt(a.completed_chapters || 0))
    .slice(0, 10);
  const maxCompleted = Math.max(...students.map(u => parseInt(u.completed_chapters || 0)), 1);
  const completionRate = totalChapters > 0 && students.length > 0
    ? Math.round((totalCompletions / (totalChapters * Math.max(students.length, 1))) * 100)
    : 0;

  const brackets = [
    { label: '0', min: 0, max: 0 },
    { label: '1–5', min: 1, max: 5 },
    { label: '6–10', min: 6, max: 10 },
    { label: '11–20', min: 11, max: 20 },
    { label: '20+', min: 21, max: Infinity },
  ].map(b => ({
    ...b,
    count: students.filter(u => {
      const c = parseInt(u.completed_chapters || 0);
      return c >= b.min && c <= b.max;
    }).length,
  }));
  const maxBracket = Math.max(...brackets.map(b => b.count), 1);

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar flex flex-col ${mobile ? 'w-full h-full' : 'w-64 min-h-screen'} p-5`}>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">CA Mock</div>
          <div className="text-[9px] text-gold-500 font-semibold tracking-widest uppercase">Admin Panel</div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2.5 glass-navy rounded-xl px-3 py-2.5 mb-6 border border-purple-500/12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
          <Shield className="w-4 h-4 text-navy-950" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Administrator</p>
          <p className="text-white/30 text-[10px]">Full access</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map(item => (
          <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
        ))}
      </div>
      <button onClick={handleLogout} className="sidebar-item mt-4 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08]">
        <LogOut className="w-4 h-4 flex-shrink-0" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen pt-[68px]">
      <div className="hidden lg:block flex-shrink-0 fixed left-0 top-[68px] bottom-0 w-64 z-40">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="glass p-2.5 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">Completions</span>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-white/35 hover:text-white text-sm transition-colors">Overview</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-white text-sm font-semibold">Completions</span>
          </div>
          <h1 className="text-3xl font-black text-white">Completion & Progress</h1>
          <p className="text-white/35 text-sm mt-1">Track how students are progressing through chapters.</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Completions', value: totalCompletions, icon: <CheckCircle className="w-5 h-5" />, color: '#8b5cf6' },
                { label: 'Completion Rate', value: `${completionRate}%`, icon: <Target className="w-5 h-5" />, color: '#10b981' },
                { label: 'Active Learners', value: studentsWithCompletion, icon: <Activity className="w-5 h-5" />, color: '#f43f5e' },
                { label: 'Top Score', value: topPerformers[0] ? `${topPerformers[0].completed_chapters} ch` : '—', icon: <Trophy className="w-5 h-5" />, color: '#f59e0b' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="card-premium p-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
                  <div className="text-xs text-white/35 font-medium uppercase tracking-wide">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Progress distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="card-premium p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <h2 className="font-semibold text-white text-sm">Completion Brackets</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {brackets.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-white/35 w-10 text-right flex-shrink-0">{b.label}</span>
                      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${(b.count / maxBracket) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-lg"
                          style={{ background: 'linear-gradient(90deg, #8b5cf6aa, #8b5cf655)', minWidth: b.count > 0 ? '8px' : '0' }} />
                      </div>
                      <span className="text-xs font-bold text-white/50 w-6 flex-shrink-0">{b.count}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/20 mt-4 text-center">Chapters completed per student</p>
              </motion.div>

              {/* Overall platform progress */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="card-premium p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-semibold text-white text-sm">Platform Progress</h2>
                </div>

                {/* Big circular-style stat */}
                <div className="flex flex-col items-center justify-center py-4 mb-6">
                  <div className="relative w-28 h-28 mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#8b5cf6" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - completionRate / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">{completionRate}%</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-wide">Rate</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs text-center">
                    {totalCompletions} completions out of {totalChapters * Math.max(students.length, 1)} possible
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Chapters', value: totalChapters, color: '#06b6d4' },
                    { label: 'Total Students', value: students.length, color: '#7c3aed' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                      <div className="text-xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wide">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="card-premium rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-gold-400" />
                  <h2 className="font-semibold text-white text-sm">Top Performers</h2>
                </div>
                <span className="badge-gold">Leaderboard</span>
              </div>
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Chapters Completed</th>
                      <th className="hidden md:table-cell">Subjects</th>
                      <th className="hidden md:table-cell">Progress Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((u, i) => {
                      const completed = parseInt(u.completed_chapters || 0);
                      const pct = Math.min(100, (completed / maxCompleted) * 100);
                      return (
                        <tr key={u.id}>
                          <td>
                            <span className={`text-sm font-black ${
                              i === 0 ? 'text-gold-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-white/25'
                            }`}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-700 to-purple-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white/85 font-medium text-sm">{u.name}</p>
                                <p className="text-white/30 text-xs">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-lg font-black" style={{ color: i < 3 ? ['#f59e0b','#9ca3af','#d97706'][i] : 'rgba(255,255,255,0.6)' }}>
                              {completed}
                            </span>
                          </td>
                          <td className="hidden md:table-cell">
                            <span className="text-white/45 text-sm">{u.enrolled_count || 0} subjects</span>
                          </td>
                          <td className="hidden md:table-cell">
                            <div className="w-28 progress-bar">
                              <div className="progress-fill" style={{ width: `${pct}%`, background: i === 0 ? '#f59e0b' : '#8b5cf6' }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {topPerformers.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-white/25 text-sm">No completion data yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
