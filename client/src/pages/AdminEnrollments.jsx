import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Bell, BarChart3, TrendingUp, CheckCircle,
  Home, LogOut, Menu, X, Brain, GraduationCap, Shield,
  Loader2, ChevronRight, Star, BarChart2
} from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function AdminEnrollments() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/subjects', label: 'Subjects & Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/mcqs', label: 'MCQ Manager', icon: <Brain className="w-4 h-4" /> },
    { to: '/admin/exams', label: 'Exam Manager', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Student View', icon: <Home className="w-4 h-4" /> },
  ];

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/subjects'), api.get('/users/stats')])
      .then(([uRes, sRes, stRes]) => {
        setUsers(uRes.data.filter(u => u.role === 'student'));
        setSubjects(sRes.data);
        setStats(stRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const totalEnrollments = stats?.total_enrollments || 0;
  const avgPerStudent = users.length ? (totalEnrollments / users.length).toFixed(1) : 0;

  const enrolledDistribution = [0, 1, 2, 3, 4, 5].map(n => ({
    count: n,
    label: n === 0 ? 'None' : n === 5 ? '5+' : `${n}`,
    students: users.filter(u => {
      const e = parseInt(u.enrolled_count || 0);
      return n === 5 ? e >= 5 : e === n;
    }).length,
  }));

  const studentsWithEnrollments = users.filter(u => parseInt(u.enrolled_count || 0) > 0);
  const topEnrolled = [...users]
    .sort((a, b) => parseInt(b.enrolled_count || 0) - parseInt(a.enrolled_count || 0))
    .slice(0, 10);

  const maxStudents = Math.max(...enrolledDistribution.map(d => d.students), 1);

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
          <span className="font-bold text-white">Enrollments</span>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-white/35 hover:text-white text-sm transition-colors">Overview</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-white text-sm font-semibold">Enrollments</span>
          </div>
          <h1 className="text-3xl font-black text-white">Enrollment Details</h1>
          <p className="text-white/35 text-sm mt-1">Track how students are enrolling across subjects.</p>
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
                { label: 'Total Enrollments', value: totalEnrollments, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981' },
                { label: 'Avg per Student', value: avgPerStudent, icon: <BarChart2 className="w-5 h-5" />, color: '#7c3aed' },
                { label: 'Students Enrolled', value: studentsWithEnrollments.length, icon: <Users className="w-5 h-5" />, color: '#06b6d4' },
                { label: 'Available Subjects', value: subjects.length, icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b' },
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
              {/* Enrollment distribution chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="card-premium p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-semibold text-white text-sm">Enrollment Distribution</h2>
                </div>
                <div className="flex items-end gap-3 h-32">
                  {enrolledDistribution.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-white/50">{d.students}</span>
                      <div className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${Math.max(4, (d.students / maxStudents) * 100)}%`,
                          background: d.students > 0 ? 'linear-gradient(to top, #10b981aa, #10b98155)' : 'rgba(255,255,255,0.05)',
                          minHeight: '4px',
                        }} />
                      <span className="text-[10px] text-white/30">{d.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/25 mt-3 text-center">Students by number of subject enrollments</p>
              </motion.div>

              {/* Subjects list */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="card-premium p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <BookOpen className="w-4 h-4 text-gold-400" />
                  <h2 className="font-semibold text-white text-sm">Available Subjects</h2>
                </div>
                {subjects.length === 0 ? (
                  <p className="text-white/25 text-sm text-center py-8">No subjects yet.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {subjects.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 py-1.5">
                        <span className="text-xl w-7 flex-shrink-0">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-medium truncate">{s.name}</p>
                        </div>
                        <div className="flex-shrink-0 w-24 progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (i + 1) * 15)}%`, background: s.color || '#7c3aed' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Top enrolled students */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="card-premium rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-gold-400" />
                  <h2 className="font-semibold text-white text-sm">Top Enrolled Students</h2>
                </div>
                <span className="badge-purple">{topEnrolled.length} students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Subjects Enrolled</th>
                      <th className="hidden md:table-cell">Chapters Done</th>
                      <th className="hidden md:table-cell">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEnrolled.map((u, i) => (
                      <tr key={u.id}>
                        <td>
                          <span className={`text-sm font-bold ${i === 0 ? 'text-gold-400' : i === 1 ? 'text-white/50' : i === 2 ? 'text-amber-600' : 'text-white/25'}`}>
                            #{i + 1}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white/85 font-medium text-sm">{u.name}</p>
                              <p className="text-white/30 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400">
                            {u.enrolled_count || 0}
                            <span className="text-white/25 font-normal text-xs">subjects</span>
                          </span>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-white/45 text-sm">{u.completed_chapters || 0}</span>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-white/40 text-sm">{u.class_level || '—'}</span>
                        </td>
                      </tr>
                    ))}
                    {topEnrolled.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-white/25 text-sm">No enrollment data yet.</td></tr>
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
