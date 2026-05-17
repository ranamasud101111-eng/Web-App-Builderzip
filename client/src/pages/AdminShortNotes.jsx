import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FileText, Plus, X, Edit2, Trash2, ChevronDown, ChevronRight,
  BarChart3, Bell, BookOpen, Home, LogOut, Menu, Shield,
  Brain, GraduationCap, Eye, EyeOff, Save, Loader2,
  Zap, Layers, Upload, File, CheckCircle, AlertCircle,
  RefreshCw, Type, FileUp, Pencil, AlignLeft, HelpCircle,
} from 'lucide-react';
import api from '../api';

/* ─── Sidebar ─── */
const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

/* ─── Icon pickers ─── */
const LEVEL_ICONS   = ['📝','📜','💼','🏆','⭐','🌟','🔥','💡','🎯','📚'];
const SUBJECT_ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','💻','⚗️','📐','📊','💡','⚖️','🏛️'];

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

/* ─── Toggle ─── */
const Toggle = ({ value, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <button type="button" onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-white/10'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-6' : 'left-1'}`} />
    </button>
    {label && <span className="text-sm text-white/70">{label}</span>}
  </label>
);

/* ─── Generic Modal wrapper ─── */
const Modal = ({ onClose, children, wide }) => (
  <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.18 }}
      className={`relative bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
      onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </div>
);

/* ─── Form field ─── */
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm text-white/60 font-medium">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 text-sm ${props.className || ''}`} />
);

const Textarea = (props) => (
  <textarea {...props} className={`w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 text-sm resize-none ${props.className || ''}`} />
);

/* ─── Note type badge ─── */
const NoteBadge = ({ type }) => {
  if (!type) return <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">No note</span>;
  if (type === 'pdf') return <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">PDF</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Text</span>;
};

/* ─── File size formatter ─── */
const fmtSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ════════════════════════════════════════════════════
   NOTE MODAL
═══════════════════════════════════════════════════ */
function NoteModal({ chapter, subjectId, onClose, onSaved }) {
  const [note, setNote]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [activeTab, setActiveTab] = useState('pdf');
  const [textContent, setTextContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [pdfFile, setPdfFile]     = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/shortnotes/chapters/${chapter.id}/note`);
        if (r.data) {
          setNote(r.data);
          setActiveTab(r.data.type || 'pdf');
          setTextContent(r.data.text_content || '');
          setIsVisible(r.data.is_visible !== false);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [chapter.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'text') {
        if (!textContent.trim()) { toast.error('Please write some text content'); return; }
        const r = await api.put(`/shortnotes/chapters/${chapter.id}/note`, {
          type: 'text', text_content: textContent, is_visible: isVisible,
        });
        setNote(r.data);
        toast.success('Text note saved!');
        onSaved(subjectId);
      } else {
        if (pdfFile) {
          const fd = new FormData();
          fd.append('pdf', pdfFile);
          fd.append('is_visible', isVisible);
          const r = await api.post(`/shortnotes/chapters/${chapter.id}/note/upload`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setNote(r.data);
          setPdfFile(null);
          toast.success('PDF uploaded!');
          onSaved(subjectId);
        } else if (note) {
          /* update visibility/type only */
          const r = await api.put(`/shortnotes/chapters/${chapter.id}/note`, {
            type: 'pdf', is_visible: isVisible,
          });
          setNote(r.data);
          toast.success('Note updated!');
          onSaved(subjectId);
        } else {
          toast.error('Please select a PDF file');
          return;
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save note');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!note) return;
    setDeleting(true);
    try {
      await api.delete(`/shortnotes/chapters/${chapter.id}/note`);
      setNote(null);
      setPdfFile(null);
      setTextContent('');
      toast.success('Note deleted');
      onSaved(subjectId);
    } catch { toast.error('Failed to delete note'); }
    finally { setDeleting(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') setPdfFile(file);
    else toast.error('Only PDF files accepted');
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Short Note</h2>
          <p className="text-sm text-white/50 mt-0.5 truncate max-w-sm">{chapter.title}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50 hover:text-white transition-colors flex-shrink-0">
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={28} className="animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="p-6 space-y-5">
          {/* Type tabs */}
          <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl">
            {[
              { key: 'pdf',  icon: <FileUp size={15} />,  label: 'PDF File' },
              { key: 'text', icon: <AlignLeft size={15} />, label: 'Text Note' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* PDF tab */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              {/* Current file info */}
              {note?.type === 'pdf' && note.filename && !pdfFile && (
                <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <File size={18} className="text-rose-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{note.original_name}</p>
                    <p className="text-xs text-white/40">{fmtSize(note.file_size)} • Currently active</p>
                  </div>
                  <a href={`/api/shortnotes/file/${note.filename}`} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs hover:bg-rose-500/30 transition-colors">
                    View
                  </a>
                </div>
              )}

              {/* New file selected */}
              {pdfFile && (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{pdfFile.name}</p>
                    <p className="text-xs text-white/40">{fmtSize(pdfFile.size)} • Ready to upload</p>
                  </div>
                  <button onClick={() => setPdfFile(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                <Upload size={28} className="mx-auto mb-3 text-white/30" />
                <p className="text-sm text-white/60 font-medium">
                  {note?.type === 'pdf' ? 'Drop a new PDF to replace' : 'Drop PDF here or click to browse'}
                </p>
                <p className="text-xs text-white/30 mt-1">PDF files only · Max 50 MB</p>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  onChange={e => { if (e.target.files[0]) setPdfFile(e.target.files[0]); e.target.value=''; }} />
              </div>
            </div>
          )}

          {/* Text tab */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <Textarea
                rows={12}
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write your short note content here...&#10;&#10;You can use plain text formatting:&#10;• Use bullet points&#10;• Write formulas&#10;• Add key points and definitions"
              />
              <p className="text-xs text-white/30 text-right">{textContent.length} characters</p>
            </div>
          )}

          {/* Visibility */}
          <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div>
              <p className="text-sm text-white font-medium">Visible to students</p>
              <p className="text-xs text-white/40 mt-0.5">Students can see this note when enabled</p>
            </div>
            <Toggle value={isVisible} onChange={() => setIsVisible(v => !v)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t border-white/10 flex items-center justify-between gap-3">
        <div>
          {note && (
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm font-medium disabled:opacity-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete Note
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Note
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function AdminShortNotes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ─── Data ─── */
  const [notesVisible, setNotesVisible] = useState(true);
  const [levels,   setLevels]   = useState([]);
  const [subjects, setSubjects] = useState({});   /* {levelId: [...]} */
  const [chapters, setChapters] = useState({});   /* {subjectId: [...]} */
  const [expanded, setExpanded] = useState({ levels: {}, subjects: {} });
  const [loading,  setLoading]  = useState(true);

  /* ─── Modals ─── */
  const [levelModal,   setLevelModal]   = useState(null);   /* null | {mode,data} */
  const [subjectModal, setSubjectModal] = useState(null);   /* null | {mode,levelId,data} */
  const [chapterModal, setChapterModal] = useState(null);   /* null | {mode,subjectId,data} */
  const [noteModal,    setNoteModal]    = useState(null);   /* null | {chapter,subjectId} */
  const [deleteTarget, setDeleteTarget] = useState(null);   /* null | {type,id,label} */

  /* ─── Form state ─── */
  const emptyLevel   = { name:'', description:'', icon:'📝', order_index:0, is_visible:true };
  const emptySubject = { name:'', description:'', icon:'📚', order_index:0, is_visible:true };
  const emptyChapter = { title:'', description:'', order_index:0, is_visible:true };

  const [lf, setLf] = useState(emptyLevel);
  const [sf, setSf] = useState(emptySubject);
  const [cf, setCf] = useState(emptyChapter);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Bootstrap ─── */
  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, levelsRes] = await Promise.all([
          api.get('/shortnotes/settings'),
          api.get('/shortnotes/levels'),
        ]);
        setNotesVisible(settingsRes.data.shortnotes_visible !== false);
        setLevels(levelsRes.data);
      } catch { toast.error('Failed to load Short Notes data'); }
      finally { setLoading(false); }
    })();
  }, []);

  /* ─── Load subjects for a level ─── */
  const loadSubjects = useCallback(async (levelId) => {
    try {
      const r = await api.get(`/shortnotes/levels/${levelId}/subjects`);
      setSubjects(p => ({ ...p, [levelId]: r.data }));
    } catch { toast.error('Failed to load subjects'); }
  }, []);

  /* ─── Load chapters for a subject ─── */
  const loadChapters = useCallback(async (subjectId) => {
    try {
      const r = await api.get(`/shortnotes/subjects/${subjectId}/chapters`);
      setChapters(p => ({ ...p, [subjectId]: r.data }));
    } catch { toast.error('Failed to load chapters'); }
  }, []);

  /* ─── Toggle expand ─── */
  const toggleLevel = async (levelId) => {
    const opening = !expanded.levels[levelId];
    setExpanded(p => ({ ...p, levels: { ...p.levels, [levelId]: opening } }));
    if (opening && !subjects[levelId]) await loadSubjects(levelId);
  };

  const toggleSubject = async (subjectId) => {
    const opening = !expanded.subjects[subjectId];
    setExpanded(p => ({ ...p, subjects: { ...p.subjects, [subjectId]: opening } }));
    if (opening && !chapters[subjectId]) await loadChapters(subjectId);
  };

  /* ─── Global visibility ─── */
  const toggleGlobalVisible = async () => {
    const newVal = !notesVisible;
    try {
      await api.put('/shortnotes/settings', { shortnotes_visible: newVal });
      setNotesVisible(newVal);
      toast.success(newVal ? 'Short Notes visible to students' : 'Short Notes hidden from students');
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ─── Level CRUD ─── */
  const openAddLevel   = () => { setLf(emptyLevel);                  setLevelModal({ mode:'add' }); };
  const openEditLevel  = (l) => { setLf({ ...l });                   setLevelModal({ mode:'edit', data: l }); };

  const saveLevelModal = async () => {
    if (!lf.name.trim()) { toast.error('Level name required'); return; }
    setSubmitting(true);
    try {
      if (levelModal.mode === 'add') {
        const r = await api.post('/shortnotes/levels', lf);
        setLevels(p => [...p, r.data]);
        toast.success('Level created');
      } else {
        const r = await api.put(`/shortnotes/levels/${levelModal.data.id}`, lf);
        setLevels(p => p.map(x => x.id === r.data.id ? r.data : x));
        toast.success('Level updated');
      }
      setLevelModal(null);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save level'); }
    finally { setSubmitting(false); }
  };

  const toggleLevelVisible = async (level) => {
    try {
      const r = await api.put(`/shortnotes/levels/${level.id}`, { ...level, is_visible: !level.is_visible });
      setLevels(p => p.map(x => x.id === r.data.id ? r.data : x));
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ─── Subject CRUD ─── */
  const openAddSubject  = (levelId) => { setSf(emptySubject); setSubjectModal({ mode:'add', levelId }); };
  const openEditSubject = (s, levelId) => { setSf({ ...s }); setSubjectModal({ mode:'edit', levelId, data: s }); };

  const saveSubjectModal = async () => {
    if (!sf.name.trim()) { toast.error('Subject name required'); return; }
    setSubmitting(true);
    const levelId = subjectModal.levelId;
    try {
      if (subjectModal.mode === 'add') {
        const r = await api.post('/shortnotes/subjects', { ...sf, level_id: levelId });
        setSubjects(p => ({ ...p, [levelId]: [...(p[levelId] || []), r.data] }));
        toast.success('Subject created');
      } else {
        const r = await api.put(`/shortnotes/subjects/${subjectModal.data.id}`, sf);
        setSubjects(p => ({ ...p, [levelId]: (p[levelId] || []).map(x => x.id === r.data.id ? r.data : x) }));
        toast.success('Subject updated');
      }
      setSubjectModal(null);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save subject'); }
    finally { setSubmitting(false); }
  };

  const toggleSubjectVisible = async (subject, levelId) => {
    try {
      const r = await api.put(`/shortnotes/subjects/${subject.id}`, { ...subject, is_visible: !subject.is_visible });
      setSubjects(p => ({ ...p, [levelId]: (p[levelId] || []).map(x => x.id === r.data.id ? r.data : x) }));
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ─── Chapter CRUD ─── */
  const openAddChapter  = (subjectId) => { setCf(emptyChapter); setChapterModal({ mode:'add', subjectId }); };
  const openEditChapter = (c, subjectId) => { setCf({ title: c.title, description: c.description || '', order_index: c.order_index, is_visible: c.is_visible }); setChapterModal({ mode:'edit', subjectId, data: c }); };

  const saveChapterModal = async () => {
    if (!cf.title.trim()) { toast.error('Chapter title required'); return; }
    setSubmitting(true);
    const subjectId = chapterModal.subjectId;
    try {
      if (chapterModal.mode === 'add') {
        const r = await api.post('/shortnotes/chapters', { ...cf, subject_id: subjectId });
        setChapters(p => ({ ...p, [subjectId]: [...(p[subjectId] || []), r.data] }));
        toast.success('Chapter created');
      } else {
        const r = await api.put(`/shortnotes/chapters/${chapterModal.data.id}`, cf);
        setChapters(p => ({ ...p, [subjectId]: (p[subjectId] || []).map(x => x.id === r.data.id ? r.data : x) }));
        toast.success('Chapter updated');
      }
      setChapterModal(null);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save chapter'); }
    finally { setSubmitting(false); }
  };

  const toggleChapterVisible = async (chapter, subjectId) => {
    try {
      const r = await api.put(`/shortnotes/chapters/${chapter.id}`, { ...chapter, is_visible: !chapter.is_visible });
      setChapters(p => ({
        ...p,
        [subjectId]: (p[subjectId] || []).map(x => x.id === r.data.id ? { ...x, ...r.data } : x),
      }));
    } catch { toast.error('Failed to update visibility'); }
  };

  /* ─── Delete ─── */
  const confirmDelete = (type, id, label, extra) => setDeleteTarget({ type, id, label, extra });
  const execDelete    = async () => {
    if (!deleteTarget) return;
    const { type, id, extra } = deleteTarget;
    setSubmitting(true);
    try {
      if (type === 'level') {
        await api.delete(`/shortnotes/levels/${id}`);
        setLevels(p => p.filter(x => x.id !== id));
        toast.success('Level deleted');
      } else if (type === 'subject') {
        await api.delete(`/shortnotes/subjects/${id}`);
        setSubjects(p => ({ ...p, [extra.levelId]: (p[extra.levelId] || []).filter(x => x.id !== id) }));
        toast.success('Subject deleted');
      } else if (type === 'chapter') {
        await api.delete(`/shortnotes/chapters/${id}`);
        setChapters(p => ({ ...p, [extra.subjectId]: (p[extra.subjectId] || []).filter(x => x.id !== id) }));
        toast.success('Chapter deleted');
      }
      setDeleteTarget(null);
    } catch { toast.error(`Failed to delete ${type}`); }
    finally { setSubmitting(false); }
  };

  /* ─── Note saved callback ─── */
  const onNoteSaved = (subjectId) => loadChapters(subjectId);

  /* ─── Nav ─── */
  const navItems = [
    { to: '/admin',               icon: <BarChart3     size={16}/>, label: 'Dashboard' },
    { to: '/admin/subjects',      icon: <BookOpen      size={16}/>, label: 'Subjects & Chapters' },
    { to: '/admin/mcqs',          icon: <Brain         size={16}/>, label: 'MCQ Manager' },
    { to: '/admin/exams',         icon: <GraduationCap size={16}/>, label: 'Exam Manager' },
    { to: '/admin/classes',       icon: <Layers        size={16}/>, label: 'Classes' },
    { to: '/admin/flashcards',    icon: <Zap           size={16}/>, label: 'Flash Cards' },
    { to: '/admin/notifications', icon: <Bell          size={16}/>, label: 'Notifications' },
    { to: '/admin/shortnotes',    icon: <FileText      size={16}/>, label: 'Short Notes' },
    { to: '/admin/question-bank', icon: <HelpCircle   size={16}/>, label: 'Question Bank' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
      <Loader2 size={32} className="animate-spin text-purple-400" />
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
      {/* ─── Sidebar ─── */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="sidebar w-64 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">Admin Panel</h1>
                <p className="text-white/50 text-xs">{user?.name}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button onClick={() => { logout(); navigate('/'); }}
              className="sidebar-item w-full text-red-400/80 hover:text-red-400">
              <LogOut size={16} /><span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/[0.07]" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-white/70" />
          </button>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">Short Notes Manager</h2>
            <p className="text-white/40 text-xs mt-0.5">Manage levels, subjects, chapters and short notes</p>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-4 max-w-5xl mx-auto w-full">
          {/* Toolbar: visibility toggle + Add Level */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <Toggle value={notesVisible} onChange={toggleGlobalVisible} />
              <div>
                <p className="text-sm font-medium text-white leading-tight">
                  {notesVisible ? 'Short Notes visible to students' : 'Short Notes hidden from students'}
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  {notesVisible ? 'Students can access the Short Notes section' : 'Students cannot see Short Notes anywhere'}
                </p>
              </div>
            </div>
            <button onClick={openAddLevel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0">
              <Plus size={16} />Add Level
            </button>
          </div>

          {/* Levels list */}
          {levels.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Layers size={40} className="mx-auto mb-3 opacity-30" />
              <p>No levels yet. Add your first level above.</p>
            </div>
          ) : levels.map(level => (
            <div key={level.id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              {/* Level row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button onClick={() => toggleLevel(level.id)} className="p-1 rounded-lg hover:bg-white/[0.07] transition-colors text-white/50 hover:text-white">
                  {expanded.levels[level.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <span className="text-xl">{level.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white">{level.name}</span>
                  {level.description && <span className="text-white/40 text-sm ml-2">{level.description}</span>}
                </div>
                {!level.is_visible && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Hidden</span>}
                <div className="flex items-center gap-1">
                  <button title={level.is_visible ? 'Hide level' : 'Show level'}
                    onClick={() => toggleLevelVisible(level)}
                    className="p-2 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                    {level.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => openEditLevel(level)}
                    className="p-2 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => confirmDelete('level', level.id, level.name)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => { openAddSubject(level.id); if (!expanded.levels[level.id]) toggleLevel(level.id); }}
                    className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-colors">
                    <Plus size={12} />Subject
                  </button>
                </div>
              </div>

              {/* Subjects */}
              <AnimatePresence>
                {expanded.levels[level.id] && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
                    className="overflow-hidden border-t border-white/[0.06]">
                    {(subjects[level.id] || []).length === 0 ? (
                      <p className="px-8 py-5 text-white/30 text-sm text-center">No subjects yet. Click "Subject" to add one.</p>
                    ) : (subjects[level.id] || []).map(subject => (
                      <div key={subject.id} className="border-b border-white/[0.04] last:border-0">
                        {/* Subject row */}
                        <div className="flex items-center gap-3 pl-10 pr-5 py-3">
                          <button onClick={() => toggleSubject(subject.id)} className="p-1 rounded-lg hover:bg-white/[0.07] text-white/50 hover:text-white">
                            {expanded.subjects[subject.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <span className="text-lg">{subject.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-white/90 font-medium text-sm">{subject.name}</span>
                            {subject.description && <span className="text-white/30 text-xs ml-2">{subject.description}</span>}
                          </div>
                          {!subject.is_visible && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Hidden</span>}
                          <div className="flex items-center gap-1">
                            <button title={subject.is_visible ? 'Hide' : 'Show'} onClick={() => toggleSubjectVisible(subject, level.id)}
                              className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                              {subject.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            <button onClick={() => openEditSubject(subject, level.id)}
                              className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => confirmDelete('subject', subject.id, subject.name, { levelId: level.id })}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                            <button onClick={() => { openAddChapter(subject.id); if (!expanded.subjects[subject.id]) toggleSubject(subject.id); }}
                              className="ml-1 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-medium transition-colors">
                              <Plus size={11} />Chapter
                            </button>
                          </div>
                        </div>

                        {/* Chapters */}
                        <AnimatePresence>
                          {expanded.subjects[subject.id] && (
                            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                              exit={{ height:0, opacity:0 }} transition={{ duration:0.15 }}
                              className="overflow-hidden">
                              {(chapters[subject.id] || []).length === 0 ? (
                                <p className="pl-20 pr-5 py-4 text-white/25 text-xs text-center">No chapters yet.</p>
                              ) : (chapters[subject.id] || []).map(chapter => (
                                <div key={chapter.id} className="flex items-center gap-3 pl-20 pr-5 py-3 border-t border-white/[0.03] hover:bg-white/[0.02] group">
                                  <FileText size={14} className="text-white/30 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-white/80 text-sm">{chapter.title}</span>
                                    {chapter.description && <span className="text-white/30 text-xs ml-2">{chapter.description}</span>}
                                  </div>
                                  <NoteBadge type={chapter.note_type} />
                                  {!chapter.is_visible && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Hidden</span>}
                                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button title={chapter.is_visible ? 'Hide' : 'Show'} onClick={() => toggleChapterVisible(chapter, subject.id)}
                                      className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                                      {chapter.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                    </button>
                                    <button onClick={() => openEditChapter(chapter, subject.id)}
                                      className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                                      <Edit2 size={12} />
                                    </button>
                                    <button onClick={() => confirmDelete('chapter', chapter.id, chapter.title, { subjectId: subject.id })}
                                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                                      <Trash2 size={12} />
                                    </button>
                                    <button onClick={() => setNoteModal({ chapter, subjectId: subject.id })}
                                      className="ml-1 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition-colors">
                                      {chapter.note_type ? <Pencil size={11} /> : <Plus size={11} />}
                                      {chapter.note_type ? 'Edit Note' : 'Add Note'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </main>
      </div>

      {/* ════ MODALS ════ */}

      {/* Level modal */}
      <AnimatePresence>
        {levelModal && (
          <Modal onClose={() => setLevelModal(null)}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{levelModal.mode === 'add' ? 'Add Level' : 'Edit Level'}</h2>
              <button onClick={() => setLevelModal(null)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Name *"><Input value={lf.name} onChange={e => setLf(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Certificate" /></Field>
              <Field label="Description"><Input value={lf.description} onChange={e => setLf(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></Field>
              <Field label="Icon"><IconPicker icons={LEVEL_ICONS} value={lf.icon} onChange={ic => setLf(p => ({ ...p, icon: ic }))} /></Field>
              <Field label="Order"><Input type="number" value={lf.order_index} onChange={e => setLf(p => ({ ...p, order_index: +e.target.value }))} /></Field>
              <Toggle value={lf.is_visible} onChange={() => setLf(p => ({ ...p, is_visible: !p.is_visible }))} label="Visible to students" />
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setLevelModal(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm">Cancel</button>
              <button onClick={saveLevelModal} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {levelModal.mode === 'add' ? 'Create' : 'Save'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Subject modal */}
      <AnimatePresence>
        {subjectModal && (
          <Modal onClose={() => setSubjectModal(null)}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{subjectModal.mode === 'add' ? 'Add Subject' : 'Edit Subject'}</h2>
              <button onClick={() => setSubjectModal(null)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Name *"><Input value={sf.name} onChange={e => setSf(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Accounting" /></Field>
              <Field label="Description"><Input value={sf.description} onChange={e => setSf(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></Field>
              <Field label="Icon"><IconPicker icons={SUBJECT_ICONS} value={sf.icon} onChange={ic => setSf(p => ({ ...p, icon: ic }))} /></Field>
              <Field label="Order"><Input type="number" value={sf.order_index} onChange={e => setSf(p => ({ ...p, order_index: +e.target.value }))} /></Field>
              <Toggle value={sf.is_visible} onChange={() => setSf(p => ({ ...p, is_visible: !p.is_visible }))} label="Visible to students" />
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setSubjectModal(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm">Cancel</button>
              <button onClick={saveSubjectModal} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {subjectModal.mode === 'add' ? 'Create' : 'Save'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Chapter modal */}
      <AnimatePresence>
        {chapterModal && (
          <Modal onClose={() => setChapterModal(null)}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{chapterModal.mode === 'add' ? 'Add Chapter' : 'Edit Chapter'}</h2>
              <button onClick={() => setChapterModal(null)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Title *"><Input value={cf.title} onChange={e => setCf(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 1: Introduction" /></Field>
              <Field label="Description"><Input value={cf.description} onChange={e => setCf(p => ({ ...p, description: e.target.value }))} placeholder="Optional" /></Field>
              <Field label="Order"><Input type="number" value={cf.order_index} onChange={e => setCf(p => ({ ...p, order_index: +e.target.value }))} /></Field>
              <Toggle value={cf.is_visible} onChange={() => setCf(p => ({ ...p, is_visible: !p.is_visible }))} label="Visible to students" />
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setChapterModal(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm">Cancel</button>
              <button onClick={saveChapterModal} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {chapterModal.mode === 'add' ? 'Create' : 'Save'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mx-auto">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Delete {deleteTarget.type}?</h3>
                <p className="text-white/50 text-sm mt-2">
                  "<span className="text-white/80">{deleteTarget.label}</span>" and all its contents will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
                <button onClick={execDelete} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Note modal */}
      <AnimatePresence>
        {noteModal && (
          <NoteModal
            chapter={noteModal.chapter}
            subjectId={noteModal.subjectId}
            onClose={() => setNoteModal(null)}
            onSaved={onNoteSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
