import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, CheckCircle, Search, Loader2, ChevronRight,
  UserCheck, Award, Calendar, Eye, Edit2, Trash2, Ban, X, Save,
  UserX, RefreshCw, AlertTriangle,
} from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

export default function AdminStudents() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', class_level: '' });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data.filter(u => u.role === 'student')))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avgEnrollments = users.length
    ? (users.reduce((s, u) => s + parseInt(u.enrolled_count || 0), 0) / users.length).toFixed(1) : 0;
  const avgCompletions = users.length
    ? (users.reduce((s, u) => s + parseInt(u.completed_chapters || 0), 0) / users.length).toFixed(1) : 0;
  const topStudent = [...users].sort((a, b) =>
    parseInt(b.completed_chapters || 0) - parseInt(a.completed_chapters || 0)
  )[0];

  const openEdit = (student) => {
    setEditStudent(student);
    setEditForm({ name: student.name || '', email: student.email || '', class_level: student.class_level || '' });
  };

  const handleEdit = async () => {
    if (!editStudent) return;
    setActionLoading(`edit-${editStudent.id}`);
    try {
      const r = await api.put(`/users/${editStudent.id}`, editForm);
      setUsers(prev => prev.map(u => u.id === editStudent.id ? { ...u, ...r.data } : u));
      setEditStudent(null);
      toast.success('Student updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    const wasSuspended = users.find(u => u.id === id)?.is_suspended;
    setActionLoading(`suspend-${id}`);
    try {
      const r = await api.patch(`/users/${id}/suspend`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: r.data.is_suspended } : u));
      toast.success(wasSuspended ? 'Account restored' : 'Account suspended');
    } catch {
      toast.error('Failed to update suspension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(`delete-${deleteId}`);
    try {
      await api.delete(`/users/${deleteId}`);
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      setDeleteId(null);
      toast.success('Student deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTarget = users.find(u => u.id === deleteId);

  const MODAL_OVERLAY = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
  const MODAL_BOX = 'relative w-full max-w-md card-premium rounded-3xl p-6 shadow-2xl';

  return (
    <div className="px-6 lg:px-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/admin" className="text-white/35 hover:text-white text-sm transition-colors">Overview</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/20" />
          <span className="text-white text-sm font-semibold">Students</span>
        </div>
        <h1 className="text-3xl font-black text-white">Student Management</h1>
        <p className="text-white/35 text-sm mt-1">View, edit, suspend, and remove student accounts.</p>
      </motion.div>

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

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-11 w-full md:w-80" />
      </div>

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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={u.is_suspended ? { opacity: 0.6 } : {}}>
                    <td className="text-white/30 text-xs font-mono w-8">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${u.is_suspended ? 'bg-red-800/60' : 'bg-gradient-to-br from-purple-700 to-violet-900'}`}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white/85 font-medium text-sm">{u.name}</p>
                            {u.is_suspended && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                                Suspended
                              </span>
                            )}
                          </div>
                          <p className="text-white/30 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-white/45 text-sm">
                        {u.class_level ? (isNaN(u.class_level) ? u.class_level : `Class ${u.class_level}`) : '—'}
                      </span>
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
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewStudent(u)} title="View"
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-blue-500/15 text-white/30 hover:text-blue-400 transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(u)} title="Edit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-amber-500/15 text-white/30 hover:text-amber-400 transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleSuspend(u.id)} title={u.is_suspended ? 'Restore' : 'Suspend'}
                          disabled={actionLoading === `suspend-${u.id}`}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${u.is_suspended ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/[0.04] text-white/30 hover:bg-orange-500/15 hover:text-orange-400'}`}>
                          {actionLoading === `suspend-${u.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : u.is_suspended ? <RefreshCw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setDeleteId(u.id)} title="Delete"
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-14 text-white/25 text-sm">
                    {search ? 'No students match your search.' : 'No students registered yet.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── View Modal ── */}
      <AnimatePresence>
        {viewStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={MODAL_OVERLAY}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={MODAL_BOX}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-white font-black text-lg">
                    {viewStudent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{viewStudent.name}</h3>
                    <p className="text-white/40 text-xs">{viewStudent.email}</p>
                  </div>
                </div>
                <button onClick={() => setViewStudent(null)} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Status', value: viewStudent.is_suspended ? 'Suspended' : 'Active', valueClass: viewStudent.is_suspended ? 'text-red-400' : 'text-emerald-400' },
                  { label: 'Class Level', value: viewStudent.class_level || 'Not set' },
                  { label: 'Subjects Enrolled', value: `${viewStudent.enrolled_count || 0} subjects` },
                  { label: 'Chapters Completed', value: `${viewStudent.completed_chapters || 0} chapters` },
                  { label: 'Joined', value: new Date(viewStudent.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
                    <span className="text-white/40 text-sm">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.valueClass || 'text-white/80'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => { setViewStudent(null); openEdit(viewStudent); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setViewStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors text-sm font-semibold">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={MODAL_OVERLAY}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={MODAL_BOX}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" /> Edit Student
                </h3>
                <button onClick={() => setEditStudent(null)} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field w-full" placeholder="Student name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-1.5 block">Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field w-full" placeholder="Email" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/35 uppercase tracking-wide mb-1.5 block">Class Level</label>
                  <input type="text" value={editForm.class_level} onChange={e => setEditForm(f => ({ ...f, class_level: e.target.value }))}
                    className="input-field w-full" placeholder="e.g. Certificate, Professional" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setEditStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-white/50 hover:bg-white/[0.08] transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={actionLoading === `edit-${editStudent.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading === `edit-${editStudent.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={MODAL_OVERLAY}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={MODAL_BOX}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <button onClick={() => setDeleteId(null)} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <h3 className="text-white font-bold text-base mb-2">Delete Student Account</h3>
              <p className="text-white/50 text-sm mb-1">
                Are you sure you want to permanently delete{' '}
                <span className="text-white font-semibold">{deleteTarget?.name}</span>?
              </p>
              <p className="text-red-400/70 text-xs mb-5">
                This will remove their account, enrollments, and progress data. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-white/50 hover:bg-white/[0.08] transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={actionLoading === `delete-${deleteId}`}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors text-sm font-semibold flex items-center justify-center gap-2 border border-red-500/25 disabled:opacity-60">
                  {actionLoading === `delete-${deleteId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
