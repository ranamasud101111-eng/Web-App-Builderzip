import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Zap, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp,
  BarChart3, Bell, BookOpen, Home, LogOut, Shield,
  Brain, GraduationCap, Eye, EyeOff, Save, Loader2, Layers,
    Upload, FileText, AlignLeft, CheckCircle, AlertCircle, RefreshCw,
  HelpCircle,
} from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

const LEVEL_ICONS   = ['🃏','📜','💼','🏆','⭐','🌟','🔥','💡','🎯','📚'];
const SUBJECT_ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','💻','⚗️','📐','📊','⚖️','🏛️','💡'];

const emptyLevel   = () => ({ name:'', description:'', icon:'🃏', order_index:0, is_visible:true });
const emptySubject = () => ({ name:'', description:'', icon:'📚', order_index:0, is_visible:true });
const emptyChapter = () => ({ name:'', description:'', order_index:0, is_visible:true });
const emptyCard    = () => ({ front:'', back:'', order_index:0 });

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
        className={`w-9 h-9 text-xl rounded-lg transition-all ${value===ic ? 'bg-yellow-500/30 ring-2 ring-yellow-400/50 scale-110' : 'bg-white/[0.04] hover:bg-white/[0.09]'}`}>
        {ic}
      </button>
    ))}
  </div>
);

const Modal = ({ onClose, children, wide }) => (
  <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
      className={`relative ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'} rounded-2xl p-6 z-10 overflow-y-auto max-h-[92vh]`}
      style={{ background:'linear-gradient(135deg,rgba(14,22,74,0.99) 0%,rgba(6,11,36,0.99) 100%)', border:'1px solid rgba(234,179,8,0.2)' }}
      onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </div>
);

export default function AdminFlashCards() {
  const { logout } = useAuth();
  const { refresh: refreshModules } = useModuleSettings();
  const navigate   = useNavigate();
  const location   = useLocation();
  const fileRef    = useRef(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  const [fcVisible,        setFcVisible]        = useState(true);
  const [levels,           setLevels]           = useState([]);
  const [subjects,         setSubjects]         = useState({});
  const [chapters,         setChapters]         = useState({});
  const [cards,            setCards]            = useState({});
  const [expandedLevels,   setExpandedLevels]   = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  const [levelModal,   setLevelModal]   = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [chapterModal, setChapterModal] = useState(null);
  const [cardModal,    setCardModal]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkModal,    setBulkModal]    = useState(null);

  const navItems = [
    { to: '/admin',               label: 'Dashboard',    icon: <BarChart3     className="w-4 h-4" /> },
    { to: '/admin/subjects',      label: 'Subjects',     icon: <BookOpen      className="w-4 h-4" /> },
    { to: '/admin/mcqs',          label: 'MCQ Manager',  icon: <Brain         className="w-4 h-4" /> },
    { to: '/admin/exams',         label: 'Exam Manager', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes',       label: 'Classes',      icon: <Layers        className="w-4 h-4" /> },
    { to: '/admin/flashcards',    label: 'Flash Cards',  icon: <Zap           className="w-4 h-4" /> },
    { to: '/admin/notifications', label: 'Notifications',icon: <Bell          className="w-4 h-4" /> },
    { to: '/admin/shortnotes',    label: 'Short Notes',   icon: <FileText      className="w-4 h-4" /> },
    { to: '/admin/question-bank', label: 'Question Bank', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/dashboard',           label: 'Student View', icon: <Home          className="w-4 h-4" /> },
  ];

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        api.get('/flashcards/settings'),
        api.get('/flashcards/levels'),
      ]);
      setFcVisible(sRes.data.flashcards_visible);
      setLevels(lRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  const fetchSubjects = useCallback(async (levelId) => {
    try {
      const r = await api.get(`/flashcards/levels/${levelId}/subjects`);
      setSubjects(prev => ({ ...prev, [levelId]: r.data }));
    } catch { toast.error('Failed to load subjects'); }
  }, []);

  const fetchChapters = useCallback(async (subjectId) => {
    try {
      const r = await api.get(`/flashcards/subjects/${subjectId}/chapters`);
      setChapters(prev => ({ ...prev, [subjectId]: r.data }));
    } catch { toast.error('Failed to load chapters'); }
  }, []);

  const fetchCards = useCallback(async (chapterId) => {
    try {
      const r = await api.get(`/flashcards/chapters/${chapterId}/cards`);
      setCards(prev => ({ ...prev, [chapterId]: r.data }));
    } catch { toast.error('Failed to load cards'); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Expand ── */
  const toggleLevel = async (id) => {
    const opening = !expandedLevels[id];
    setExpandedLevels(p => ({ ...p, [id]: opening }));
    if (opening && subjects[id] === undefined) await fetchSubjects(id);
  };
  const toggleSubject = async (id) => {
    const opening = !expandedSubjects[id];
    setExpandedSubjects(p => ({ ...p, [id]: opening }));
    if (opening && chapters[id] === undefined) await fetchChapters(id);
  };
  const toggleChapter = async (id) => {
    const opening = !expandedChapters[id];
    setExpandedChapters(p => ({ ...p, [id]: opening }));
    if (opening && cards[id] === undefined) await fetchCards(id);
  };

  /* ── Visibility ── */
  const toggleVisibility = async () => {
    try {
      const next = !fcVisible;
      await api.put('/flashcards/settings', { flashcards_visible: next });
      setFcVisible(next);
      refreshModules();
      toast.success(next ? 'Flash Cards visible to students' : 'Flash Cards hidden from students');
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ── Save Level ── */
  const saveLevel = async () => {
    const { id, form } = levelModal;
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (id) { await api.put(`/flashcards/levels/${id}`, form); toast.success('Level updated'); }
      else    { await api.post('/flashcards/levels', form);      toast.success('Level created'); }
      setLevelModal(null); await fetchAll();
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Save Subject ── */
  const saveSubject = async () => {
    const { id, levelId, form } = subjectModal;
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (id) { await api.put(`/flashcards/subjects/${id}`, form);                              toast.success('Subject updated'); }
      else    { await api.post('/flashcards/subjects', { ...form, level_id: levelId });         toast.success('Subject created'); }
      setSubjectModal(null);
      setSubjects(p => ({ ...p, [levelId]: undefined }));
      await fetchSubjects(levelId);
      setExpandedLevels(p => ({ ...p, [levelId]: true }));
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Save Chapter ── */
  const saveChapter = async () => {
    const { id, subjectId, form } = chapterModal;
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (id) { await api.put(`/flashcards/chapters/${id}`, form);                               toast.success('Chapter updated'); }
      else    { await api.post('/flashcards/chapters', { ...form, subject_id: subjectId });      toast.success('Chapter created'); }
      setChapterModal(null);
      setChapters(p => ({ ...p, [subjectId]: undefined }));
      await fetchChapters(subjectId);
      setExpandedSubjects(p => ({ ...p, [subjectId]: true }));
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Save Card ── */
  const saveCard = async () => {
    const { id, chapterId, form } = cardModal;
    if (!form.front.trim()) { toast.error('Front text required'); return; }
    if (!form.back.trim())  { toast.error('Back text required');  return; }
    setSaving(true);
    try {
      if (id) { await api.put(`/flashcards/cards/${id}`, form);                               toast.success('Card updated'); }
      else    { await api.post('/flashcards/cards', { ...form, chapter_id: chapterId });      toast.success('Card created'); }
      setCardModal(null);
      setCards(p => ({ ...p, [chapterId]: undefined }));
      await fetchCards(chapterId);
      setExpandedChapters(p => ({ ...p, [chapterId]: true }));
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  /* ── Delete ── */
  const runDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, parentId } = deleteTarget;
    setDeleteTarget(null);
    try {
      if (type === 'level')   { await api.delete(`/flashcards/levels/${id}`);   await fetchAll(); }
      if (type === 'subject') { await api.delete(`/flashcards/subjects/${id}`); await fetchSubjects(parentId); }
      if (type === 'chapter') { await api.delete(`/flashcards/chapters/${id}`); await fetchChapters(parentId); }
      if (type === 'card')    { await api.delete(`/flashcards/cards/${id}`);    await fetchCards(parentId); }
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  /* ── Bulk Import ── */
  const [bulkText,    setBulkText]    = useState('');
  const [bulkParsed,  setBulkParsed]  = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSaving,  setBulkSaving]  = useState(false);

  const openBulk = (chapterId, chapterName) => {
    setBulkModal({ chapterId, chapterName });
    setBulkText(''); setBulkParsed(null);
  };

  const parseBulkText = async () => {
    if (!bulkText.trim()) { toast.error('Paste some text first'); return; }
    setBulkLoading(true);
    try {
      const r = await api.post('/flashcards/parse-text', { text: bulkText });
      if (!r.data.cards.length) { toast.error('Could not detect any cards. Use Q: / A: format.'); }
      else { setBulkParsed(r.data.cards); toast.success(`Parsed ${r.data.count} cards`); }
    } catch (e) { toast.error('Parse failed: ' + (e.response?.data?.error || e.message)); }
    finally { setBulkLoading(false); }
  };

  const parseBulkFile = async (file) => {
    if (!file) return;
    setBulkLoading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await api.post('/flashcards/parse-file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!r.data.cards.length) { toast.error('No cards detected in file'); }
      else { setBulkParsed(r.data.cards); setBulkText(''); toast.success(`Parsed ${r.data.count} cards from file`); }
    } catch (e) { toast.error('File parse failed: ' + (e.response?.data?.error || e.message)); }
    finally { setBulkLoading(false); }
  };

  const saveBulk = async () => {
    if (!bulkParsed?.length) return;
    setBulkSaving(true);
    try {
      const r = await api.post(`/flashcards/chapters/${bulkModal.chapterId}/bulk-import`, { cards: bulkParsed });
      toast.success(`Saved ${r.data.inserted} flash cards`);
      setCards(p => ({ ...p, [bulkModal.chapterId]: undefined }));
      await fetchCards(bulkModal.chapterId);
      setExpandedChapters(p => ({ ...p, [bulkModal.chapterId]: true }));
      setBulkModal(null); setBulkParsed(null); setBulkText('');
    } catch (e) { toast.error('Save failed: ' + (e.response?.data?.error || e.message)); }
    finally { setBulkSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = ({ onClose }) => (
    <div className="sidebar flex flex-col h-full p-5">
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-black" />
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold text-sm leading-tight">CA Aspire BD</div>
          <div className="text-[9px] text-yellow-400 font-semibold tracking-widest uppercase">Admin Panel</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-5 border border-yellow-500/20 bg-yellow-500/5">
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
      <button onClick={handleLogout} className="sidebar-item mt-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08]">
        <LogOut className="w-4 h-4" /><span>Logout</span>
      </button>
    </div>
  );

  /* ════ RENDER ════ */
  return (
    <div className="flex flex-col">


        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.07] bg-[#020818]/80 backdrop-blur-sm sticky top-[56px] z-10">
          <div className="flex items-center gap-2.5 mr-auto min-w-0">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg leading-tight">Flash Card Management</h1>
              <p className="text-white/30 text-[11px] hidden sm:block">Manage levels, subjects, chapters, and flash cards</p>
            </div>
          </div>
          <button onClick={toggleVisibility}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all flex-shrink-0
              ${fcVisible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'}`}>
            {fcVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{fcVisible ? 'Visible' : 'Hidden'}</span>
          </button>
          <button onClick={() => setLevelModal({ id:null, form:emptyLevel() })}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" /><span>Add Level</span>
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : levels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-white/60 text-lg font-semibold">No levels yet</p>
              <p className="text-white/25 text-sm mt-1 mb-5">Start by creating Certificate, Professional, and Advanced levels</p>
              <button onClick={() => setLevelModal({ id:null, form:emptyLevel() })}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Level
              </button>
            </div>
          ) : levels.map((level, li) => (
            <motion.div key={level.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:li*0.04 }}
              className="rounded-2xl border border-white/[0.08] bg-[#080f2e]/80">

              {/* Level row */}
              <div className="flex items-center gap-2 p-3 sm:p-4">
                <button onClick={() => toggleLevel(level.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/15 flex items-center justify-center text-xl flex-shrink-0">{level.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm sm:text-base">{level.name}</span>
                      {!level.is_visible && <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Hidden</span>}
                    </div>
                    <p className="text-white/20 text-[10px] mt-0.5">{subjects[level.id] !== undefined ? `${subjects[level.id].length} subjects` : 'Click to expand'}</p>
                  </div>
                  <span className="text-white/30">{expandedLevels[level.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setSubjectModal({ id:null, levelId:level.id, form:emptySubject() })} title="Add Subject"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs font-bold transition-colors">
                    <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Subject</span>
                  </button>
                  <button onClick={() => setLevelModal({ id:level.id, form:{ name:level.name, description:level.description||'', icon:level.icon, order_index:level.order_index, is_visible:level.is_visible } })}
                    className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white/80 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget({ type:'level', id:level.id, name:level.name })}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Subjects */}
              <AnimatePresence>
                {expandedLevels[level.id] && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
                    <div className="border-t border-white/[0.06] px-3 sm:px-5 pb-4 pt-3 space-y-2">
                      {subjects[level.id] === undefined ? (
                        <div className="flex items-center justify-center py-5"><Loader2 className="w-5 h-5 text-yellow-400/50 animate-spin" /></div>
                      ) : subjects[level.id].length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-white/30 text-sm">No subjects yet</p>
                          <button onClick={() => setSubjectModal({ id:null, levelId:level.id, form:emptySubject() })}
                            className="mt-2 text-yellow-400 text-xs hover:text-yellow-300 underline underline-offset-2">+ Add first subject</button>
                        </div>
                      ) : subjects[level.id].map(subj => (
                        <div key={subj.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02]">

                          {/* Subject row */}
                          <div className="flex items-center gap-2 p-3">
                            <button onClick={() => toggleSubject(subj.id)} className="flex items-center gap-2.5 flex-1 text-left min-w-0">
                              <span className="text-lg flex-shrink-0">{subj.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-white/85 font-semibold text-sm">{subj.name}</span>
                                  {!subj.is_visible && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/15">Hidden</span>}
                                </div>
                                <p className="text-white/20 text-[10px]">{chapters[subj.id] !== undefined ? `${chapters[subj.id].length} chapters` : 'Click to expand'}</p>
                              </div>
                              <span className="text-white/25">{expandedSubjects[subj.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</span>
                            </button>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => setChapterModal({ id:null, subjectId:subj.id, form:emptyChapter() })} title="Add Chapter"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400/80 hover:bg-yellow-500/20 hover:text-yellow-400 text-[11px] font-bold transition-colors">
                                <Plus className="w-3 h-3" /><span className="hidden sm:inline">Chapter</span>
                              </button>
                              <button onClick={() => setSubjectModal({ id:subj.id, levelId:level.id, form:{ name:subj.name, description:subj.description||'', icon:subj.icon, order_index:subj.order_index, is_visible:subj.is_visible } })}
                                className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/30 hover:text-white/70 transition-colors"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => setDeleteTarget({ type:'subject', id:subj.id, parentId:level.id, name:subj.name })}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>

                          {/* Chapters */}
                          <AnimatePresence>
                            {expandedSubjects[subj.id] && (
                              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                                exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
                                <div className="border-t border-white/[0.05] px-3 sm:px-4 pt-2 pb-3 space-y-1.5">
                                  {chapters[subj.id] === undefined ? (
                                    <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 text-white/20 animate-spin" /></div>
                                  ) : chapters[subj.id].length === 0 ? (
                                    <div className="text-center py-3">
                                      <p className="text-white/25 text-xs">No chapters yet</p>
                                      <button onClick={() => setChapterModal({ id:null, subjectId:subj.id, form:emptyChapter() })}
                                        className="mt-1.5 text-yellow-400/60 text-xs hover:text-yellow-400 underline underline-offset-2">+ Add first chapter</button>
                                    </div>
                                  ) : chapters[subj.id].map(ch => (
                                    <div key={ch.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02]">

                                      {/* Chapter row */}
                                      <div className="flex items-center gap-2 p-2.5">
                                        <button onClick={() => toggleChapter(ch.id)} className="flex items-center gap-2 flex-1 text-left min-w-0">
                                          <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                            <AlignLeft className="w-3 h-3 text-yellow-400/70" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <span className="text-white/80 text-xs font-semibold truncate block">{ch.name}</span>
                                            <p className="text-white/20 text-[10px]">{cards[ch.id] !== undefined ? `${cards[ch.id].length} cards` : 'Click to expand'}</p>
                                          </div>
                                          <span className="text-white/20 flex-shrink-0">{expandedChapters[ch.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
                                        </button>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <button onClick={() => setCardModal({ id:null, chapterId:ch.id, form:emptyCard() })} title="Add Card"
                                            className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400/70 hover:bg-yellow-500/20 hover:text-yellow-400 text-[10px] font-bold transition-colors">
                                            <Plus className="w-2.5 h-2.5" /><span className="hidden sm:inline">Card</span>
                                          </button>
                                          <button onClick={() => openBulk(ch.id, ch.name)} title="Bulk Import"
                                            className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-blue-500/10 text-blue-400/70 hover:bg-blue-500/20 hover:text-blue-400 text-[10px] font-bold transition-colors">
                                            <Upload className="w-2.5 h-2.5" /><span className="hidden sm:inline">Import</span>
                                          </button>
                                          <button onClick={() => setChapterModal({ id:ch.id, subjectId:subj.id, form:{ name:ch.name, description:ch.description||'', order_index:ch.order_index, is_visible:ch.is_visible } })}
                                            className="p-1 rounded hover:bg-white/[0.07] text-white/25 hover:text-white/60 transition-colors"><Edit2 className="w-2.5 h-2.5" /></button>
                                          <button onClick={() => setDeleteTarget({ type:'chapter', id:ch.id, parentId:subj.id, name:ch.name })}
                                            className="p-1 rounded hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
                                        </div>
                                      </div>

                                      {/* Flash Cards list */}
                                      <AnimatePresence>
                                        {expandedChapters[ch.id] && (
                                          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                                            exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
                                            <div className="border-t border-white/[0.04] px-2 sm:px-3 pt-1.5 pb-2 space-y-1">
                                              {cards[ch.id] === undefined ? (
                                                <div className="flex justify-center py-3"><Loader2 className="w-3.5 h-3.5 text-white/20 animate-spin" /></div>
                                              ) : cards[ch.id].length === 0 ? (
                                                <div className="text-center py-3">
                                                  <p className="text-white/20 text-[11px]">No cards yet — add individually or use Bulk Import</p>
                                                </div>
                                              ) : cards[ch.id].map((card, ci) => (
                                                <div key={card.id} className="flex items-start gap-2 px-2 py-2 rounded-md bg-white/[0.02] border border-white/[0.03] group hover:border-yellow-500/15 transition-colors">
                                                  <div className="w-5 h-5 rounded bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-yellow-400 text-[9px] font-bold">{ci+1}</span>
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-white/70 text-[11px] font-medium line-clamp-1"><span className="text-white/30 mr-1">Q:</span>{card.front}</p>
                                                    <p className="text-white/40 text-[10px] line-clamp-1 mt-0.5"><span className="text-white/20 mr-1">A:</span>{card.back}</p>
                                                  </div>
                                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    <button onClick={() => setCardModal({ id:card.id, chapterId:ch.id, form:{ front:card.front, back:card.back, order_index:card.order_index } })}
                                                      className="p-0.5 rounded hover:bg-white/[0.07] text-white/25 hover:text-white/70 transition-colors"><Edit2 className="w-2.5 h-2.5" /></button>
                                                    <button onClick={() => setDeleteTarget({ type:'card', id:card.id, parentId:ch.id, name:card.front.slice(0,40) })}
                                                      className="p-0.5 rounded hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-colors"><Trash2 className="w-2.5 h-2.5" /></button>
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
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      {/* ══ MODALS ══ */}

      {/* Level Modal */}
      <AnimatePresence>
        {levelModal && (
          <Modal onClose={() => setLevelModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{levelModal.id ? 'Edit Level' : 'Add Level'}</h2>
              <button onClick={() => setLevelModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Name <span className="text-red-400">*</span></label>
                <input autoFocus value={levelModal.form.name} onChange={e => setLevelModal(p=>({...p,form:{...p.form,name:e.target.value}}))}
                  onKeyDown={e=>e.key==='Enter'&&saveLevel()} placeholder="e.g. Certificate" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={levelModal.form.description} onChange={e => setLevelModal(p=>({...p,form:{...p.form,description:e.target.value}}))}
                  rows={2} className="input-field w-full resize-none" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Icon</label>
                <IconPicker icons={LEVEL_ICONS} value={levelModal.form.icon} onChange={ic=>setLevelModal(p=>({...p,form:{...p.form,icon:ic}}))} />
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={levelModal.form.is_visible} onChange={()=>setLevelModal(p=>({...p,form:{...p.form,is_visible:!p.form.is_visible}}))} />
                <span className="text-white/55 text-sm">Visible to students</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setLevelModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">Cancel</button>
              <button onClick={saveLevel} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {levelModal.id ? 'Update' : 'Create'}
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
              <button onClick={() => setSubjectModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Name <span className="text-red-400">*</span></label>
                <input autoFocus value={subjectModal.form.name} onChange={e=>setSubjectModal(p=>({...p,form:{...p.form,name:e.target.value}}))}
                  onKeyDown={e=>e.key==='Enter'&&saveSubject()} placeholder="e.g. Accounting" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={subjectModal.form.description} onChange={e=>setSubjectModal(p=>({...p,form:{...p.form,description:e.target.value}}))}
                  rows={2} className="input-field w-full resize-none" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Icon</label>
                <IconPicker icons={SUBJECT_ICONS} value={subjectModal.form.icon} onChange={ic=>setSubjectModal(p=>({...p,form:{...p.form,icon:ic}}))} />
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={subjectModal.form.is_visible} onChange={()=>setSubjectModal(p=>({...p,form:{...p.form,is_visible:!p.form.is_visible}}))} />
                <span className="text-white/55 text-sm">Visible to students</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSubjectModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm transition-colors">Cancel</button>
              <button onClick={saveSubject} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {subjectModal.id ? 'Update' : 'Create'}
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
              <button onClick={() => setChapterModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Chapter Name <span className="text-red-400">*</span></label>
                <input autoFocus value={chapterModal.form.name} onChange={e=>setChapterModal(p=>({...p,form:{...p.form,name:e.target.value}}))}
                  onKeyDown={e=>e.key==='Enter'&&saveChapter()} placeholder="e.g. Introduction" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={chapterModal.form.description} onChange={e=>setChapterModal(p=>({...p,form:{...p.form,description:e.target.value}}))}
                  rows={2} className="input-field w-full resize-none" placeholder="Optional" />
              </div>
              <div className="flex items-center gap-3">
                <Toggle value={chapterModal.form.is_visible} onChange={()=>setChapterModal(p=>({...p,form:{...p.form,is_visible:!p.form.is_visible}}))} />
                <span className="text-white/55 text-sm">Visible to students</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setChapterModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm transition-colors">Cancel</button>
              <button onClick={saveChapter} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {chapterModal.id ? 'Update' : 'Create'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Card Modal */}
      <AnimatePresence>
        {cardModal && (
          <Modal onClose={() => setCardModal(null)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{cardModal.id ? 'Edit Flash Card' : 'Add Flash Card'}</h2>
              <button onClick={() => setCardModal(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-yellow-400 text-xs font-bold uppercase tracking-widest mb-1.5">Front (Question) <span className="text-red-400">*</span></label>
                <textarea autoFocus value={cardModal.form.front} onChange={e=>setCardModal(p=>({...p,form:{...p.form,front:e.target.value}}))}
                  rows={4} className="input-field w-full resize-none" placeholder="Write the question or term here..." />
              </div>
              <div>
                <label className="block text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5">Back (Answer) <span className="text-red-400">*</span></label>
                <textarea value={cardModal.form.back} onChange={e=>setCardModal(p=>({...p,form:{...p.form,back:e.target.value}}))}
                  rows={4} className="input-field w-full resize-none" placeholder="Write the answer or explanation here..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCardModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm transition-colors">Cancel</button>
              <button onClick={saveCard} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {cardModal.id ? 'Update Card' : 'Create Card'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {bulkModal && (
          <Modal onClose={() => { setBulkModal(null); setBulkParsed(null); setBulkText(''); }} wide>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Bulk Import Flash Cards</h2>
                <p className="text-white/35 text-xs mt-0.5">Chapter: <span className="text-yellow-400">{bulkModal.chapterName}</span></p>
              </div>
              <button onClick={() => { setBulkModal(null); setBulkParsed(null); setBulkText(''); }} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40"><X className="w-4 h-4" /></button>
            </div>

            {!bulkParsed ? (
              <div className="space-y-5">
                {/* Format hint */}
                <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/15 p-4">
                  <p className="text-yellow-400 text-xs font-bold mb-2">Supported text formats:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-white/50">
                    <div className="bg-white/[0.03] rounded-lg p-2">
                      <p className="text-white/70 font-semibold mb-1">Format 1 (recommended)</p>
                      <code className="text-green-400">Q: What is debit?<br/>A: Increases assets</code>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2">
                      <p className="text-white/70 font-semibold mb-1">Format 2</p>
                      <code className="text-green-400">Front: Term here<br/>Back: Definition</code>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2">
                      <p className="text-white/70 font-semibold mb-1">Format 3 (alternate lines)</p>
                      <code className="text-green-400">Question text<br/>Answer text<br/>Question 2<br/>Answer 2</code>
                    </div>
                  </div>
                </div>

                {/* Paste text */}
                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Paste Text</label>
                  <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={8}
                    className="input-field w-full resize-none font-mono text-sm"
                    placeholder={"Q: What is the accounting equation?\nA: Assets = Liabilities + Equity\n\nQ: What is a debit?\nA: An entry that increases assets or expenses"} />
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={parseBulkText} disabled={bulkLoading || !bulkText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors">
                    {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Parse Text
                  </button>

                  <div className="flex items-center gap-2 text-white/30 text-sm">
                    <span>or</span>
                    <span>upload</span>
                  </div>

                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/25 font-semibold text-sm rounded-xl transition-colors">
                    <Upload className="w-4 h-4" />
                    PDF / DOCX / TXT
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
                    onChange={e => { if (e.target.files[0]) parseBulkFile(e.target.files[0]); e.target.value=''; }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Parsed {bulkParsed.length} flash cards — review and edit before saving
                </div>

                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                  {bulkParsed.map((card, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Card {i+1}</span>
                        <button onClick={() => setBulkParsed(p => p.filter((_,idx)=>idx!==i))}
                          className="p-0.5 hover:text-red-400 text-white/20 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Front</p>
                        <textarea value={card.front} onChange={e=>setBulkParsed(p=>p.map((c,idx)=>idx===i?{...c,front:e.target.value}:c))}
                          rows={2} className="input-field w-full resize-none text-sm py-2 px-3" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Back</p>
                        <textarea value={card.back} onChange={e=>setBulkParsed(p=>p.map((c,idx)=>idx===i?{...c,back:e.target.value}:c))}
                          rows={2} className="input-field w-full resize-none text-sm py-2 px-3" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setBulkParsed(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors">
                    ← Re-parse
                  </button>
                  <button onClick={saveBulk} disabled={bulkSaving || !bulkParsed.length}
                    className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    {bulkSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save {bulkParsed.length} Cards
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Delete {deleteTarget.type}?</h2>
              <p className="text-white/45 text-sm mb-1">"{deleteTarget.name}"</p>
              <p className="text-white/25 text-xs mb-6">
                {deleteTarget.type==='level'   && 'All subjects, chapters, and cards inside will be deleted.'}
                {deleteTarget.type==='subject'  && 'All chapters and cards inside will be deleted.'}
                {deleteTarget.type==='chapter'  && 'All flash cards inside will be deleted.'}
                {deleteTarget.type==='card'     && 'This flash card will be permanently deleted.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm transition-colors">Cancel</button>
                <button onClick={runDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors">Delete</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
