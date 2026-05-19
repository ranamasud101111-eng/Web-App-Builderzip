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
  Zap, HelpCircle, Shuffle,
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
  { value: 'easy',   label: 'Easy',   color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard',   label: 'Hard',   color: '#f43f5e' },
  { value: 'mixed',  label: 'Mixed',  color: '#7c3aed' },
];

export default function AdminExams() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Full Exam Mode state
  const [feSubjectId, setFeSubjectId] = useState('');
  const [feChapterId, setFeChapterId] = useState('');
  const [feChapters, setFeChapters] = useState([]);
  const [feChapterMcqs, setFeChapterMcqs] = useState(null);
  const [feCreating, setFeCreating] = useState(false);
  const [feExams, setFeExams] = useState([]);

  useEffect(() => { fetchExams(); fetchSubjects(); }, []);

  useEffect(() => {
    if (form.subject_id) {
      api.get(`/subjects/${form.subject_id}/chapters`).then(r => setChapters(r.data)).catch(() => setChapters([]));
    } else {
      setChapters([]);
      setForm(p => ({ ...p, chapter_id: '' }));
    }
  }, [form.subject_id]);

  useEffect(() => {
    if (feSubjectId) {
      api.get(`/subjects/${feSubjectId}/chapters`).then(r => setFeChapters(r.data)).catch(() => setFeChapters([]));
      setFeChapterId('');
      setFeChapterMcqs(null);
    } else {
      setFeChapters([]);
      setFeChapterId('');
      setFeChapterMcqs(null);
    }
  }, [feSubjectId]);

  useEffect(() => {
    if (feChapterId) {
      api.get(`/chapters/${feChapterId}/mcqs`).then(r => setFeChapterMcqs(r.data)).catch(() => setFeChapterMcqs([]));
    } else {
      setFeChapterMcqs(null);
    }
  }, [feChapterId]);

  const fetchExams = async () => {
    setLoading(true);
    try { const r = await api.get('/exams'); setExams(r.data); }
    catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try { const r = await api.get('/subjects'); setSubjects(r.data); } catch {}
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (exam) => {
    setEditItem(exam);
    setForm({
      title: exam.title, description: exam.description || '',
      subject_id: exam.subject_id || '', chapter_id: exam.chapter_id || '',
      duration_minutes: exam.duration_minutes, total_marks: exam.total_marks,
      passing_marks: exam.passing_marks, question_count: exam.question_count,
      difficulty: exam.difficulty || 'mixed', is_published: exam.is_published,
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
    } catch { toast.error('Failed to update exam status'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/exams/${deleteId}`);
      toast.success('Exam deleted');
      setDeleteId(null);
      fetchExams();
    } catch { toast.error('Failed to delete exam'); }
  };

  const handleCreateFullExam = async () => {
    if (!feChapterId) { toast.error('Please select a chapter'); return; }
    const mcqCount = feChapterMcqs?.length || 0;
    if (mcqCount < 5) { toast.error('Chapter needs at least 5 MCQs for a Full Exam'); return; }
    setFeCreating(true);
    try {
      const chapter = feChapters.find(c => String(c.id) === String(feChapterId));
      const subject = subjects.find(s => String(s.id) === String(feSubjectId));
      const payload = {
        title: `Full Exam — ${chapter?.title || 'Chapter'}`,
        description: `Auto-generated 15-question full exam from "${chapter?.title}"`,
        subject_id: feSubjectId || null,
        chapter_id: feChapterId,
        duration_minutes: 15,
        total_marks: 15,
        passing_marks: 8,
        question_count: Math.min(15, mcqCount),
        difficulty: 'mixed',
        is_published: true,
      };
      await api.post('/exams', payload);
      toast.success('Full Exam created and published!');
      fetchExams();
      setActiveTab('exams');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create exam');
    } finally { setFeCreating(false); }
  };

  const diffColor = (d) => DIFFICULTIES.find(x => x.value === d)?.color || '#7c3aed';

  return (
    <>
    <div className="px-6 lg:px-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Exam Manager</h1>
          <p className="text-white/35 text-sm">Create, configure, and publish exams for students.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2.5 px-5">
          <Plus className="w-4 h-4" /><span>New Exam</span>
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-7">
        {[
          { key: 'exams', label: 'All Exams', icon: GraduationCap },
          { key: 'fullexam', label: 'Full Exam Mode', icon: Shuffle },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.key
              ? { background: 'rgba(139,92,246,0.18)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Exams',  value: exams.length,                                            icon: <GraduationCap className="w-5 h-5" />, color: '#7c3aed' },
          { label: 'Published',   value: exams.filter(e => e.is_published).length,                icon: <Globe className="w-5 h-5" />,        color: '#10b981' },
          { label: 'Drafts',      value: exams.filter(e => !e.is_published).length,               icon: <Lock className="w-5 h-5" />,         color: '#f59e0b' },
          { label: 'Subjects',    value: new Set(exams.map(e => e.subject_id).filter(Boolean)).size, icon: <BookOpen className="w-5 h-5" />,  color: '#06b6d4' },
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

      {/* ======= ALL EXAMS TAB ======= */}
      {activeTab === 'exams' && (
        loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/15" />
              <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
            </div>
          </div>
        ) : exams.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium rounded-3xl text-center py-24">
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
              <motion.div key={exam.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card-premium p-5 flex flex-col md:flex-row md:items-center gap-4">
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
                <div className="flex items-center gap-5 flex-shrink-0">
                  {[
                    { icon: Clock,       val: `${exam.duration_minutes}m`, label: 'Duration' },
                    { icon: Trophy,      val: exam.total_marks,            label: 'Marks' },
                    { icon: Target,      val: exam.question_count,         label: 'Questions' },
                    { icon: CheckCircle, val: exam.passing_marks,          label: 'Pass Marks' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="flex items-center gap-1 text-white/60 text-xs mb-0.5">
                        <s.icon className="w-3 h-3" />
                        <span className="font-semibold text-white/80">{s.val}</span>
                      </div>
                      <p className="text-[10px] text-white/25">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleTogglePublish(exam)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      exam.is_published
                        ? 'bg-amber-500/12 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                        : 'bg-emerald-500/12 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    }`}>
                    {exam.is_published ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                  <button onClick={() => openEdit(exam)} className="p-2 rounded-lg glass hover:bg-blue-500/15 text-white/40 hover:text-blue-400 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(exam.id)} className="p-2 rounded-lg glass hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* ======= FULL EXAM MODE TAB ======= */}
      {activeTab === 'fullexam' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Explainer */}
          <div className="card-premium p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]" style={{ background: 'radial-gradient(circle at top right, #8b5cf6, transparent 60%)' }} />
            <div className="relative z-10 flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <Shuffle className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">Full Exam Mode</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Auto-generate a timed full exam from a chapter's MCQ bank.
                  Full Exams are <span className="text-violet-300 font-semibold">15 minutes long with 15 questions</span> randomly selected
                  from the chapter's active MCQs. The exam is instantly published for students.
                </p>
              </div>
            </div>
          </div>

          {/* Generator form */}
          <div className="card-premium p-6 mb-8">
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-400" /> Generate Full Exam
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Subject</label>
                <div className="relative">
                  <select value={feSubjectId} onChange={e => setFeSubjectId(e.target.value)}
                    className="input-field appearance-none pr-8">
                    <option value="">— Select Subject —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Chapter</label>
                <div className="relative">
                  <select value={feChapterId} onChange={e => setFeChapterId(e.target.value)}
                    className="input-field appearance-none pr-8" disabled={!feSubjectId}>
                    <option value="">— Select Chapter —</option>
                    {feChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* MCQ count info */}
            {feChapterId && feChapterMcqs !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl mb-5 flex items-center gap-4"
                style={{ background: feChapterMcqs.length >= 5 ? 'rgba(16,185,129,0.07)' : 'rgba(244,63,94,0.07)',
                  border: `1px solid ${feChapterMcqs.length >= 5 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}` }}>
                <Brain className={`w-5 h-5 flex-shrink-0 ${feChapterMcqs.length >= 5 ? 'text-emerald-400' : 'text-red-400'}`} />
                <div>
                  <p className={`text-sm font-semibold ${feChapterMcqs.length >= 5 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {feChapterMcqs.length} MCQs available
                  </p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {feChapterMcqs.length >= 15
                      ? 'Enough for a 15-question full exam'
                      : feChapterMcqs.length >= 5
                        ? `Exam will use all ${feChapterMcqs.length} questions`
                        : 'Need at least 5 MCQs to generate an exam'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Exam config preview */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Duration', value: '15 min', icon: Clock, color: '#8b5cf6' },
                { label: 'Questions', value: feChapterId && feChapterMcqs ? `${Math.min(15, feChapterMcqs.length)}` : '15', icon: Target, color: '#06b6d4' },
                { label: 'Pass Marks', value: '8 / 15', icon: Trophy, color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                  <s.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} />
                  <div className="text-sm font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-white/30 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={handleCreateFullExam} disabled={feCreating || !feChapterId || (feChapterMcqs !== null && feChapterMcqs.length < 5)}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40">
              {feCreating
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Exam...</>
                : <><Shuffle className="w-4 h-4" /> Generate & Publish Full Exam</>
              }
            </button>
          </div>

          {/* Full exams list */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              Full Exams ({exams.filter(e => e.duration_minutes === 15 && e.question_count <= 15).length})
            </h3>
            <div className="flex flex-col gap-3">
              {exams.filter(e => e.duration_minutes === 15 && e.question_count <= 15).map((exam, i) => (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="card-premium p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Shuffle className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 font-semibold text-sm truncate">{exam.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-white/30">
                      {exam.chapter_title && <span>{exam.chapter_title}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration_minutes}m</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {exam.question_count}q</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exam.is_published
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/[0.06] text-white/35 border border-white/10'
                    }`}>
                      {exam.is_published ? 'Published' : 'Draft'}
                    </span>
                    <button onClick={() => setDeleteId(exam.id)} className="p-2 rounded-lg glass hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {exams.filter(e => e.duration_minutes === 15 && e.question_count <= 15).length === 0 && (
                <div className="card-premium p-8 text-center">
                  <Shuffle className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No full exams generated yet.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>

    {/* Create/Edit exam modal */}
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
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Exam Title *</label>
                  <input type="text" required placeholder="e.g. CA Certificate Level — Financial Accounting Paper"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea rows={2} placeholder="Brief description..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="input-field resize-none" />
                </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Duration (min)', key: 'duration_minutes', min: 1, max: 480 },
                    { label: 'Total Marks',    key: 'total_marks',      min: 1, max: 999 },
                    { label: 'Pass Marks',     key: 'passing_marks',    min: 1, max: 999 },
                    { label: 'Questions',      key: 'question_count',   min: 1, max: 200 },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">{f.label}</label>
                      <input type="number" min={f.min} max={f.max} required
                        value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="input-field" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Difficulty</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIFFICULTIES.map(d => (
                      <button key={d.value} type="button"
                        onClick={() => setForm(p => ({ ...p, difficulty: d.value }))}
                        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
                        style={form.difficulty === d.value
                          ? { background: `${d.color}20`, color: d.color, borderColor: `${d.color}50` }
                          : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.08)' }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">Publish Exam</p>
                    <p className="text-white/35 text-xs mt-0.5">Make this exam visible to students immediately</p>
                  </div>
                  <button type="button" onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.is_published ? 'bg-emerald-500' : 'bg-white/[0.1]'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${form.is_published ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-outline py-3">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editItem ? 'Save Changes' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}

    {/* Delete confirmation */}
    {createPortal(
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-navy rounded-2xl p-6 w-full max-w-sm border border-red-500/20 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Delete Exam?</h3>
              <p className="text-white/45 text-sm mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
