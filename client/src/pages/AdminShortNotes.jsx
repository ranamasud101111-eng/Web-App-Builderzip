import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FileText, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp,
  BarChart3, Bell, BookOpen, Home, LogOut, Menu, Shield,
  Brain, GraduationCap, Eye, EyeOff, Save, Loader2,
  Zap, Layers, Upload, Download, File, CheckCircle,
  AlertCircle, RefreshCw, Package,
} from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

const LEVEL_ICONS   = ['📝','📜','💼','🏆','⭐','🌟','🔥','💡','🎯','📚'];
const SUBJECT_ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','💻','⚗️','📐','📊','💡','⚖️','🏛️'];

const emptyLevel   = () => ({ name: '', description: '', icon: '📝', order_index: 0, is_visible: true });
const emptySubject = () => ({ name: '', description: '', icon: '📚', order_index: 0, is_visible: true });
const emptyChapter = () => ({ title: '', description: '', order_index: 0, is_visible: true });

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-white/10'}`}>
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-5' : 'left-1'}`} />
  </button>
);

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

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AdminShortNotes() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);

  const [notesVisible,     setNotesVisible]     = useState(true);
  const [levels,           setLevels]           = useState([]);
  const [subjects,         setSubjects]         = useState({});
  const [chapters,         setChapters]         = useState({});
  const [expandedLevels,   setExpandedLevels]   = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const [levelModal,   setLevelModal]   = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [chapterModal, setChapterModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [uploadingChapter, setUploadingChapter] = useState(null);
  const [bulkModal,        setBulkModal]        = useState(null);
  const [bulkFiles,        setBulkFiles]        = useState([]);
  const [bulkUploading,    setBulkUploading]    = useState(false);
  const [bulkResults,      setBulkResults]      = useState(null);

  const singleUploadRef = useRef({});
  const bulkInputRef    = useRef(null);

  /* ── Nav ── */
  const navItems = [
    { to: '/admin',              label: 'Dashboard',       icon: <BarChart3     className="w-4 h-4" /> },
    { to: '/admin/subjects',     label: 'Subjects',        icon: <BookOpen      className="w-4 h-4" /> },
    { to: '/admin/mcqs',         label: 'MCQ Manager',     icon: <Brain         className="w-4 h-4" /> },
    { to: '/admin/exams',        label: 'Exam Manager',    icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes',      label: 'Classes',         icon: <Layers        className="w-4 h-4" /> },
    { to: '/admin/flashcards',   label: 'Flash Cards',     icon: <Zap           className="w-4 h-4" /> },
    { to: '/admin/shortnotes',   label: 'Short Notes',     icon: <FileText      className="w-4 h-4" /> },
    { to: '/admin/notifications',label: 'Notifications',   icon: <Bell          className="w-4 h-4" /> },
    { to: '/dashboard',          label: 'Student View',    icon: <Home          className="w-4 h-4" /> },
  ];

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        api.get('/shortnotes/settings'),
        api.get('/shortnotes/levels'),
      ]);
      setNotesVisible(sRes.data.shortnotes_visible);
      setLevels(lRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  const fetchSubjects = useCallback(async (levelId) => {
    try {
      const r = await api.get(`/shortnotes/levels/${levelId}/subjects`);
      setSubjects(prev => ({ ...prev, [levelId]: r.data }));
    } catch { toast.error('Failed to load subjects'); }
  }, []);

  const fetchChapters = useCallback(async (subjectId) => {
    try {
      const r = await api.get(`/shortnotes/subjects/${subjectId}/chapters`);
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
      const next = !notesVisible;
      await api.put('/shortnotes/settings', { shortnotes_visible: next });
      setNotesVisible(next);
      toast.success(next ? 'Short Notes visible to students' : 'Short Notes hidden from students');
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ── Save level ── */
  const saveLevel = async () => {
    const { id, form } = levelModal;
    if (!form.name.trim()) { toast.error('Level name is required'); return; }
    setSaving(true);
    try {
      if (id) { await api.put(`/shortnotes/levels/${id}`, form); toast.success('Level updated'); }
      else     { await api.post('/shortnotes/levels', form);      toast.success('Level created'); }
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
      if (id) { await api.put(`/shortnotes/subjects/${id}`, form);                    toast.success('Subject updated'); }
      else     { await api.post('/shortnotes/subjects', { ...form, level_id: levelId }); toast.success('Subject created'); }
      setSubjectModal(null);
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
      if (id) { await api.put(`/shortnotes/chapters/${id}`, form);                         toast.success('Chapter updated'); }
      else     { await api.post('/shortnotes/chapters', { ...form, subject_id: subjectId }); toast.success('Chapter created'); }
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
      if (type === 'level')   { await api.delete(`/shortnotes/levels/${id}`);   await fetchAll(); }
      if (type === 'subject') { await api.delete(`/shortnotes/subjects/${id}`); await fetchSubjects(parentId); }
      if (type === 'chapter') { await api.delete(`/shortnotes/chapters/${id}`); await fetchChapters(parentId); }
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  /* ── Single PDF upload ── */
  const handleSingleUpload = async (chapterId, subjectId, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }
    setUploadingChapter(chapterId);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      await api.post(`/shortnotes/chapters/${chapterId}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('PDF uploaded');
      setChapters(prev => ({ ...prev, [subjectId]: undefined }));
      await fetchChapters(subjectId);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingChapter(null);
    }
  };

  /* ── Delete PDF ── */
  const handleDeleteFile = async (chapterId, subjectId) => {
    try {
      await api.delete(`/shortnotes/chapters/${chapterId}/file`);
      toast.success('PDF removed');
      setChapters(prev => ({ ...prev, [subjectId]: undefined }));
      await fetchChapters(subjectId);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to remove PDF');
    }
  };

  /* ── Bulk upload ── */
  const handleBulkUpload = async () => {
    if (!bulkFiles.length || !bulkModal) return;
    setBulkUploading(true);
    setBulkResults(null);
    try {
      const fd = new FormData();
      bulkFiles.forEach(f => fd.append('pdfs', f));
      const r = await api.post(`/shortnotes/subjects/${bulkModal.subjectId}/bulk-upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkResults(r.data);
      toast.success(`${r.data.success}/${r.data.total} PDFs uploaded`);
      setChapters(prev => ({ ...prev, [bulkModal.subjectId]: undefined }));
      await fetchChapters(bulkModal.subjectId);
      setExpandedSubjects(prev => ({ ...prev, [bulkModal.subjectId]: true }));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  /* ── Sidebar JSX ── */
  const SidebarContent = ({ onClose }) => (
    <div className="sidebar flex flex-col h-full p-5">
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
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-5 border border-purple-500/20 bg-purple-500/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-black" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Administrator</p>
          <p className="text-white/30 text-[10px]">Full access</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1">Navigation</p>
        {navItems.map(item => (
          <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
        ))}
      </nav>
      <button onClick={handleLogout}
        className="sidebar-item mt-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08]">
        <LogOut className="w-4 h-4" /><span>Logout</span>
      </button>
    </div>
  );

  /* ════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen" style={{ background: '#020818', paddingTop: '68px' }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.07] bg-[#020818]/80 backdrop-blur-sm sticky top-[68px] z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/[0.06] rounded-lg flex-shrink-0">
            <Menu className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-2.5 mr-auto min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg leading-tight truncate">Short Notes Management</h1>
              <p className="text-white/30 text-[11px] hidden sm:block">Manage levels, subjects, chapters and PDF notes</p>
            </div>
          </div>
          <button onClick={toggleVisibility}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all flex-shrink-0
              ${notesVisible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'}`}>
            {notesVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{notesVisible ? 'Visible' : 'Hidden'}</span>
          </button>
          <button onClick={() => setLevelModal({ id: null, form: emptyLevel() })}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" /><span>Add Level</span>
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
                <FileText className="w-8 h-8 text-purple-400" />
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

              {/* Level row */}
              <div className="flex items-center gap-2 p-3 sm:p-4">
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setSubjectModal({ id: null, levelId: level.id, form: emptySubject() })}
                    title="Add Subject"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Subject</span>
                  </button>
                  <button
                    onClick={() => setLevelModal({ id: level.id, form: { name: level.name, description: level.description || '', icon: level.icon, order_index: level.order_index, is_visible: level.is_visible } })}
                    className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white/80 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'level', id: level.id, name: level.name })}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subjects */}
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
                          <p className="text-white/30 text-sm">No subjects in this level</p>
                          <button onClick={() => setSubjectModal({ id: null, levelId: level.id, form: emptySubject() })}
                            className="mt-2 text-purple-400 text-xs hover:text-purple-300 transition-colors underline underline-offset-2">
                            + Add first subject
                          </button>
                        </div>
                      ) : subjects[level.id].map(subj => (
                        <div key={subj.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02]">

                          {/* Subject row */}
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
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => { setBulkModal({ subjectId: subj.id, subjectName: subj.name }); setBulkFiles([]); setBulkResults(null); }}
                                title="Bulk Upload PDFs"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400/80 hover:bg-amber-500/20 hover:text-amber-400 text-[11px] font-semibold transition-colors">
                                <Package className="w-3 h-3" /><span className="hidden sm:inline">Bulk</span>
                              </button>
                              <button
                                onClick={() => setChapterModal({ id: null, subjectId: subj.id, levelId: level.id, form: emptyChapter() })}
                                title="Add Chapter"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400/80 hover:bg-purple-500/20 hover:text-purple-400 text-[11px] font-semibold transition-colors">
                                <Plus className="w-3 h-3" /><span className="hidden sm:inline">Chapter</span>
                              </button>
                              <button
                                onClick={() => setSubjectModal({ id: subj.id, levelId: level.id, form: { name: subj.name, description: subj.description || '', icon: subj.icon, order_index: subj.order_index, is_visible: subj.is_visible } })}
                                className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/30 hover:text-white/70 transition-colors">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'subject', id: subj.id, name: subj.name, parentId: level.id })}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Chapters */}
                          <AnimatePresence>
                            {expandedSubjects[subj.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div className="border-t border-white/[0.05] px-3 sm:px-4 pb-3 pt-2.5 space-y-2">

                                  {chapters[subj.id] === undefined ? (
                                    <div className="flex justify-center py-4">
                                      <Loader2 className="w-4 h-4 text-purple-400/40 animate-spin" />
                                    </div>
                                  ) : chapters[subj.id].length === 0 ? (
                                    <div className="text-center py-4">
                                      <p className="text-white/20 text-xs">No chapters yet</p>
                                      <button onClick={() => setChapterModal({ id: null, subjectId: subj.id, levelId: level.id, form: emptyChapter() })}
                                        className="mt-1.5 text-purple-400/60 text-[11px] hover:text-purple-300 underline underline-offset-2">
                                        + Add chapter
                                      </button>
                                    </div>
                                  ) : chapters[subj.id].map(ch => (
                                    <div key={ch.id} className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
                                      <div className="flex items-start gap-2">
                                        {/* PDF status icon */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${ch.filename ? 'bg-red-500/10 border border-red-500/15' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                                          <FileText className={`w-3.5 h-3.5 ${ch.filename ? 'text-red-400' : 'text-white/20'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-white/80 font-medium text-xs">{ch.title}</span>
                                            {!ch.is_visible && (
                                              <span className="text-[9px] bg-red-500/10 text-red-400/70 px-1.5 py-0.5 rounded-full">Hidden</span>
                                            )}
                                          </div>
                                          {ch.filename ? (
                                            <p className="text-emerald-400/60 text-[10px] mt-0.5">
                                              {ch.original_name || ch.filename} · {formatSize(ch.file_size)}
                                            </p>
                                          ) : (
                                            <p className="text-white/20 text-[10px] mt-0.5">No PDF uploaded</p>
                                          )}
                                        </div>

                                        {/* Chapter actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {/* Upload / Replace PDF */}
                                          <div className="relative">
                                            <input
                                              type="file"
                                              accept=".pdf,application/pdf"
                                              style={{ display: 'none' }}
                                              ref={el => singleUploadRef.current[ch.id] = el}
                                              onChange={e => {
                                                if (e.target.files[0]) {
                                                  handleSingleUpload(ch.id, subj.id, e.target.files[0]);
                                                  e.target.value = '';
                                                }
                                              }}
                                            />
                                            <button
                                              onClick={() => singleUploadRef.current[ch.id]?.click()}
                                              disabled={uploadingChapter === ch.id}
                                              title={ch.filename ? 'Replace PDF' : 'Upload PDF'}
                                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400/80 hover:bg-blue-500/20 hover:text-blue-400 text-[10px] font-medium transition-colors disabled:opacity-50">
                                              {uploadingChapter === ch.id
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : <Upload className="w-3 h-3" />}
                                              <span className="hidden sm:inline">{ch.filename ? 'Replace' : 'Upload'}</span>
                                            </button>
                                          </div>

                                          {/* View PDF */}
                                          {ch.filename && (
                                            <a
                                              href={`/api/shortnotes/file/${ch.filename}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="View PDF"
                                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-[10px] font-medium transition-colors">
                                              <Eye className="w-3 h-3" />
                                              <span className="hidden sm:inline">View</span>
                                            </a>
                                          )}

                                          {/* Delete PDF */}
                                          {ch.filename && (
                                            <button
                                              onClick={() => handleDeleteFile(ch.id, subj.id)}
                                              title="Remove PDF"
                                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                                              <X className="w-3 h-3" />
                                            </button>
                                          )}

                                          {/* Edit chapter */}
                                          <button
                                            onClick={() => setChapterModal({ id: ch.id, subjectId: subj.id, levelId: level.id, form: { title: ch.title, description: ch.description || '', order_index: ch.order_index, is_visible: ch.is_visible } })}
                                            className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/25 hover:text-white/60 transition-colors">
                                            <Edit2 className="w-3 h-3" />
                                          </button>

                                          {/* Delete chapter */}
                                          <button
                                            onClick={() => setDeleteTarget({ type: 'chapter', id: ch.id, name: ch.title, parentId: subj.id })}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
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

      {/* ═══ Modals ═══ */}

      {/* Level modal */}
      <AnimatePresence>
        {levelModal && (
          <Modal onClose={() => setLevelModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{levelModal.id ? 'Edit Level' : 'New Level'}</h2>
              <button onClick={() => setLevelModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Name *</label>
                <input value={levelModal.form.name} onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                  placeholder="e.g. Certificate" className="input-dark w-full" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={levelModal.form.description} onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                  placeholder="Optional description" rows={2} className="input-dark w-full resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Icon</label>
                <IconPicker icons={LEVEL_ICONS} value={levelModal.form.icon} onChange={ic => setLevelModal(p => ({ ...p, form: { ...p.form, icon: ic } }))} />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Order</label>
                <input type="number" value={levelModal.form.order_index} onChange={e => setLevelModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                  className="input-dark w-24" />
              </div>
              {levelModal.id && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Visible to students</span>
                  <Toggle value={levelModal.form.is_visible} onChange={() => setLevelModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))} />
                </div>
              )}
              <button onClick={saveLevel} disabled={saving}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {levelModal.id ? 'Save Changes' : 'Create Level'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Subject modal */}
      <AnimatePresence>
        {subjectModal && (
          <Modal onClose={() => setSubjectModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{subjectModal.id ? 'Edit Subject' : 'New Subject'}</h2>
              <button onClick={() => setSubjectModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Name *</label>
                <input value={subjectModal.form.name} onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))}
                  placeholder="e.g. Financial Accounting" className="input-dark w-full" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={subjectModal.form.description} onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                  rows={2} className="input-dark w-full resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Icon</label>
                <IconPicker icons={SUBJECT_ICONS} value={subjectModal.form.icon} onChange={ic => setSubjectModal(p => ({ ...p, form: { ...p.form, icon: ic } }))} />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Order</label>
                <input type="number" value={subjectModal.form.order_index} onChange={e => setSubjectModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                  className="input-dark w-24" />
              </div>
              {subjectModal.id && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Visible to students</span>
                  <Toggle value={subjectModal.form.is_visible} onChange={() => setSubjectModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))} />
                </div>
              )}
              <button onClick={saveSubject} disabled={saving}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {subjectModal.id ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Chapter modal */}
      <AnimatePresence>
        {chapterModal && (
          <Modal onClose={() => setChapterModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{chapterModal.id ? 'Edit Chapter' : 'New Chapter'}</h2>
              <button onClick={() => setChapterModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
                <input value={chapterModal.form.title} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, title: e.target.value } }))}
                  placeholder="e.g. Chapter 1 – Introduction" className="input-dark w-full" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={chapterModal.form.description} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                  rows={2} className="input-dark w-full resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Order</label>
                <input type="number" value={chapterModal.form.order_index} onChange={e => setChapterModal(p => ({ ...p, form: { ...p.form, order_index: parseInt(e.target.value) || 0 } }))}
                  className="input-dark w-24" />
              </div>
              {chapterModal.id && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Visible to students</span>
                  <Toggle value={chapterModal.form.is_visible} onChange={() => setChapterModal(p => ({ ...p, form: { ...p.form, is_visible: !p.form.is_visible } }))} />
                </div>
              )}
              <button onClick={saveChapter} disabled={saving}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {chapterModal.id ? 'Save Changes' : 'Create Chapter'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Delete {deleteTarget.type}?</h2>
              <p className="text-white/40 text-sm mb-6">
                "<span className="text-white/70">{deleteTarget.name}</span>" will be permanently deleted along with all its contents.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button onClick={runDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Bulk upload modal */}
      <AnimatePresence>
        {bulkModal && (
          <Modal onClose={() => { setBulkModal(null); setBulkFiles([]); setBulkResults(null); }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Bulk PDF Upload</h2>
                <p className="text-white/35 text-xs mt-0.5">{bulkModal.subjectName}</p>
              </div>
              <button onClick={() => { setBulkModal(null); setBulkFiles([]); setBulkResults(null); }}
                className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!bulkResults ? (
              <div className="space-y-4">
                <div className="text-white/40 text-xs leading-relaxed bg-white/[0.03] rounded-xl p-3 border border-white/[0.07]">
                  <p className="font-semibold text-white/60 mb-1">How it works:</p>
                  <ul className="space-y-0.5">
                    <li>• Each PDF filename becomes the chapter title</li>
                    <li>• New chapters are created automatically</li>
                    <li>• Existing chapters with matching titles get updated</li>
                    <li>• PDF only, max 50 MB per file</li>
                  </ul>
                </div>

                {/* Drop zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                    ${bulkFiles.length > 0 ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/[0.12] hover:border-purple-500/40 hover:bg-white/[0.02]'}`}
                  onClick={() => bulkInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                    setBulkFiles(prev => {
                      const names = new Set(prev.map(f => f.name));
                      return [...prev, ...files.filter(f => !names.has(f.name))];
                    });
                  }}>
                  <input
                    ref={bulkInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      setBulkFiles(prev => {
                        const names = new Set(prev.map(f => f.name));
                        return [...prev, ...files.filter(f => !names.has(f.name))];
                      });
                      e.target.value = '';
                    }}
                  />
                  <Upload className="w-8 h-8 text-white/25 mx-auto mb-2" />
                  <p className="text-white/50 text-sm font-medium">Click or drag PDFs here</p>
                  <p className="text-white/25 text-xs mt-1">Select multiple PDF files at once</p>
                </div>

                {/* File list */}
                {bulkFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {bulkFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <File className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="text-white/70 text-xs flex-1 truncate">{f.name}</span>
                        <span className="text-white/30 text-[10px] flex-shrink-0">{formatSize(f.size)}</span>
                        <button onClick={() => setBulkFiles(prev => prev.filter((_, j) => j !== i))}
                          className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleBulkUpload}
                  disabled={bulkFiles.length === 0 || bulkUploading}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {bulkUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {bulkUploading ? 'Uploading…' : `Upload ${bulkFiles.length} PDF${bulkFiles.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm">Upload complete</p>
                    <p className="text-white/40 text-xs">{bulkResults.success}/{bulkResults.total} files uploaded successfully</p>
                  </div>
                </div>

                {/* Per-file results */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {bulkResults.results.map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${r.status === 'ok' ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-red-500/5 border border-red-500/15'}`}>
                      {r.status === 'ok'
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        : <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                      <span className={`flex-1 truncate ${r.status === 'ok' ? 'text-white/70' : 'text-red-400/70'}`}>{r.title}</span>
                      {r.status !== 'ok' && <span className="text-red-400/50 text-[10px]">{r.error}</span>}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setBulkFiles([]); setBulkResults(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Upload More
                  </button>
                  <button onClick={() => { setBulkModal(null); setBulkFiles([]); setBulkResults(null); }}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors">
                    Done
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
