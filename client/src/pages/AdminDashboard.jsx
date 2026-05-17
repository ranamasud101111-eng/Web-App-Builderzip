import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, Bell, BarChart3, TrendingUp, CheckCircle, ChevronRight, Activity } from 'lucide-react';
import api from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/users'),
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: <Users className="w-6 h-6" />, color: '#6366f1', change: '+12%' },
    { label: 'Subjects', value: stats?.total_subjects || 0, icon: <BookOpen className="w-6 h-6" />, color: '#8b5cf6', change: '+2' },
    { label: 'Total Chapters', value: stats?.total_chapters || 0, icon: <BarChart3 className="w-6 h-6" />, color: '#06b6d4', change: '+8' },
    { label: 'Completions', value: stats?.total_completions || 0, icon: <CheckCircle className="w-6 h-6" />, color: '#10b981', change: '+24%' },
    { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: <TrendingUp className="w-6 h-6" />, color: '#f59e0b', change: '+18%' },
    { label: 'Avg Progress', value: stats?.total_chapters > 0 ? `${Math.round((stats?.total_completions / (stats?.total_enrollments * stats?.total_chapters || 1)) * 100)}%` : '0%', icon: <Activity className="w-6 h-6" />, color: '#f43f5e', change: '+5%' },
  ];

  const adminLinks = [
    { to: '/admin/notifications', label: 'Manage Notifications', desc: 'Send alerts to students', icon: <Bell className="w-5 h-5" />, color: '#6366f1' },
    { to: '/admin/subjects', label: 'Manage Subjects', desc: 'Add or edit subjects & chapters', icon: <BookOpen className="w-5 h-5" />, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">Admin <span className="gradient-text">Dashboard</span></h1>
          <p className="text-white/50">Manage your learning platform from one place.</p>
        </motion.div>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-4 border border-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}20`, color: s.color }}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
              <div className="text-xs text-white/40 leading-tight">{s.label}</div>
              <div className="text-xs text-green-400 mt-1 font-medium">{s.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Admin actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {adminLinks.map((link, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={link.to} className="flex items-center gap-4 glass rounded-2xl p-6 card-hover group border border-white/5 block">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}20`, color: link.color }}>
                  {link.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold group-hover:text-indigo-300 transition-colors">{link.label}</h3>
                  <p className="text-white/40 text-sm">{link.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent users */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-white mb-4">Recent Students</h2>
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-xs text-white/40 font-semibold uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-4 text-xs text-white/40 font-semibold uppercase tracking-wider hidden md:table-cell">Class</th>
                  <th className="text-left px-6 py-4 text-xs text-white/40 font-semibold uppercase tracking-wider hidden md:table-cell">Enrolled</th>
                  <th className="text-left px-6 py-4 text-xs text-white/40 font-semibold uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.name}</p>
                          <p className="text-white/40 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-white/50 text-sm">{u.class_level ? `Class ${u.class_level}` : '-'}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-white/50 text-sm">{u.enrolled_count} subjects</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/50 text-sm">{u.completed_chapters} chapters</span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-white/30">No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
