import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Bell, BarChart3, TrendingUp, CheckCircle,
  Home, LogOut, Menu, X, Brain, GraduationCap, Shield,
  Search, Loader2, ChevronRight, Activity, FileText,
  UserCheck, Award, Calendar, Layers,
  Zap,
  HelpCircle,
} from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function AdminStudents() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avgEnrollments = users.length ? (users.reduce((s, u) => s + parseInt(u.enrolled_count || 0), 0) / users.length).toFixed(1) : 0;
  const avgCompletions = users.length ? (users.reduce((s, u) => s + parseInt(u.completed_chapters || 0), 0) / users.length).toFixed(1) : 0;
  const topStudent = [...users].sort((a, b) => parseInt(b.completed_chapters || 0) - parseInt(a.completed_chapters || 0))[0];

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar flex flex-col ${mobile ? 'w-full h-full' : 'w-64 min-h-screen'} p-5`}>
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
          <span className="font-bold text-white">Students</span>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-white/35 hover:text-white text-sm transition-colors">Overview</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-white text-sm font-semibold">Students</span>
          </div>
          <h1 className="text-3xl font-black text-white">Student Management</h1>
          <p className="text-white/35 text-sm mt-1">View and manage all registered students on the platform.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: users.length, icon: <Users className="w-5 h-5" />, color: '#7c3aed' },
            { label: 'Avg Enrollments', value: avgEnrollments, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981' },
            { label: 'Avg Completions', value: avgCompletions, icon: <CheckCircle className="w-5 h-5" />, color: '#8b5cf6' },
            { label: 'Top Student', value: topStudent?.name?.split(' ')[0] || '—', icon: <Award className="w-5 h-5" />, color: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card-premium p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25` }}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-white mb-0.5 truncate">{s.value}</div>
              <div className="text-xs text-white/35 font-medium uppercase tracking-wide">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-11 w-full md:w-80" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card-premium rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <h2 className="font-semibold text-white text-sm">All Students</h2>
              </div>
              <span className="badge-purple">{filtered.length} {filtered.length === 1 ? 'student' : 'students'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th className="hidden md:table-cell">Level</th>
                    <th className="hidden sm:table-cell">Enrolled</th>
                    <th>Progress</th>
                    <th className="hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id}>
                      <td className="text-white/30 text-xs font-mono w-8">{i + 1}</td>
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
                        <span className="text-white/45 text-sm">{u.class_level ? (isNaN(u.class_level) ? u.class_level : `Class ${u.class_level}`) : '—'}</span>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <TrendingUp className="w-3 h-3" /> {u.enrolled_count || 0}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(100, parseInt(u.completed_chapters || 0) * 10)}%` }} />
                          </div>
                          <span className="text-white/50 text-xs font-medium">{u.completed_chapters || 0} ch</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-white/35 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-14 text-white/25 text-sm">
                      {search ? 'No students match your search.' : 'No students registered yet.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
