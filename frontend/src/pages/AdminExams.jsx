import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  GraduationCap, Plus, X, Edit2, Trash2, Eye, EyeOff,
  BarChart3, Bell, BookOpen, Home, LogOut, Menu, Brain,
  Clock, Trophy, Target, CheckCircle, AlertCircle,
  ChevronDown, Shield, FileText, Loader2, Globe, Lock, Layers,
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

const emptyForm = {
  title: '', description: '', subject_id: '', chapter_id: '',
  duration_minutes: 60, total_marks: 100, passing_marks: 40,
  question_count: 10, difficulty: 'mixed', is_published: false,
};

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', color: '#f43f5e' },
  { value: 'mixed', label: 'Mixed', color: '#7c3aed' },
];

export default function AdminExams() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => { fetchExams(); fetchSubjects(); }, []);

  useEffect(() => {
    if (form.subject_id) {
      api.get(`/subjects/${form.subject_id}/chapters`).then(r => setChapters(r.data)).catch(() => setChapters([]));
    } else {
      setChapters([]);
      setForm(p => ({ ...p, chapter_id: '' }));
    }
  }, [form.subject_id]);

  const fetchExams = async () => {
    setLoading(true);
    try { const r = await api.get('/exams'); setExams(r.data); }
    catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try { const r = await api.get('/subjects'); setSubjects(r.data); } catch {}
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (exam) => {
    setEditItem(exam);
    setForm({
      title: exam.title,
      description: exam.description || '',
      subject_id: exam.subject_id || '',
      chapter_id: exam.chapter_id || '',
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks,
      passing_marks: exam.passing_marks,
      question_count: exam.question_count,
      difficulty: exam.difficulty || 'mixed',
      is_published: exam.is_published,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        subject_id: form.subject_id || null,
        chapter_id: form.chapter_id || null,
        duration_minutes: parseInt(form.duration_minutes) || 60,
        total_marks: parseInt(form.total_marks) || 100,
        passing_marks: parseInt(form.passing_marks) || 40,
        question_count: parseInt(form.question_count) || 10,
      };
      if (editItem) {
        await api.put(`/exams/${editItem.id}`, payload);
        toast.success('Exam updated!');
      } else {
        await api.post('/exams', payload);
        toast.success('Exam created!');
      }
      setShowForm(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save exam');
    } finally { setSaving(false); }
  };

  const handleTogglePublish = async (exam) => {
    try {
      const r = await api.patch(`/exams/${exam.id}/toggle-publish`);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, is_published: r.data.is_published } : e));
      toast.success(r.data.is_published ? 'Exam published!' : 'Exam unpublished');
    } catch {
      toast.error('Failed to update exam status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/exams/${deleteId}`);
      toast.success('Exam deleted');
      setDeleteId(null);
      fetchExams();
    } catch {
      toast.error('Failed to delete exam');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

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

  const diffColor = (d) => DIFFICULTIES.find(x => x.value === d)?.color || '#7c3aed';

  return (
    <>
    <div className="flex">
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
          <span className="font-bold text-white">Exam Manager</span>
          <div className="w-10" />
        </div>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Exam Manager</h1>
            <p className="text-white/35 text-sm">Create, configure, and publish exams for students.</p>
          </div>
          <button onClick={openCreate}
            className="btn-primary flex items-center gap-2 py-2.5 px-5">
            <Plus className="w-4 h-4" />
            <span>New Exam</span>
          </button>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Exams', value: exams.length, icon: <GraduationCap className="w-5 h-5" />, color: '#7c3aed' },
            { label: 'Published', value: exams.filter(e => e.is_published).length, icon: <Globe className="w-5 h-5" />, color: '#10b981' },
            { label: 'Drafts', value: exams.filter(e => !e.is_published).length, icon: <Lock className="w-5 h-5" />, color: '#f59e0b' },
            { label: 'Subjects', value: new Set(exams.map(e => e.subject_id).filter(Boolean)).size, icon: <BookOpen className="w-5 h-5" />, color: '#06b6d4' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
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

        {/* Exams list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/15" />
              <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
          </div>
        ) : exams.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card-premium rounded-3xl text-center py-24">
            <GraduationCap className="w-14 h-14 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No exams yet</h3>
            <p className="text-white/35 text-sm mb-6">Create your first exam to get started.</p>
            <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Exam
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {exams.map((exam, i) => (
              <motion.div key={exam.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-premium p-5 flex flex-col md:flex-row md:items-center gap-4">
                {/* Left: title + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <h3 className="text-white font-bold text-sm">{exam.title}</h3>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exam.is_published
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'bg-white/[0.06] text-white/40 border border-white/10'
                    }`}>
                      {exam.is_published ? <><Globe className="w-2.5 h-2.5" /> Published</> : <><Lock className="w-2.5 h-2.5" /> Draft</>}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ background: `${diffColor(exam.difficulty)}15`, color: diffColor(exam.difficulty), borderColor: `${diffColor(exam.difficulty)}30` }}>
                      {exam.difficulty || 'mixed'}
                    </span>
                  </div>
                  {exam.description && <p className="text-white/35 text-xs mb-2 line-clamp-1">{exam.description}</p>}
                  <div className="flex items-center gap-4 flex-wrap">
                    {exam.subject_name && (
                      <span className="flex items-center gap-1.5 text-xs text-white/45">
                        <span className="text-sm">{exam.subject_icon}</span> {exam.subject_name}
                      </span>
                    )}
                    {exam.chapter_title && (
                      <span className="flex items-center gap-1.5 text-xs text-white/35">
                        <FileText className="w-3 h-3" /> {exam.chapter_title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Center: stats */}
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-white/60 text-xs mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span className="font-semibold text-white/80">{exam.duration_minutes}m</span>
                    </div>
                    <p className="text-[10px] text-white/25">Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-white/60 text-xs mb-0.5">
                      <Trophy className="w-3 h-3" />
                      <span className="font-semibold text-white/80">{exam.total_marks}</span>
                    </div>
                    <p className="text-[10px] text-white/25">Marks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-white/60 text-xs mb-0.5">
                      <Target className="w-3 h-3" />
                      <span className="font-semibold text-white/80">{exam.question_count}</span>
                    </div>
                    <p className="text-[10px] text-white/25">Questions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-white/60 text-xs mb-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span className="font-semibold text-white/80">{exam.passing_marks}</span>
                    </div>
                    <p className="text-[10px] text-white/25">Pass Marks</p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(exam)}
                    title={exam.is_published ? 'Unpublish' : 'Publish'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exam.is_published
                        ? 'bg-amber-500/12 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                        : 'bg-emerald-500/12 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}>
                    {exam.is_published ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                  <button onClick={() => openEdit(exam)}
                    className="p-2 rounded-lg glass hover:bg-blue-500/15 text-white/40 hover:text-blue-400 transition-all"
                    title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(exam.id)}
                    className="p-2 rounded-lg glass hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>

    {createPortal(
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-navy rounded-3xl border border-purple-500/15 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-premium">

              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{editItem ? 'Edit Exam' : 'Create New Exam'}</h2>
                    <p className="text-white/30 text-xs">Fill in the exam configuration</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/[0.07] rounded-xl transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Exam Title *</label>
                  <input type="text" required placeholder="e.g. CA Certificate Level — Financial Accounting Paper"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="input-field" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea rows={2} placeholder="Brief description of the exam..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="input-field resize-none" />
                </div>

                {/* Subject + Chapter */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Subject</label>
                    <div className="relative">
                      <select value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value, chapter_id: '' }))}
                        className="input-field appearance-none pr-8 cursor-pointer">
                        <option value="">— None —</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Chapter</label>
                    <div className="relative">
                      <select value={form.chapter_id} onChange={e => setForm(p => ({ ...p, chapter_id: e.target.value }))}
                        className="input-field appearance-none pr-8 cursor-pointer" disabled={!form.subject_id}>
                        <option value="">— None —</option>
                        {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Numeric fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Duration (min)</label>
                    <input type="number" min="1" max="480" required
                      value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Total Marks</label>
                    <input type="number" min="1" required
                      value={form.total_marks} onChange={e => setForm(p => ({ ...p, total_marks: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Pass Marks</label>
                    <input type="number" min="1" required
                      value={form.passing_marks} onChange={e => setForm(p => ({ ...p, passing_marks: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Questions</label>
                    <input type="number" min="1" max="200" required
                      value={form.question_count} onChange={e => setForm(p => ({ ...p, question_count: e.target.value }))}
                      className="input-field" />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Difficulty</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIFFICULTIES.map(d => (
                      <button key={d.value} type="button"
                        onClick={() => setForm(p => ({ ...p, difficulty: d.value }))}
                        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
                        style={form.difficulty === d.value
                          ? { background: `${d.color}20`, color: d.color, borderColor: `${d.color}50` }
                          : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.08)' }
                        }>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Publish toggle */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">Publish Exam</p>
                    <p className="text-white/35 text-xs mt-0.5">Make this exam visible to students immediately</p>
                  </div>
                  <button type="button" onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${form.is_published ? 'bg-emerald-500' : 'bg-white/[0.12]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${form.is_published ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 px-5 py-3 rounded-xl text-white/50 hover:text-white border border-white/[0.07] hover:border-white/20 text-sm font-semibold transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editItem ? 'Save Changes' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    , document.body)}

    {createPortal(
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-navy rounded-3xl border border-red-500/20 p-7 w-full max-w-sm text-center shadow-premium">
              <div className="w-14 h-14 rounded-2xl bg-red-500/12 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Delete Exam?</h3>
              <p className="text-white/40 text-sm mb-6">This action cannot be undone. The exam will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.07] text-white/50 hover:text-white text-sm font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 text-sm font-semibold transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    , document.body)}
    </>
  );
}
