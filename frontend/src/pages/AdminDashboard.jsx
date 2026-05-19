import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Bell, BarChart3, TrendingUp, CheckCircle,
  ChevronRight, Activity, Shield, Settings, FileText, Trophy,
  Home, LogOut, Menu, X, Megaphone, Brain, GraduationCap, Layers,
  Zap, HelpCircle, Clock, ArrowUpRight, Star, UserCheck, BookMarked,
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const SidebarLink = ({ to, icon, label, active, badge }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge && <span className="badge-gold">{badge}</span>}
  </Link>
);

const StatCard = ({ label, value, icon, color, change, index, to, sub }) => {
  const inner = (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className={`card-premium p-5 h-full group transition-all duration-200 ${to ? 'cursor-pointer hover:border-white/20 hover:-translate-y-1' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          {icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          {change && (
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/15">{change}</span>
          )}
          {to && <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/50 transition-colors" />}
        </div>
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs text-white/35 font-medium uppercase tracking-wide">{label}</div>
      {sub && <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>}
    </motion.div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
};

const ActivityItem = ({ icon: Icon, color, title, sub, time, index }) => (
  <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }}
    className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: `${color}15`, border: `1px solid ${color}20`, color }}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white/80 font-medium leading-tight">{title}</p>
      <p className="text-xs text-white/30 mt-0.5">{sub}</p>
    </div>
    <span className="text-[10px] text-white/20 flex-shrink-0 font-medium mt-0.5">{time}</span>
  </motion.div>
);

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/users/stats'), api.get('/users')])
      .then(([sRes, uRes]) => {
        setStats(sRes.data);
        setUsers(uRes.data.slice(0, 10));
      }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/subjects', label: 'Subjects & Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/mcqs', label: 'MCQ Manager', icon: <Brain className="w-4 h-4" /> },
    { to: '/admin/exams', label: 'Exam Manager', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes', label: 'Classes', icon: <Layers className="w-4 h-4" /> },
    { to: '/admin/flashcards', label: 'Flash Cards', icon: <Zap className="w-4 h-4" /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/admin/shortnotes', label: 'Short Notes', icon: <FileText className="w-4 h-4" /> },
    { to: '/admin/question-bank', label: 'Question Bank', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Student View', icon: <Home className="w-4 h-4" /> },
  ];

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: <Users className="w-5 h-5" />, color: '#7c3aed', change: 'Active', sub: 'registered users', to: '/admin/students' },
    { label: 'Subjects', value: stats?.total_subjects || 0, icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b', sub: 'learning subjects', to: '/admin/subjects' },
    { label: 'Chapters', value: stats?.total_chapters || 0, icon: <FileText className="w-5 h-5" />, color: '#06b6d4', sub: 'study chapters', to: '/admin/subjects' },
    { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981', change: 'Growing', sub: 'total enrollments', to: '/admin/enrollments' },
    { label: 'Completions', value: stats?.total_completions || 0, icon: <CheckCircle className="w-5 h-5" />, color: '#8b5cf6', sub: 'chapters completed', to: '/admin/completions' },
    { label: 'Platform Health', value: '100%', icon: <Activity className="w-5 h-5" />, color: '#f43f5e', change: 'Live', sub: 'all systems normal' },
  ];

  const recentActivity = [
    { icon: UserCheck, color: '#10b981', title: 'New student registered', sub: 'Platform growing steadily', time: 'Now' },
    { icon: BookMarked, color: '#7c3aed', title: 'Content updated', sub: 'Subjects & chapters synced', time: '5m' },
    { icon: Trophy, color: '#f59e0b', title: 'Leaderboard refreshed', sub: 'Rankings recalculated', time: '1h' },
    { icon: Bell, color: '#06b6d4', title: 'Notifications sent', sub: 'All students notified', time: '2h' },
    { icon: GraduationCap, color: '#f43f5e', title: 'Exam system ready', sub: 'Mock tests available', time: '3h' },
  ];

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar flex flex-col ${mobile ? 'w-full h-full' : 'w-64 min-h-screen'} p-5`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">CA Aspire BD</div>
          <div className="text-[9px] text-gold-500 font-semibold tracking-widest uppercase">Admin Panel</div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-2.5 glass-navy rounded-xl px-3 py-2.5 mb-6 border border-purple-500/12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
          <Shield className="w-4 h-4 text-navy-950" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Administrator</p>
          <p className="text-white/30 text-[10px]">Full access</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map(item => (
          <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="sidebar-item mt-4 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08]">
        <LogOut className="w-4 h-4 flex-shrink-0" />
        <span>Sign Out</span>
      </button>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const studentList = users.filter(u => u.role === 'student');

  return (
    <div className="px-6 lg:px-8 pb-8">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Overview</h1>
            <p className="text-white/35 text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {today}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-semibold">System Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/admin/notifications', label: 'Send Notification', sub: 'Alert students with announcements', icon: Megaphone, color: 'purple' },
          { to: '/admin/subjects', label: 'Manage Content', sub: 'Add subjects, chapters & materials', icon: BookOpen, color: 'gold' },
          { to: '/admin/exams', label: 'Exam Manager', sub: 'Create & publish exams', icon: GraduationCap, color: 'cyan' },
        ].map((item, i) => (
          <motion.div key={item.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.04 }}>
            <Link to={item.to}
              className={`card-premium p-5 flex items-center gap-4 group hover:border-${item.color}-500/35 transition-all duration-200 block hover:-translate-y-0.5`}>
              <div className={`w-11 h-11 rounded-2xl bg-${item.color}-500/12 border border-${item.color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <item.icon className={`w-5 h-5 text-${item.color}-400`} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm mb-0.5">{item.label}</p>
                <p className="text-white/30 text-xs">{item.sub}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-white/20 group-hover:text-${item.color}-400 group-hover:translate-x-1 transition-all`} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom two-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Students table — 2/3 width */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-premium rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-400" />
              <h2 className="font-semibold text-white text-sm">Recent Students</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-purple">{stats?.total_students || 0} total</span>
              <Link to="/admin/students" className="text-xs text-white/30 hover:text-white/60 transition-colors">View all →</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th className="hidden md:table-cell">Level</th>
                  <th className="hidden md:table-cell">Enrolled</th>
                  <th>Progress</th>
                  <th className="hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-700 to-violet-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white/85 font-medium text-sm">{u.name}</p>
                          <p className="text-white/30 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-white/40 text-sm">{u.class_level ? (isNaN(u.class_level) ? u.class_level : `Class ${u.class_level}`) : '—'}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-white/40 text-sm">{u.enrolled_count || 0} subjects</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (parseInt(u.completed_chapters) || 0) * 10)}%` }} />
                        </div>
                        <span className="text-white/50 text-xs">{u.completed_chapters || 0}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-white/35 text-xs">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </td>
                  </tr>
                ))}
                {studentList.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-white/25 text-sm">No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity Timeline — 1/3 width */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card-premium rounded-2xl">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-white text-sm">Activity Timeline</h2>
          </div>
          <div className="px-5 py-2">
            {recentActivity.map((item, i) => (
              <ActivityItem key={i} {...item} index={i} />
            ))}
          </div>

          {/* Platform summary */}
          <div className="px-5 pb-5 pt-2">
            <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-xs font-bold text-white/60 uppercase tracking-wide">Platform Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Avg Progress', value: `${stats?.total_completions && stats?.total_enrollments ? Math.round((stats.total_completions / Math.max(stats.total_enrollments, 1)) * 10) : 0}%` },
                  { label: 'Content Items', value: (stats?.total_chapters || 0) + (stats?.total_subjects || 0) },
                  { label: 'Engagement', value: stats?.total_enrollments ? 'High' : 'Low' },
                  { label: 'Status', value: 'Healthy' },
                ].map((m, i) => (
                  <div key={i} className="text-center py-1.5">
                    <div className="text-sm font-black text-white">{m.value}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
