import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Layers, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp,
  BarChart3, Bell, BookOpen, Home, LogOut, Menu, Shield,
  Brain, GraduationCap, Eye, EyeOff, Youtube, Save, Loader2,
  Zap,
} from 'lucide-react';
import api from '../api';

/* ─── Sidebar link ─── */
const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

/* ─── Icon pickers ─── */
const LEVEL_ICONS   = ['🎓','📜','💼','🏆','⭐','🌟','🔥','💡','🎯','📚'];
const SUBJECT_ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','💻','⚗️','📐','📊','💡','⚖️','🏛️'];

const emptyLevel   = () => ({ name: '', description: '', icon: '🎓',  order_index: 0, is_visible: true });
const emptySubject = () => ({ name: '', description: '', icon: '📚',  order_index: 0, is_visible: true });
const emptyChapter = () => ({ title: '',description: '', youtube_url:'', order_index: 0, is_visible: true });

/* ─── Toggle switch ─── */
const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-white/10'}`}>
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-1'}`} />
  </button>
);

/* ─── Icon picker row ─── */
const IconPicker = ({ icons, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {icons.map(ic => (
      <button key={ic} type="button" onClick={() => onChange(ic)}
        className={`w-9 h-9 text-xl rounded-lg transition-all ${value === ic ? 'bg-purple-500/30 ring-2 ring-purple-400/50 scale-110' : 'bg-white/[0.04] hover:bg-white/[0.09]'}`}>
        {ic}
      </button>
    ))}
  </div>
);

/* ─── Modal wrapper ─── */
const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      className="relative w-full max-w-md rounded-2xl p-6 z-10 overflow-y-auto max-h-[90vh]"
      style={{ background: 'linear-gradient(135deg,rgba(14,22,74,0.98) 0%,rgba(6,11,36,0.99) 100%)', border: '1px solid rgba(124,58,237,0.25)' }}
      onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </div>
);

/* ──────────────────────────────────────── */
export default function AdminClasses() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  const [classesVisible,   setClassesVisible]   = useState(true);
  const [levels,           setLevels]           = useState([]);
  const [subjects,         setSubjects]         = useState({});   // { levelId: [...] }
  const [chapters,         setChapters]         = useState({});   // { subjectId: [...] }
  const [expandedLevels,   setExpandedLevels]   = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const [levelModal,   setLevelModal]   = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [chapterModal, setChapterModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── Nav ── */
  const navItems = [
    { to: '/admin',              label: 'Dashboard',       icon: <BarChart3     className="w-4 h-4" /> },
    { to: '/admin/subjects',     label: 'Subjects',        icon: <BookOpen      className="w-4 h-4" /> },
    { to: '/admin/mcqs',         label: 'MCQ Manager',     icon: <Brain         className="w-4 h-4" /> },
    { to: '/admin/exams',        label: 'Exam Manager',    icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes',      label: 'Classes',         icon: <Layers        className="w-4 h-4" /> },
    { to: '/admin/flashcards', label: 'Flash Cards', icon: <Zap className="w-4 h-4" /> },
    { to: '/admin/notifications',label: 'Notifications',   icon: <Bell          className="w-4 h-4" /> },
    { to: '/dashboard',          label: 'Student View',    icon: <Home          className="w-4 h-4" /> },
  ];

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        api.get('/classes/settings'),
        api.get('/classes/levels'),
      ]);
      setClassesVisible(sRes.data.classes_visible);
      setLevels(lRes.data);
    } catch { toast.error('Failed to load data'); }
    finally   { setLoading(false); }
  }, []);

  const fetchSubjects = useCallback(async (levelId) => {
    try {
      const r = await api.get(`/classes/levels/${levelId}/subjects`);
      setSubjects(prev => ({ ...prev, [levelId]: r.data }));
    } catch { toast.error('Failed to load subjects'); }
  }, []);

  const fetchChapters = useCallback(async (subjectId) => {
    try {
      const r = await api.get(`/classes/subjects/${subjectId}/chapters`);
      setChapters(prev => ({ ...prev, [subjectId]: r.data }));
    } catch { toast.error('Failed to load chapters'); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Expand toggles ── */
  const toggleLevel = async (levelId) => {
    const opening = !expandedLevels[levelId];
    setExpandedLevels(prev => ({ ...prev, [levelId]: opening }));
    if (opening && subjects[levelId] === undefined) await fetchSubjects(levelId);
  };

  const toggleSubject = async (subjectId) => {
    const opening = !expandedSubjects[subjectId];
    setExpandedSubjects(prev => ({ ...prev, [subjectId]: opening }));
    if (opening && chapters[subjectId] === undefined) await fetchChapters(subjectId);
  };

  /* ── Visibility toggle ── */
  const toggleVisibility = async () => {
    try {
      const next = !classesVisible;
      await api.put('/classes/settings', { classes_visible: next });
      setClassesVisible(next);
      toast.success(next ? 'Classes visible to students' : 'Classes hidden from students');
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ── Save level ── */
  const saveLevel = async () => {
    const { id, form } = levelModal;
    if (!form.name.trim()) { toast.error('Level name is required'); return; }
    setSaving(true);
    try {
      if (id) {
        await api.put(`/classes/levels/${id}`, form);
        toast.success('Level updated');
      } else {
        await api.post('/classes/levels', form);
        toast.success('Level created');
      }
      setLevelModal(null);
      await fetchAll();
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Save subject ── */
  const saveSubject = async () => {
    const { id, levelId, form } = subjectModal;
    if (!form.name.trim()) { toast.error('Subject name is required'); return; }
    setSaving(true);
    try {
      if (id) {
        await api.put(`/classes/subjects/${id}`, form);
        toast.success('Subject updated');
      } else {
        await api.post('/classes/subjects', { ...form, level_id: levelId });
        toast.success('Subject created');
      }
      setSubjectModal(null);
      // Re-open the level so subjects are refreshed
      setSubjects(prev => ({ ...prev, [levelId]: undefined }));
      await fetchSubjects(levelId);
      setExpandedLevels(prev => ({ ...prev, [levelId]: true }));
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Save chapter ── */
  const saveChapter = async () => {
    const { id, subjectId, form } = chapterModal;
    if (!form.title.trim()) { toast.error('Chapter title is required'); return; }
    setSaving(true);
    try {
      if (id) {
        await api.put(`/classes/chapters/${id}`, form);
        toast.success('Chapter updated');
      } else {
        await api.post('/classes/chapters', { ...form, subject_id: subjectId });
        toast.success('Chapter created');
      }
      setChapterModal(null);
      setChapters(prev => ({ ...prev, [subjectId]: undefined }));
      await fetchChapters(subjectId);
      setExpandedSubjects(prev => ({ ...prev, [subjectId]: true }));
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Delete ── */
  const runDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, parentId } = deleteTarget;
    setDeleteTarget(null);
    try {
      if (type === 'level')   { await api.delete(`/classes/levels/${id}`);   await fetchAll(); }
      if (type === 'subject') { await api.delete(`/classes/subjects/${id}`); await fetchSubjects(parentId); }
      if (type === 'chapter') { await api.delete(`/classes/chapters/${id}`); await fetchChapters(parentId); }
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  /* ── Sidebar JSX ── */
  const SidebarContent = ({ onClose }) => (
    <div className="sidebar flex flex-col h-full p-5">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold text-sm leading-tight">CA Mock</div>
          <div className="text-[9px] text-yellow-400 font-semibold tracking-widest uppercase">Admin Panel</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-5 border border-purple-500/20 bg-purple-500/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-black" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Administrator</p>
          <p className="text-white/30 text-[10px]">Full access</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1">Navigation</p>
        {navItems.map(item => (
          <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout}
        className="sidebar-item mt-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08]">
        <LogOut className="w-4 h-4" /><span>Logout</span>
      </button>
    </div>
  );

  /* ════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen" style={{ background: '#020818', paddingTop: '68px' }}>

      {/* ── Desktop sidebar (sticky, starts below navbar) ── */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 lg:hidden" style={{ zIndex: 8000 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72">
              <div className="h-full overflow-y-auto pt-[68px]">
                <SidebarContent onClose={() => setSidebarOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.07] bg-[#020818]/80 backdrop-blur-sm sticky top-[68px] z-10">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-white/[0.06] rounded-lg flex-shrink-0">
            <Menu className="w-5 h-5 text-white/60" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2.5 mr-auto min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg leading-tight truncate">Classes Management</h1>
              <p className="text-white/30 text-[11px] hidden sm:block">Manage levels, subjects, and video chapters</p>
            </div>
          </div>

          {/* Visibility toggle */}
          <button onClick={toggleVisibility}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all flex-shrink-0
              ${classesVisible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'}`}>
            {classesVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{classesVisible ? 'Visible' : 'Hidden'}</span>
          </button>

          {/* Add Level */}
          <button onClick={() => setLevelModal({ id: null, form: emptyLevel() })}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add Level</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>

          ) : levels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-white/60 text-lg font-semibold">No levels yet</p>
              <p className="text-white/25 text-sm mt-1 mb-5">Create Certificate, Professional, and Advanced levels</p>
              <button onClick={() => setLevelModal({ id: null, form: emptyLevel() })}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Level
              </button>
            </div>

          ) : levels.map((level, li) => (
            <motion.div key={level.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: li * 0.04 }}
              className="rounded-2xl border border-white/[0.08] bg-[#080f2e]/80 overflow-visible">

              {/* ── Level row ── */}
              <div className="flex items-center gap-2 p-3 sm:p-4">
                {/* Expand button */}
                <button onClick={() => toggleLevel(level.id)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0 group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center text-xl flex-shrink-0">
                    {level.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm sm:text-base">{level.name}</span>
                      {!level.is_visible && (
                        <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                    </div>
                    {level.description && <p className="text-white/35 text-xs truncate">{level.description}</p>}
                    <p className="text-white/20 text-[10px] mt-0.5">
                      {subjects[level.id] !== undefined ? `${subjects[level.id].length} subjects` : 'Click to expand'}
                    </p>
                  </div>
                  <span className="text-white/30 flex-shrink-0">
                    {expandedLevels[level.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Level actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setSubjectModal({ id: null, levelId: level.id, form: emptySubject() })}
                    title="Add Subject"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Subject</span>
                  </button>
                  <button
                    onClick={() => setLevelModal({ id: level.id, form: { name: level.name, description: level.description || '', icon: level.icon, order_index: level.order_index, is_visible: level.is_visible } })}
                    title="Edit Level"
                    className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white/80 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'level', id: level.id, name: level.name })}
                    title="Delete Level"
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Subjects ── */}
              <AnimatePresence>
                {expandedLevels[level.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div className="border-t border-white/[0.06] px-3 sm:px-5 pb-4 pt-3 space-y-2">

                      {subjects[level.id] === undefined ? (
                        <div className="flex items-center justify-center py-5">
                          <Loader2 className="w-5 h-5 text-purple-400/50 animate-spin" />
                        </div>

                      ) : subjects[level.id].length === 0 ? (
                        <div className="text-center py-5">
                          <p className="text-white/30 text-sm">No subjects yet in this level</p>
                          <button
                            onClick={() => setSubjectModal({ id: null, levelId: level.id, form: emptySubject() })}
                            className="mt-2 text-purple-400 text-xs hover:text-purple-300 transition-colors underline underline-offset-2">
                            + Add first subject
                          </button>
                        </div>

                      ) : subjects[level.id].map(subj => (
                        <div key={subj.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02]">

                          {/* ── Subject row ── */}
                          <div className="flex items-center gap-2 p-3">
                            <button onClick={() => toggleSubject(subj.id)}
                              className="flex items-center gap-2.5 flex-1 text-left min-w-0">
                              <span className="text-lg flex-shrink-0">{subj.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-white/85 font-semibold text-sm">{subj.name}</span>
                                  {!subj.is_visible && (
                                    <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/15">Hidden</span>
                                  )}
                                </div>
                                <p className="text-white/20 text-[10px]">
                                  {chapters[subj.id] !== undefined ? `${chapters[subj.id].length} chapters` : 'Click to expand'}
                                </p>
                              </div>
                              <span className="text-white/25 flex-shrink-0">
                                {expandedSubjects[subj.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </span>
                            </button>

                            {/* Subject actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setChapterModal({ id: null, subjectId: subj.id, levelId: level.id, form: emptyChapter() })}
                                title="Add Chapter"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400/80 hover:bg-purple-500/20 hover:text-purple-400 text-[11px] font-semibold transition-colors">
                                <Plus className="w-3 h-3" /><span className="hidden sm:inline">Chapter</span>
                              </button>
                              <button
                                onClick={() => setSubjectModal({ id: subj.id, levelId: level.id, form: { name: subj.name, description: subj.description || '', icon: subj.icon, order_index: subj.order_index, is_visible: subj.is_visible } })}
                                title="Edit Subject"
                                className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/30 hover:text-white/70 transition-colors">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'subject', id: subj.id, parentId: level.id, name: subj.name })}
                                title="Delete Subject"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* ── Chapters ── */}
                          <AnimatePresence>
                            {expandedSubjects[subj.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div className="border-t border-white/[0.05] px-3 sm:px-4 pt-2 pb-3 space-y-1.5">

                                  {chapters[subj.id] === undefined ? (
                                    <div className="flex items-center justify-center py-4">
                                      <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                                    </div>

                                  ) : chapters[subj.id].length === 0 ? (
                                    <div className="text-center py-4">
                                      <p className="text-white/25 text-xs">No chapters yet</p>
                                      <button
                                        onClick={() => setChapterModal({ id: null, subjectId: subj.id, levelId: level.id, form: emptyChapter() })}
                                        className="mt-1.5 text-purple-400/60 text-xs hover:text-purple-400 transition-colors underline underline-offset-2">
                                        + Add first chapter
                                      </button>
                                    </div>

                                  ) : chapters[subj.id].map(ch => (
                                    <div key={ch.id}
                                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] group hover:border-white/[0.08] transition-colors">
                                      <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <Youtube className="w-3 h-3 text-red-400/60" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-white/75 text-xs font-medium truncate">{ch.title}</span>
                                          {!ch.is_visible && (
                                            <span className="text-[9px] bg-red-500/10 text-red-400/70 px-1.5 py-0.5 rounded-full border border-red-500/10 flex-shrink-0">Hidden</span>
                                          )}
                                        </div>
                                        {ch.youtube_url
                                          ? <p className="text-white/25 text-[10px] truncate">{ch.youtube_url}</p>
                                          : <p className="text-yellow-500/40 text-[10px]">No YouTube URL</p>}
                                      </div>
                                      {/* Always visible on mobile, hover on desktop */}
                                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setChapterModal({ id: ch.id, subjectId: subj.id, levelId: level.id, form: { title: ch.title, description: ch.description || '', youtube_url: ch.youtube_url || '', order_index: ch.order_index, is_visible: ch.is_visible } })}
                                          className="p-1 rounded hover:bg-white/[0.07] text-white/30 hover:text-white/70 transition-colors">
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => setDeleteTarget({ type: 'chapter', id: ch.id, parentId: subj.id, name: ch.title })}
                                          className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ════ MODALS ════ */}

      {/* Level Modal */}
      <AnimatePresence>
        {levelModal && (
          <Modal onClose={() => setLevelModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{levelModal.id ? 'Edit Level' : 'Add Level'}</h2>
              <button onClick={() => setLevelModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  Level Name <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  value={levelModal.form.name}
                  onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                  onKeyDown={e => e.key === 'Enter' && saveLevel()}
                  placeholder="e.g. Certificate"
                  className="input-field w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={levelModal.form.description}
                  onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                  placeholder="Optional description"
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Icon</label>
                <IconPicker icons={LEVEL_ICONS} value={levelModal.form.icon}
                  onChange={ic => setLevelModal(p => ({ ...p, form: { ...p.form, icon: ic } }))} />
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-3">
                <Toggle value={levelModal.form.is_visible}
                  onChange={() => setLevelModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))} />
                <span className="text-white/55 text-sm">Visible to students</span>
              </div>

              {/* Order */}
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={levelModal.form.order_index}
                  onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setLevelModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={saveLevel} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {levelModal.id ? 'Update Level' : 'Create Level'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Subject Modal */}
      <AnimatePresence>
        {subjectModal && (
          <Modal onClose={() => setSubjectModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{subjectModal.id ? 'Edit Subject' : 'Add Subject'}</h2>
              <button onClick={() => setSubjectModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  Subject Name <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  value={subjectModal.form.name}
                  onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                  onKeyDown={e => e.key === 'Enter' && saveSubject()}
                  placeholder="e.g. Accounting"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={subjectModal.form.description}
                  onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                  placeholder="Optional description"
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Icon</label>
                <IconPicker icons={SUBJECT_ICONS} value={subjectModal.form.icon}
                  onChange={ic => setSubjectModal(p => ({ ...p, form: { ...p.form, icon: ic } }))} />
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={subjectModal.form.is_visible}
                  onChange={() => setSubjectModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))} />
                <span className="text-white/55 text-sm">Visible to students</span>
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={subjectModal.form.order_index}
                  onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSubjectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={saveSubject} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {subjectModal.id ? 'Update Subject' : 'Create Subject'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Chapter Modal */}
      <AnimatePresence>
        {chapterModal && (
          <Modal onClose={() => setChapterModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{chapterModal.id ? 'Edit Chapter' : 'Add Chapter'}</h2>
              <button onClick={() => setChapterModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  Chapter Title <span className="text-red-400">*</span>
                </label>
                <input
                  autoFocus
                  value={chapterModal.form.title}
                  onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, title: e.target.value } }))}
                  placeholder="e.g. Introduction to Accounting"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={chapterModal.form.description}
                  onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                  placeholder="Optional description"
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-400" /> YouTube URL
                </label>
                <input
                  value={chapterModal.form.youtube_url}
                  onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, youtube_url: e.target.value } }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-field w-full"
                />
                <p className="text-white/20 text-[10px] mt-1.5">
                  Supports youtube.com/watch?v= and youtu.be/ formats
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={chapterModal.form.is_visible}
                  onChange={() => setChapterModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))} />
                <span className="text-white/55 text-sm">Visible to students</span>
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={chapterModal.form.order_index}
                  onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setChapterModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={saveChapter} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {chapterModal.id ? 'Update Chapter' : 'Create Chapter'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Delete {deleteTarget.type}?</h2>
              <p className="text-white/45 text-sm mb-1">
                "<span className="text-white font-medium">{deleteTarget.name}</span>"
              </p>
              <p className="text-white/30 text-xs mb-6">
                {deleteTarget.type === 'level'   && 'All subjects and chapters inside will also be permanently deleted.'}
                {deleteTarget.type === 'subject'  && 'All chapters inside will also be permanently deleted.'}
                {deleteTarget.type === 'chapter'  && 'This chapter will be permanently deleted.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={runDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
