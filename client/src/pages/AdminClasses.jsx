import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Layers, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp,
  BarChart3, Bell, BookOpen, Home, LogOut, Menu, Shield,
  Brain, GraduationCap, Eye, EyeOff, Youtube, Save,
  ChevronRight, Loader2
} from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

const LEVEL_ICONS = ['🎓', '📜', '💼', '🏆', '⭐', '🌟', '🔥', '💡', '🎯', '📚'];
const SUBJECT_ICONS = ['📚', '🧮', '🔬', '🌍', '📖', '✏️', '🎨', '💻', '⚗️', '📐', '📊', '💡', '⚖️', '🏛️'];

function emptyLevel() { return { name: '', description: '', icon: '🎓', order_index: 0 }; }
function emptySubject() { return { name: '', description: '', icon: '📚', order_index: 0 }; }
function emptyChapter() { return { title: '', description: '', youtube_url: '', order_index: 0 }; }

export default function AdminClasses() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [classesVisible, setClassesVisible] = useState(true);
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [chapters, setChapters] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const [levelModal, setLevelModal] = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [chapterModal, setChapterModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/subjects', label: 'Subjects & Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/mcqs', label: 'MCQ Manager', icon: <Brain className="w-4 h-4" /> },
    { to: '/admin/exams', label: 'Exam Manager', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes', label: 'Classes', icon: <Layers className="w-4 h-4" /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Student View', icon: <Home className="w-4 h-4" /> },
  ];

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, levelsRes] = await Promise.all([
        api.get('/classes/settings'),
        api.get('/classes/levels'),
      ]);
      setClassesVisible(settingsRes.data.classes_visible);
      setLevels(levelsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (levelId) => {
    try {
      const r = await api.get(`/classes/levels/${levelId}/subjects`);
      setSubjects(prev => ({ ...prev, [levelId]: r.data }));
    } catch { toast.error('Failed to load subjects'); }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const r = await api.get(`/classes/subjects/${subjectId}/chapters`);
      setChapters(prev => ({ ...prev, [subjectId]: r.data }));
    } catch { toast.error('Failed to load chapters'); }
  };

  const toggleLevel = async (levelId) => {
    const isOpen = expandedLevels[levelId];
    setExpandedLevels(prev => ({ ...prev, [levelId]: !isOpen }));
    if (!isOpen && !subjects[levelId]) await fetchSubjects(levelId);
  };

  const toggleSubject = async (subjectId) => {
    const isOpen = expandedSubjects[subjectId];
    setExpandedSubjects(prev => ({ ...prev, [subjectId]: !isOpen }));
    if (!isOpen && !chapters[subjectId]) await fetchChapters(subjectId);
  };

  const toggleVisibility = async () => {
    try {
      const newVal = !classesVisible;
      await api.put('/classes/settings', { classes_visible: newVal });
      setClassesVisible(newVal);
      toast.success(newVal ? 'Classes section is now visible to students' : 'Classes section is now hidden from students');
    } catch { toast.error('Failed to update visibility'); }
  };

  const saveLevel = async () => {
    if (!levelModal.form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (levelModal.id) {
        await api.put(`/classes/levels/${levelModal.id}`, levelModal.form);
        toast.success('Level updated');
      } else {
        await api.post('/classes/levels', levelModal.form);
        toast.success('Level created');
      }
      setLevelModal(null);
      await fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const saveSubject = async () => {
    if (!subjectModal.form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (subjectModal.id) {
        await api.put(`/classes/subjects/${subjectModal.id}`, subjectModal.form);
        toast.success('Subject updated');
      } else {
        await api.post('/classes/subjects', { ...subjectModal.form, level_id: subjectModal.levelId });
        toast.success('Subject created');
      }
      setSubjectModal(null);
      await fetchSubjects(subjectModal.levelId);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const saveChapter = async () => {
    if (!chapterModal.form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (chapterModal.id) {
        await api.put(`/classes/chapters/${chapterModal.id}`, chapterModal.form);
        toast.success('Chapter updated');
      } else {
        await api.post('/classes/chapters', { ...chapterModal.form, subject_id: chapterModal.subjectId });
        toast.success('Chapter created');
      }
      setChapterModal(null);
      await fetchChapters(chapterModal.subjectId);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { type, id, parentId } = deleteConfirm;
      if (type === 'level') { await api.delete(`/classes/levels/${id}`); await fetchAll(); }
      else if (type === 'subject') { await api.delete(`/classes/subjects/${id}`); await fetchSubjects(parentId); }
      else if (type === 'chapter') { await api.delete(`/classes/chapters/${id}`); await fetchChapters(parentId); }
      toast.success('Deleted successfully');
    } catch { toast.error('Delete failed'); }
    finally { setDeleteConfirm(null); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

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
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg">
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
        <LogOut className="w-4 h-4" /><span>Logout</span>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: '#020818' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex"><Sidebar /></div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-72 z-10">
              <Sidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/[0.06] rounded-lg">
            <Menu className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Classes Management</h1>
              <p className="text-white/30 text-xs">Manage levels, subjects, and video chapters</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggleVisibility}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${classesVisible ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25'}`}>
              {classesVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {classesVisible ? 'Visible to Students' : 'Hidden from Students'}
            </button>
            <button onClick={() => setLevelModal({ id: null, form: emptyLevel() })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add Level
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : levels.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-white/50 text-lg font-medium">No levels yet</p>
              <p className="text-white/25 text-sm mt-1">Create your first level to get started</p>
              <button onClick={() => setLevelModal({ id: null, form: emptyLevel() })}
                className="mt-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
                Add Level
              </button>
            </div>
          ) : levels.map((level, li) => (
            <motion.div key={level.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: li * 0.05 }} className="card-premium overflow-hidden">
              {/* Level header */}
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => toggleLevel(level.id)}
                  className="flex items-center gap-3 flex-1 text-left group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl flex-shrink-0">
                    {level.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-base">{level.name}</span>
                      {!level.is_visible && (
                        <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                    </div>
                    {level.description && <p className="text-white/35 text-xs truncate">{level.description}</p>}
                    <p className="text-white/20 text-[10px] mt-0.5">
                      {subjects[level.id]?.length ?? '?'} subjects
                    </p>
                  </div>
                  {expandedLevels[level.id] ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSubjectModal({ id: null, levelId: level.id, form: emptySubject() })}
                    className="p-2 hover:bg-purple-500/15 text-purple-400 rounded-lg transition-colors text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Subject</span>
                  </button>
                  <button onClick={() => setLevelModal({ id: level.id, form: { name: level.name, description: level.description || '', icon: level.icon, order_index: level.order_index, is_visible: level.is_visible } })}
                    className="p-2 hover:bg-white/[0.06] text-white/40 hover:text-white/70 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'level', id: level.id, name: level.name })}
                    className="p-2 hover:bg-red-500/10 text-white/30 hover:text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subjects */}
              <AnimatePresence>
                {expandedLevels[level.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.05]">
                    <div className="px-4 pb-4 pt-3 space-y-2 ml-4">
                      {!subjects[level.id] ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        </div>
                      ) : subjects[level.id].length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-white/30 text-sm">No subjects yet</p>
                          <button onClick={() => setSubjectModal({ id: null, levelId: level.id, form: emptySubject() })}
                            className="mt-2 text-purple-400 text-xs hover:text-purple-300 transition-colors">
                            + Add first subject
                          </button>
                        </div>
                      ) : subjects[level.id].map((subj, si) => (
                        <div key={subj.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                          {/* Subject header */}
                          <div className="flex items-center gap-3 p-3">
                            <button onClick={() => toggleSubject(subj.id)}
                              className="flex items-center gap-2.5 flex-1 text-left">
                              <span className="text-base">{subj.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/85 font-semibold text-sm">{subj.name}</span>
                                  {!subj.is_visible && (
                                    <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">Hidden</span>
                                  )}
                                </div>
                                {subj.description && <p className="text-white/30 text-xs truncate">{subj.description}</p>}
                                <p className="text-white/20 text-[10px]">
                                  {chapters[subj.id]?.length ?? '?'} chapters
                                </p>
                              </div>
                              {expandedSubjects[subj.id] ? <ChevronUp className="w-3.5 h-3.5 text-white/25" /> : <ChevronDown className="w-3.5 h-3.5 text-white/25" />}
                            </button>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setChapterModal({ id: null, subjectId: subj.id, levelId: level.id, form: emptyChapter() })}
                                className="p-1.5 hover:bg-purple-500/15 text-purple-400/70 hover:text-purple-400 rounded-lg transition-colors text-xs flex items-center gap-1">
                                <Plus className="w-3 h-3" /><span className="hidden sm:inline text-[11px]">Chapter</span>
                              </button>
                              <button onClick={() => setSubjectModal({ id: subj.id, levelId: level.id, form: { name: subj.name, description: subj.description || '', icon: subj.icon, order_index: subj.order_index, is_visible: subj.is_visible } })}
                                className="p-1.5 hover:bg-white/[0.06] text-white/30 hover:text-white/60 rounded-lg transition-colors">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={() => setDeleteConfirm({ type: 'subject', id: subj.id, parentId: level.id, name: subj.name })}
                                className="p-1.5 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Chapters */}
                          <AnimatePresence>
                            {expandedSubjects[subj.id] && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.04]">
                                <div className="px-3 pb-3 pt-2 space-y-1.5 ml-3">
                                  {!chapters[subj.id] ? (
                                    <div className="flex items-center justify-center py-3">
                                      <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
                                    </div>
                                  ) : chapters[subj.id].length === 0 ? (
                                    <div className="text-center py-3">
                                      <p className="text-white/25 text-xs">No chapters yet</p>
                                      <button onClick={() => setChapterModal({ id: null, subjectId: subj.id, levelId: level.id, form: emptyChapter() })}
                                        className="mt-1 text-purple-400/60 text-xs hover:text-purple-400 transition-colors">
                                        + Add first chapter
                                      </button>
                                    </div>
                                  ) : chapters[subj.id].map((ch, ci) => (
                                    <div key={ch.id}
                                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] group">
                                      <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <Youtube className="w-3 h-3 text-red-400/70" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-white/75 text-xs font-medium truncate">{ch.title}</span>
                                          {!ch.is_visible && (
                                            <span className="text-[9px] bg-red-500/10 text-red-400/70 px-1.5 py-0.5 rounded-full flex-shrink-0">Hidden</span>
                                          )}
                                        </div>
                                        {ch.youtube_url ? (
                                          <p className="text-white/25 text-[10px] truncate">{ch.youtube_url}</p>
                                        ) : (
                                          <p className="text-yellow-500/50 text-[10px]">No YouTube URL set</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setChapterModal({ id: ch.id, subjectId: subj.id, levelId: level.id, form: { title: ch.title, description: ch.description || '', youtube_url: ch.youtube_url || '', order_index: ch.order_index, is_visible: ch.is_visible } })}
                                          className="p-1 hover:bg-white/[0.06] text-white/30 hover:text-white/60 rounded transition-colors">
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => setDeleteConfirm({ type: 'chapter', id: ch.id, parentId: subj.id, name: ch.title })}
                                          className="p-1 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded transition-colors">
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

      {/* Level Modal */}
      <AnimatePresence>
        {levelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setLevelModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md card-premium p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">{levelModal.id ? 'Edit Level' : 'Add Level'}</h2>
                <button onClick={() => setLevelModal(null)} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Name *</label>
                  <input value={levelModal.form.name} onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                    placeholder="e.g. Certificate" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Description</label>
                  <textarea value={levelModal.form.description} onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                    placeholder="Optional description" className="input-field w-full resize-none" rows={2} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {LEVEL_ICONS.map(ic => (
                      <button key={ic} onClick={() => setLevelModal(p => ({ ...p, form: { ...p.form, icon: ic } }))}
                        className={`w-9 h-9 text-xl rounded-lg transition-all ${levelModal.form.icon === ic ? 'bg-purple-500/30 ring-1 ring-purple-400/50 scale-110' : 'bg-white/[0.04] hover:bg-white/[0.08]'}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                {levelModal.id && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setLevelModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))}
                      className={`w-10 h-6 rounded-full transition-colors relative ${levelModal.form.is_visible ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${levelModal.form.is_visible ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-white/60 text-sm">Visible to students</span>
                  </label>
                )}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Order</label>
                  <input type="number" value={levelModal.form.order_index} onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                    className="input-field w-full" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setLevelModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
                <button onClick={saveLevel} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {levelModal.id ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Modal */}
      <AnimatePresence>
        {subjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSubjectModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md card-premium p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">{subjectModal.id ? 'Edit Subject' : 'Add Subject'}</h2>
                <button onClick={() => setSubjectModal(null)} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Name *</label>
                  <input value={subjectModal.form.name} onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                    placeholder="e.g. Accounting" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Description</label>
                  <textarea value={subjectModal.form.description} onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                    placeholder="Optional description" className="input-field w-full resize-none" rows={2} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_ICONS.map(ic => (
                      <button key={ic} onClick={() => setSubjectModal(p => ({ ...p, form: { ...p.form, icon: ic } }))}
                        className={`w-9 h-9 text-xl rounded-lg transition-all ${subjectModal.form.icon === ic ? 'bg-purple-500/30 ring-1 ring-purple-400/50 scale-110' : 'bg-white/[0.04] hover:bg-white/[0.08]'}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                {subjectModal.id && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setSubjectModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))}
                      className={`w-10 h-6 rounded-full transition-colors relative ${subjectModal.form.is_visible ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${subjectModal.form.is_visible ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-white/60 text-sm">Visible to students</span>
                  </label>
                )}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Order</label>
                  <input type="number" value={subjectModal.form.order_index} onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                    className="input-field w-full" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setSubjectModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
                <button onClick={saveSubject} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {subjectModal.id ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Modal */}
      <AnimatePresence>
        {chapterModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setChapterModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md card-premium p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">{chapterModal.id ? 'Edit Chapter' : 'Add Chapter'}</h2>
                <button onClick={() => setChapterModal(null)} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Title *</label>
                  <input value={chapterModal.form.title} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, title: e.target.value } }))}
                    placeholder="e.g. Introduction to Accounting" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Description</label>
                  <textarea value={chapterModal.form.description} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                    placeholder="Optional description" className="input-field w-full resize-none" rows={2} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-white/50 text-xs font-medium uppercase tracking-wide mb-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />YouTube URL
                  </label>
                  <input value={chapterModal.form.youtube_url} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, youtube_url: e.target.value } }))}
                    placeholder="https://www.youtube.com/watch?v=..." className="input-field w-full" />
                  <p className="text-white/20 text-[10px] mt-1">Paste a YouTube video link. Supports youtube.com/watch?v= and youtu.be/ formats.</p>
                </div>
                {chapterModal.id && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setChapterModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))}
                      className={`w-10 h-6 rounded-full transition-colors relative ${chapterModal.form.is_visible ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${chapterModal.form.is_visible ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-white/60 text-sm">Visible to students</span>
                  </label>
                )}
                <div>
                  <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1.5">Order</label>
                  <input type="number" value={chapterModal.form.order_index} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                    className="input-field w-full" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setChapterModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
                <button onClick={saveChapter} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {chapterModal.id ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm card-premium p-6 z-10">
              <h2 className="text-white font-bold text-lg mb-2">Confirm Delete</h2>
              <p className="text-white/50 text-sm mb-6">
                Are you sure you want to delete <span className="text-white font-semibold">"{deleteConfirm.name}"</span>?
                {deleteConfirm.type === 'level' && ' All subjects and chapters inside will also be deleted.'}
                {deleteConfirm.type === 'subject' && ' All chapters inside will also be deleted.'}
                {' This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
