import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Bell, BarChart3, TrendingUp, CheckCircle,
  ChevronRight, Activity, Shield, Settings, FileText, Trophy,
  Home, LogOut, Menu, X, Megaphone, Brain, GraduationCap
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

const StatCard = ({ label, value, icon, color, change, index }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
    className="card-premium p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
        {icon}
      </div>
      {change && (
        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg">{change}</span>
      )}
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-xs text-white/35 font-medium uppercase tracking-wide">{label}</div>
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
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Student View', icon: <Home className="w-4 h-4" /> },
  ];

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: <Users className="w-5 h-5" />, color: '#7c3aed', change: '+12%' },
    { label: 'Subjects', value: stats?.total_subjects || 0, icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b', change: '+2' },
    { label: 'Chapters', value: stats?.total_chapters || 0, icon: <FileText className="w-5 h-5" />, color: '#06b6d4', change: '+8' },
    { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981', change: '+18%' },
    { label: 'Completions', value: stats?.total_completions || 0, icon: <CheckCircle className="w-5 h-5" />, color: '#8b5cf6', change: '+24%' },
    { label: 'Active Users', value: stats?.total_students || 0, icon: <Activity className="w-5 h-5" />, color: '#f43f5e', change: 'Live' },
  ];

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar flex flex-col ${mobile ? 'w-full h-full' : 'w-64 min-h-screen'} p-5`}>
      {/* Logo */}
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

  return (
    <div className="flex min-h-screen pt-[68px]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0 fixed left-0 top-[68px] bottom-0 w-64 z-40">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="glass p-2.5 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">Admin Dashboard</span>
          <div className="w-10" />
        </div>

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Overview</h1>
          <p className="text-white/35 text-sm">Monitor your platform performance at a glance.</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((s, i) => <StatCard key={i} {...s} index={i} />)}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/admin/notifications" className="card-premium p-6 flex items-center gap-4 group hover:border-purple-500/35 transition-all duration-200 block">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/12 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Megaphone className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm mb-1">Send Notification</p>
                <p className="text-white/35 text-xs">Alert students with announcements</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
            <Link to="/admin/subjects" className="card-premium p-6 flex items-center gap-4 group hover:border-gold-500/35 transition-all duration-200 block">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/12 border border-gold-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm mb-1">Manage Content</p>
                <p className="text-white/35 text-xs">Add subjects, chapters & materials</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}>
            <Link to="/admin/exams" className="card-premium p-6 flex items-center gap-4 group hover:border-cyan-500/35 transition-all duration-200 block">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/12 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm mb-1">Exam Manager</p>
                <p className="text-white/35 text-xs">Create & publish exams</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        </div>

        {/* Students table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card-premium rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-400" />
              <h2 className="font-semibold text-white text-sm">Recent Students</h2>
            </div>
            <span className="badge-purple">{stats?.total_students || 0} total</span>
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
                {users.filter(u => u.role === 'student').map(u => (
                  <tr key={u.id}>
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
                {users.filter(u => u.role === 'student').length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-white/25 text-sm">No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
