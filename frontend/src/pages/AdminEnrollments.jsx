import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, BarChart3, TrendingUp, CheckCircle,
  ChevronRight, Star, BarChart2, Layers, X, User, Mail,
  Calendar, Activity, Brain
} from 'lucide-react';
import api from '../api';

export default function AdminEnrollments() {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const openStudentDetail = async (student) => {
    setSelectedStudent(student);
    setStudentDetail(null);
    setDetailLoading(true);
    try {
      const [enrollRes, progressRes] = await Promise.all([
        api.get(`/users/${student.id}/enrollments`).catch(() => ({ data: [] })),
        api.get(`/users/${student.id}/progress`).catch(() => ({ data: {} })),
      ]);
      setStudentDetail({ enrollments: enrollRes.data, progress: progressRes.data });
    } catch {}
    finally { setDetailLoading(false); }
  };

  const totalEnrollments = stats?.total_enrollments || 0;
  const studentsWithEnrollments = users.filter(u => parseInt(u.enrolled_count || 0) > 0);
  const avgPerStudent = users.length ? (totalEnrollments / users.length).toFixed(1) : 0;

  const enrolledDistribution = [0, 1, 2, 3, 4, 5].map(n => ({
    count: n,
    label: n === 0 ? 'None' : n === 5 ? '5+' : `${n}`,
    students: users.filter(u => {
      const e = parseInt(u.enrolled_count || 0);
      return n === 5 ? e >= 5 : e === n;
    }).length,
  }));
  const maxStudents = Math.max(...enrolledDistribution.map(d => d.students), 1);
  const topEnrolled = [...users]
    .sort((a, b) => parseInt(b.enrolled_count || 0) - parseInt(a.enrolled_count || 0))
    .slice(0, 20);

  return (
    <div className="px-6 lg:px-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/admin" className="text-white/35 hover:text-white text-sm transition-colors">Overview</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/20" />
          <span className="text-white text-sm font-semibold">Enrollments</span>
        </div>
        <h1 className="text-3xl font-black text-white">Enrollment Details</h1>
        <p className="text-white/35 text-sm mt-1">Track how students are enrolling across subjects. Click any student row to view details.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/15" />
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Enrollments', value: totalEnrollments, icon: <TrendingUp className="w-5 h-5" />, color: '#10b981' },
              { label: 'Avg per Student',   value: avgPerStudent,    icon: <BarChart2 className="w-5 h-5" />, color: '#7c3aed' },
              { label: 'Students Enrolled', value: studentsWithEnrollments.length, icon: <Users className="w-5 h-5" />, color: '#06b6d4' },
              { label: 'Subjects Available', value: subjects.length, icon: <BookOpen className="w-5 h-5" />, color: '#f59e0b' },
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
            {/* Enrollment distribution */}
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

            {/* Available subjects */}
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

          {/* Student table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card-premium rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-gold-400" />
                <h2 className="font-semibold text-white text-sm">Students</h2>
              </div>
              <span className="badge-purple">{topEnrolled.length} shown</span>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {topEnrolled.map((u, i) => (
                    <tr key={u.id}
                      onClick={() => openStudentDetail(u)}
                      className="cursor-pointer hover:bg-white/[0.035] transition-colors">
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
                      <td>
                        <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40" />
                      </td>
                    </tr>
                  ))}
                  {topEnrolled.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-white/25 text-sm">No students yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setSelectedStudent(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-navy rounded-3xl border border-purple-500/15 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-premium">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-700 to-purple-900 flex items-center justify-center text-white font-black text-lg">
                    {selectedStudent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{selectedStudent.name}</h2>
                    <p className="text-white/35 text-xs flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3" /> {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white/[0.07] rounded-xl transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/[0.06]">
                {[
                  { label: 'Subjects Enrolled', value: selectedStudent.enrolled_count || 0, icon: Layers, color: '#8b5cf6' },
                  { label: 'Chapters Done',      value: selectedStudent.completed_chapters || 0, icon: CheckCircle, color: '#10b981' },
                  { label: 'Level',              value: selectedStudent.class_level || '—', icon: Activity, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <div className="text-xl font-black text-white">{s.value}</div>
                    <div className="text-[10px] text-white/30 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Enrollment details */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white font-semibold text-sm">Enrolled Subjects</h3>
                </div>

                {detailLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(studentDetail?.enrollments || []).length === 0 ? (
                      <p className="text-center text-white/30 text-sm py-8">No subjects enrolled yet.</p>
                    ) : (
                      (studentDetail?.enrollments || []).map((enrollment, i) => {
                        const subj = subjects.find(s => s.id === (enrollment.subject_id || enrollment.id));
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-2xl flex-shrink-0">{enrollment.subject_icon || subj?.icon || '📚'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 text-sm font-medium truncate">{enrollment.subject_name || enrollment.name || subj?.name}</p>
                              <p className="text-white/30 text-xs mt-0.5 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'Enrolled'}
                                {enrollment.completed_chapters !== undefined && (
                                  <span className="text-emerald-400">{enrollment.completed_chapters} chapters done</span>
                                )}
                              </p>
                            </div>
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Member info */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-1">Member Since</p>
                    <p className="text-white/70 text-sm">
                      {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-1">Role</p>
                    <p className="text-white/70 text-sm capitalize">{selectedStudent.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
