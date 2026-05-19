import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BookOpen, Plus, X, ChevronRight,
  Edit2, Trash2, Check, Search, Eye, Copy, ArrowLeft,
  Users, CheckCircle2, Hash, BookMarked,
} from 'lucide-react';
import api from '../api';

const COLORS = ['#7c3aed','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#0ea5e9','#a855f7','#ec4899','#14b8a6'];
const ICONS  = ['📚','🧮','🔬','🌍','📖','✏️','🎨','🎵','💻','⚗️','🏛️','🔭','📐','🌿','📊','💡','🏆','⚖️'];
const DIFF_CONFIG = {
  easy:   { label: 'Easy',   color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  hard:   { label: 'Hard',   color: '#f43f5e', bg: 'rgba(244,63,94,0.15)'  },
};

function SkeletonCard() {
  return (
    <div className="card-premium rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/[0.06] rounded-lg w-2/3" />
          <div className="h-3 bg-white/[0.04] rounded-lg w-full" />
          <div className="h-3 bg-white/[0.04] rounded-lg w-4/5" />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <div className="h-8 bg-white/[0.04] rounded-xl flex-1" />
        <div className="h-8 bg-white/[0.04] rounded-xl flex-1" />
        <div className="h-8 bg-white/[0.04] rounded-xl flex-1" />
      </div>
    </div>
  );
}

export default function AdminSubjects() {
  const [subjects, setSubjects]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [subjectSearch, setSubjectSearch]   = useState('');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [sf, setSf]                         = useState({ name: '', description: '', icon: '📚', color: '#7c3aed', class_level: '', order_index: 0 });
  const [editSubjectModal, setEditSubjectModal] = useState(null);
  const [editSf, setEditSf]                 = useState({});
  const [deleteConfirm, setDeleteConfirm]   = useState(null);

  const [managingSubject, setManagingSubject]   = useState(null);
  const [managingChapters, setManagingChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading]   = useState(false);
  const [selectedChapter, setSelectedChapter]   = useState(null);
  const [chapterSearch, setChapterSearch]       = useState('');

  const [showChapterForm, setShowChapterForm] = useState(false);
  const [cf, setCf]                           = useState({ title: '', content: '', video_url: '', duration_minutes: '', order_index: 0, is_preview: false });
  const [editChapterModal, setEditChapterModal] = useState(null);
  const [editCf, setEditCf]                   = useState({});

  const [chapterMcqs, setChapterMcqs]     = useState([]);
  const [mcqLoading, setMcqLoading]       = useState(false);
  const [mcqSearch, setMcqSearch]         = useState('');
  const [mcqFilter, setMcqFilter]         = useState({ difficulty: 'all', status: 'all' });
  const [showMcqForm, setShowMcqForm]     = useState(false);
  const [editMcq, setEditMcq]             = useState(null);
  const [mcqSaving, setMcqSaving]         = useState(false);
  const [deleteMcqId, setDeleteMcqId]     = useState(null);
  const emptyMcqForm = { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '', difficulty: 'medium' };
  const [mcqForm, setMcqForm]             = useState(emptyMcqForm);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try { const r = await api.get('/subjects'); setSubjects(r.data); }
    finally { setLoading(false); }
  };

  const openManage = async (subject) => {
    setManagingSubject(subject);
    setSelectedChapter(null);
    setChapterMcqs([]);
    setChapterSearch('');
    setMcqSearch('');
    setMcqFilter({ difficulty: 'all', status: 'all' });
    setShowMcqForm(false);
    setShowChapterForm(false);
    setChaptersLoading(true);
    try {
      const r = await api.get(`/subjects/${subject.id}`);
      setManagingChapters(r.data.chapters || []);
    } catch { toast.error('Failed to load chapters'); }
    finally { setChaptersLoading(false); }
  };

  const closeManage = () => {
    setManagingSubject(null);
    setSelectedChapter(null);
    setManagingChapters([]);
    setChapterMcqs([]);
    setShowMcqForm(false);
    setShowChapterForm(false);
  };

  const selectChapter = async (ch) => {
    setSelectedChapter(ch);
    setMcqLoading(true);
    setShowMcqForm(false);
    setEditMcq(null);
    setMcqForm(emptyMcqForm);
    setMcqSearch('');
    setMcqFilter({ difficulty: 'all', status: 'all' });
    try { const r = await api.get(`/chapters/${ch.id}/mcqs`); setChapterMcqs(r.data); }
    catch { setChapterMcqs([]); }
    finally { setMcqLoading(false); }
  };

  const refreshChapters = async () => {
    if (!managingSubject) return;
    try {
      const r = await api.get(`/subjects/${managingSubject.id}`);
      setManagingChapters(r.data.chapters || []);
    } catch {}
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/subjects', sf);
      toast.success('Subject created!');
      setShowSubjectForm(false);
      setSf({ name: '', description: '', icon: '📚', color: '#7c3aed', class_level: '', order_index: 0 });
      fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const openEditSubject = (s, e) => {
    e?.stopPropagation();
    setEditSf({ name: s.name, description: s.description || '', icon: s.icon || '📚', color: s.color || '#7c3aed', class_level: s.class_level || '', order_index: s.order_index || 0 });
    setEditSubjectModal(s);
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/subjects/${editSubjectModal.id}`, editSf);
      toast.success('Subject updated!');
      setEditSubjectModal(null);
      fetchSubjects();
      if (managingSubject?.id === editSubjectModal.id) setManagingSubject(s => ({ ...s, ...editSf }));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDeleteSubject = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === 'subject') {
        await api.delete(`/subjects/${deleteConfirm.id}`);
        toast.success('Subject deleted');
        if (managingSubject?.id === deleteConfirm.id) closeManage();
      } else {
        await api.delete(`/chapters/${deleteConfirm.id}`);
        toast.success('Chapter deleted');
        setManagingChapters(prev => prev.filter(c => c.id !== deleteConfirm.id));
        if (selectedChapter?.id === deleteConfirm.id) { setSelectedChapter(null); setChapterMcqs([]); }
      }
      setDeleteConfirm(null);
      fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete'); }
    finally { setSaving(false); }
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/chapters', { ...cf, subject_id: managingSubject.id, duration_minutes: parseInt(cf.duration_minutes) || 0 });
      toast.success('Chapter added!');
      setShowChapterForm(false);
      setCf({ title: '', content: '', video_url: '', duration_minutes: '', order_index: 0, is_preview: false });
      await refreshChapters();
      fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const openEditChapter = (ch, e) => {
    e?.stopPropagation();
    setEditCf({ title: ch.title, content: ch.content || '', video_url: ch.video_url || '', duration_minutes: ch.duration_minutes || '', order_index: ch.order_index || 0, is_preview: ch.is_preview || false });
    setEditChapterModal(ch);
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/chapters/${editChapterModal.id}`, { ...editCf, duration_minutes: parseInt(editCf.duration_minutes) || 0 });
      toast.success('Chapter updated!');
      setEditChapterModal(null);
      await refreshChapters();
      if (selectedChapter?.id === editChapterModal.id) setSelectedChapter(c => ({ ...c, ...editCf }));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleSaveMcq = async (e) => {
    e.preventDefault(); setMcqSaving(true);
    try {
      if (editMcq) {
        await api.put(`/mcqs/${editMcq.id}`, mcqForm);
        toast.success('MCQ updated!');
      } else {
        await api.post('/mcqs', { ...mcqForm, chapter_id: selectedChapter.id });
        toast.success('MCQ added!');
      }
      setShowMcqForm(false); setEditMcq(null); setMcqForm(emptyMcqForm);
      const r = await api.get(`/chapters/${selectedChapter.id}/mcqs`);
      setChapterMcqs(r.data);
      await refreshChapters();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save MCQ'); }
    finally { setMcqSaving(false); }
  };

  const openEditMcq = (mcq) => {
    setEditMcq(mcq);
    setMcqForm({ question: mcq.question, option_a: mcq.option_a, option_b: mcq.option_b, option_c: mcq.option_c, option_d: mcq.option_d, correct_answer: mcq.correct_answer, explanation: mcq.explanation || '', difficulty: mcq.difficulty || 'medium' });
    setShowMcqForm(true);
  };

  const handleDeleteMcq = async (id) => {
    try {
      await api.delete(`/mcqs/${id}`);
      toast.success('MCQ deleted');
      setChapterMcqs(prev => prev.filter(m => m.id !== id));
      setDeleteMcqId(null);
      await refreshChapters();
    } catch { toast.error('Failed to delete MCQ'); }
  };

  const handleToggleMcqPublish = async (mcq) => {
    try {
      await api.put(`/mcqs/${mcq.id}`, { ...mcq, is_active: !mcq.is_active });
      setChapterMcqs(prev => prev.map(m => m.id === mcq.id ? { ...m, is_active: !m.is_active } : m));
      toast.success(mcq.is_active ? 'MCQ unpublished' : 'MCQ published');
      await refreshChapters();
    } catch { toast.error('Failed to update MCQ status'); }
  };

  const handleDuplicateMcq = async (mcq) => {
    try {
      await api.post('/mcqs', {
        question: `${mcq.question} (copy)`,
        option_a: mcq.option_a, option_b: mcq.option_b,
        option_c: mcq.option_c, option_d: mcq.option_d,
        correct_answer: mcq.correct_answer,
        explanation: mcq.explanation || '',
        difficulty: mcq.difficulty || 'medium',
        chapter_id: selectedChapter.id,
      });
      toast.success('MCQ duplicated');
      const r = await api.get(`/chapters/${selectedChapter.id}/mcqs`);
      setChapterMcqs(r.data);
      await refreshChapters();
    } catch { toast.error('Failed to duplicate MCQ'); }
  };

  const filteredSubjects = useMemo(() =>
    subjects.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(subjectSearch.toLowerCase())),
    [subjects, subjectSearch]
  );

  const filteredChapters = useMemo(() =>
    managingChapters.filter(c => c.title.toLowerCase().includes(chapterSearch.toLowerCase())),
    [managingChapters, chapterSearch]
  );

  const filteredMcqs = useMemo(() => {
    let list = chapterMcqs;
    if (mcqFilter.difficulty !== 'all') list = list.filter(m => m.difficulty === mcqFilter.difficulty);
    if (mcqFilter.status === 'published') list = list.filter(m => m.is_active !== false);
    if (mcqFilter.status === 'draft') list = list.filter(m => m.is_active === false);
    if (mcqSearch) list = list.filter(m => m.question.toLowerCase().includes(mcqSearch.toLowerCase()));
    return list;
  }, [chapterMcqs, mcqFilter, mcqSearch]);

  const mcqStats = useMemo(() => {
    const total     = chapterMcqs.length;
    const published = chapterMcqs.filter(m => m.is_active !== false).length;
    const draft     = chapterMcqs.filter(m => m.is_active === false).length;
    const easy      = chapterMcqs.filter(m => m.difficulty === 'easy').length;
    const medium    = chapterMcqs.filter(m => m.difficulty === 'medium').length;
    const hard      = chapterMcqs.filter(m => m.difficulty === 'hard').length;
    return { total, published, draft, easy, medium, hard };
  }, [chapterMcqs]);

  return (
    <div className="px-4 lg:px-8 pb-8">

      <AnimatePresence mode="wait">
        {!managingSubject ? (
          <motion.div key="grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black text-white mb-1">Subjects & Chapters</h1>
                <p className="text-white/35 text-sm">Manage subjects, chapters, and MCQ content for students.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)}
                    placeholder="Search subjects…"
                    className="input-field pl-9 h-10 w-52 text-sm" />
                </div>
                <button onClick={() => setShowSubjectForm(true)} className="btn-primary flex items-center gap-2 h-10">
                  <Plus className="w-4 h-4" /> New Subject
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Subjects', value: subjects.length, icon: BookOpen, color: '#8b5cf6' },
                { label: 'Total Chapters', value: subjects.reduce((a, s) => a + parseInt(s.chapter_count || 0), 0), icon: BookMarked, color: '#06b6d4' },
                { label: 'Students Enrolled', value: subjects.reduce((a, s) => a + parseInt(s.student_count || 0), 0), icon: Users, color: '#10b981' },
              ].map(stat => (
                <div key={stat.label} className="card-premium rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}18` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-xs text-white/35">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subjects grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-24 card-premium rounded-3xl">
                <BookOpen className="w-14 h-14 text-white/15 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {subjectSearch ? 'No subjects found' : 'No subjects yet'}
                </h3>
                <p className="text-white/35 text-sm mb-6">
                  {subjectSearch ? 'Try a different search term.' : 'Create your first subject to get started.'}
                </p>
                {!subjectSearch && (
                  <button onClick={() => setShowSubjectForm(true)} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Subject
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubjects.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="card-premium rounded-2xl overflow-hidden group hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
                    style={{ borderLeft: `3px solid ${s.color || '#7c3aed'}` }}>
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: `${s.color || '#7c3aed'}15`, border: `1px solid ${s.color || '#7c3aed'}25` }}>
                          {s.icon || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="text-white font-bold text-base truncate">{s.name}</h3>
                            {s.class_level && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: `${s.color || '#7c3aed'}18`, color: s.color || '#a78bfa', border: `1px solid ${s.color || '#7c3aed'}25` }}>
                                {isNaN(s.class_level) ? `CA ${s.class_level}` : `Class ${s.class_level}`}
                              </span>
                            )}
                          </div>
                          <p className="text-white/40 text-xs line-clamp-2">{s.description || 'No description provided'}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => openEditSubject(s, e)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/30 hover:text-purple-400 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'subject', id: s.id, name: s.name }); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/[0.12] text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'Chapters', value: s.chapter_count || 0, icon: BookMarked, color: '#8b5cf6' },
                          { label: 'Students', value: s.student_count || 0, icon: Users, color: '#06b6d4' },
                          { label: 'MCQs', value: parseInt(s.total_mcqs || 0), icon: Hash, color: '#10b981' },
                        ].map(stat => (
                          <div key={stat.label} className="rounded-xl px-3 py-2 text-center" style={{ background: `${stat.color}0d`, border: `1px solid ${stat.color}18` }}>
                            <div className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-[10px] text-white/35">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => openManage(s)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: `${s.color || '#7c3aed'}15`, color: s.color || '#a78bfa', border: `1px solid ${s.color || '#7c3aed'}25` }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${s.color || '#7c3aed'}25`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${s.color || '#7c3aed'}15`; }}>
                        Manage Content <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="manage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Management header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={closeManage}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/[0.06]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="h-5 w-px bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg text-lg flex items-center justify-center"
                    style={{ background: `${managingSubject.color || '#7c3aed'}15` }}>
                    {managingSubject.icon || '📚'}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-none">{managingSubject.name}</h2>
                    <p className="text-white/35 text-xs mt-0.5">{managingChapters.length} chapters</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditSubject(managingSubject)}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Subject
                </button>
                <button onClick={() => setShowChapterForm(true)}
                  className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                  <Plus className="w-4 h-4" /> Add Chapter
                </button>
              </div>
            </div>

            {/* 3-panel layout */}
            <div className="flex gap-4 items-start">

              {/* LEFT: Chapter Sidebar */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-2">
                <div className="card-premium rounded-2xl overflow-hidden">
                  <div className="p-3 border-b border-white/[0.05]">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Chapters</p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                      <input value={chapterSearch} onChange={e => setChapterSearch(e.target.value)}
                        placeholder="Search chapters…"
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-purple-500/40" />
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
                    {chaptersLoading ? (
                      <div className="p-4 space-y-2">
                        {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />)}
                      </div>
                    ) : filteredChapters.length === 0 ? (
                      <div className="p-4 text-center text-white/25 text-xs">
                        {chapterSearch ? 'No chapters match your search.' : 'No chapters yet.'}
                      </div>
                    ) : (
                      <div className="p-2 flex flex-col gap-1">
                        {filteredChapters.map((ch, i) => {
                          const isActive = selectedChapter?.id === ch.id;
                          const mcqCount = parseInt(ch.total_mcqs || 0);
                          return (
                            <div key={ch.id}
                              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-purple-500/15 border border-purple-500/25' : 'hover:bg-white/[0.04] border border-transparent'}`}
                              onClick={() => selectChapter(ch)}>
                              <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                style={isActive
                                  ? { background: `${managingSubject.color || '#7c3aed'}25`, color: managingSubject.color || '#a78bfa' }
                                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-white/55'}`}>{ch.title}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {ch.is_preview && <span className="text-[9px] text-emerald-400">Free</span>}
                                  {ch.duration_minutes > 0 && <span className="text-[9px] text-white/25">{ch.duration_minutes}m</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0"
                                  style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>
                                  {mcqCount}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={e => openEditChapter(ch, e)}
                                    className="p-1 rounded-lg hover:bg-blue-500/15 text-white/25 hover:text-blue-400 transition-colors">
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'chapter', id: ch.id, name: ch.title }); }}
                                    className="p-1 rounded-lg hover:bg-red-500/15 text-white/20 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {showChapterForm && (
                    <div className="border-t border-white/[0.05] p-3">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">New Chapter</p>
                      <form onSubmit={handleSaveChapter} className="flex flex-col gap-2">
                        <input required placeholder="Chapter title *" value={cf.title}
                          onChange={e => setCf(p => ({ ...p, title: e.target.value }))}
                          className="input-field text-xs py-2" />
                        <input placeholder="Video URL (optional)" value={cf.video_url}
                          onChange={e => setCf(p => ({ ...p, video_url: e.target.value }))}
                          className="input-field text-xs py-2" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" min="0" placeholder="Duration (min)" value={cf.duration_minutes}
                            onChange={e => setCf(p => ({ ...p, duration_minutes: e.target.value }))}
                            className="input-field text-xs py-2" />
                          <input type="number" min="0" placeholder="Order" value={cf.order_index}
                            onChange={e => setCf(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                            className="input-field text-xs py-2" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={cf.is_preview}
                            onChange={e => setCf(p => ({ ...p, is_preview: e.target.checked }))}
                            className="w-3.5 h-3.5 accent-purple-500" />
                          <span className="text-xs text-white/45">Free preview</span>
                        </label>
                        <div className="flex gap-2 mt-1">
                          <button type="button" onClick={() => setShowChapterForm(false)}
                            className="flex-1 btn-outline py-2 text-xs">Cancel</button>
                          <button type="submit" disabled={saving}
                            className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1">
                            {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER: MCQ Manager */}
              <div className="flex-1 min-w-0">
                <div className="card-premium rounded-2xl overflow-hidden">
                  {!selectedChapter ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                        <BookMarked className="w-7 h-7 text-white/20" />
                      </div>
                      <h3 className="text-white/50 font-semibold mb-1">Select a Chapter</h3>
                      <p className="text-white/25 text-sm">Click a chapter on the left to view and manage its MCQs.</p>
                    </div>
                  ) : (
                    <>
                      {/* Chapter header */}
                      <div className="p-4 border-b border-white/[0.05] flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                            style={{ background: `${managingSubject.color || '#7c3aed'}15`, color: managingSubject.color || '#a78bfa' }}>
                            {managingChapters.findIndex(c => c.id === selectedChapter.id) + 1}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm leading-none">{selectedChapter.title}</h3>
                            <p className="text-white/35 text-xs mt-0.5">{chapterMcqs.length} MCQs total</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setShowMcqForm(true); setEditMcq(null); setMcqForm(emptyMcqForm); }}
                            className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3">
                            <Plus className="w-3.5 h-3.5" /> Add MCQ
                          </button>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-40">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                          <input value={mcqSearch} onChange={e => setMcqSearch(e.target.value)}
                            placeholder="Search MCQs…"
                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-purple-500/40" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {['all','easy','medium','hard'].map(d => (
                            <button key={d} onClick={() => setMcqFilter(f => ({ ...f, difficulty: d }))}
                              className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all"
                              style={mcqFilter.difficulty === d
                                ? { background: d === 'all' ? 'rgba(139,92,246,0.2)' : DIFF_CONFIG[d]?.bg, color: d === 'all' ? '#a78bfa' : DIFF_CONFIG[d]?.color, border: `1px solid ${d === 'all' ? 'rgba(139,92,246,0.35)' : DIFF_CONFIG[d]?.color + '45'}` }
                                : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              {d === 'all' ? 'All' : d}
                            </button>
                          ))}
                          <div className="w-px h-4 bg-white/10" />
                          {['all','published','draft'].map(s => (
                            <button key={s} onClick={() => setMcqFilter(f => ({ ...f, status: s }))}
                              className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all"
                              style={mcqFilter.status === s
                                ? { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }
                                : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* MCQ Form */}
                      <AnimatePresence>
                        {showMcqForm && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-b border-white/[0.05]">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-white">{editMcq ? 'Edit MCQ' : 'New MCQ'}</h4>
                                <button onClick={() => { setShowMcqForm(false); setEditMcq(null); }}
                                  className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors">
                                  <X className="w-3.5 h-3.5 text-white/40" />
                                </button>
                              </div>
                              <form onSubmit={handleSaveMcq} className="flex flex-col gap-3">
                                <textarea required placeholder="Question text…" value={mcqForm.question}
                                  onChange={e => setMcqForm(p => ({ ...p, question: e.target.value }))}
                                  className="input-field resize-none text-sm" rows={2} />
                                <div className="grid grid-cols-2 gap-2">
                                  {['A','B','C','D'].map(opt => (
                                    <div key={opt} className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                                        style={{ color: mcqForm.correct_answer === opt ? '#10b981' : 'rgba(255,255,255,0.3)' }}>
                                        {opt}.
                                      </span>
                                      <input required placeholder={`Option ${opt}`}
                                        value={mcqForm[`option_${opt.toLowerCase()}`]}
                                        onChange={e => setMcqForm(p => ({ ...p, [`option_${opt.toLowerCase()}`]: e.target.value }))}
                                        className="input-field pl-8 text-sm"
                                        style={mcqForm.correct_answer === opt ? { borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.05)' } : {}} />
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Correct Answer</label>
                                    <div className="flex gap-1.5">
                                      {['A','B','C','D'].map(opt => (
                                        <button key={opt} type="button" onClick={() => setMcqForm(p => ({ ...p, correct_answer: opt }))}
                                          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                                          style={mcqForm.correct_answer === opt
                                            ? { background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)' }
                                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Difficulty</label>
                                    <select value={mcqForm.difficulty} onChange={e => setMcqForm(p => ({ ...p, difficulty: e.target.value }))}
                                      className="input-field text-sm">
                                      <option value="easy">Easy</option>
                                      <option value="medium">Medium</option>
                                      <option value="hard">Hard</option>
                                    </select>
                                  </div>
                                </div>
                                <textarea placeholder="Explanation (optional)…" value={mcqForm.explanation}
                                  onChange={e => setMcqForm(p => ({ ...p, explanation: e.target.value }))}
                                  className="input-field resize-none text-sm" rows={2} />
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => { setShowMcqForm(false); setEditMcq(null); }}
                                    className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
                                  <button type="submit" disabled={mcqSaving}
                                    className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                    {mcqSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editMcq ? 'Save Changes' : 'Add MCQ'}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* MCQ List */}
                      <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                        {mcqLoading ? (
                          <div className="p-4 space-y-2">
                            {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />)}
                          </div>
                        ) : filteredMcqs.length === 0 ? (
                          <div className="p-10 text-center">
                            <Hash className="w-8 h-8 text-white/15 mx-auto mb-2" />
                            <p className="text-white/35 text-sm">
                              {mcqSearch || mcqFilter.difficulty !== 'all' || mcqFilter.status !== 'all'
                                ? 'No MCQs match your filters.' : 'No MCQs yet — click "Add MCQ" to create the first one.'}
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/[0.04]">
                            {filteredMcqs.map((mcq, i) => {
                              const diff = DIFF_CONFIG[mcq.difficulty] || DIFF_CONFIG.medium;
                              const isPublished = mcq.is_active !== false;
                              return (
                                <div key={mcq.id} className="flex items-start gap-3 px-4 py-3 group hover:bg-white/[0.02] transition-colors">
                                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                                    style={{ background: `${managingSubject.color || '#7c3aed'}12`, color: managingSubject.color || '#a78bfa' }}>
                                    {i + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white/80 text-sm font-medium line-clamp-2 leading-snug">{mcq.question}</p>
                                    <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: diff.bg, color: diff.color }}>
                                        {diff.label}
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-400">✓ {mcq.correct_answer}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPublished ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
                                        {isPublished ? 'Published' : 'Draft'}
                                      </span>
                                      {mcq.explanation && <span className="text-[10px] text-white/25">Has explanation</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button onClick={() => openEditMcq(mcq)} title="Edit"
                                      className="p-1.5 rounded-lg hover:bg-blue-500/15 text-white/25 hover:text-blue-400 transition-colors">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDuplicateMcq(mcq)} title="Duplicate"
                                      className="p-1.5 rounded-lg hover:bg-purple-500/15 text-white/25 hover:text-purple-400 transition-colors">
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleToggleMcqPublish(mcq)} title={isPublished ? 'Unpublish' : 'Publish'}
                                      className={`p-1.5 rounded-lg transition-colors ${isPublished ? 'hover:bg-orange-500/15 text-white/25 hover:text-orange-400' : 'hover:bg-emerald-500/15 text-white/25 hover:text-emerald-400'}`}>
                                      {isPublished ? <Eye className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => setDeleteMcqId(mcq.id)} title="Delete"
                                      className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/20 hover:text-red-400 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {filteredMcqs.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
                          <span className="text-xs text-white/30">Showing {filteredMcqs.length} of {chapterMcqs.length} MCQs</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT: Analytics Panel */}
              <div className="w-52 flex-shrink-0 flex flex-col gap-3">
                <div className="card-premium rounded-2xl p-4">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Subject Stats</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Chapters', value: managingChapters.length, icon: BookMarked, color: '#8b5cf6' },
                      { label: 'Students', value: managingSubject.student_count || 0, icon: Users, color: '#06b6d4' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                          <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-white leading-none">{s.value}</div>
                          <div className="text-[10px] text-white/35">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedChapter && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="card-premium rounded-2xl p-4">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Chapter MCQs</p>
                    <div className="space-y-2 mb-3">
                      {[
                        { label: 'Total', value: mcqStats.total, color: '#8b5cf6' },
                        { label: 'Published', value: mcqStats.published, color: '#10b981' },
                        { label: 'Draft', value: mcqStats.draft, color: '#f59e0b' },
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                          <span className="text-xs text-white/40">{s.label}</span>
                          <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                    {mcqStats.total > 0 && (
                      <>
                        <div className="h-px bg-white/[0.05] mb-3" />
                        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">By Difficulty</p>
                        {[
                          { key: 'easy',   label: 'Easy',   count: mcqStats.easy,   color: '#10b981' },
                          { key: 'medium', label: 'Medium', count: mcqStats.medium, color: '#f59e0b' },
                          { key: 'hard',   label: 'Hard',   count: mcqStats.hard,   color: '#f43f5e' },
                        ].map(d => (
                          <div key={d.key} className="mb-2">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span style={{ color: d.color }}>{d.label}</span>
                              <span className="text-white/40">{d.count}</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/[0.06]">
                              <div className="h-full rounded-full transition-all" style={{ width: mcqStats.total ? `${(d.count / mcqStats.total) * 100}%` : '0%', background: d.color }} />
                            </div>
                          </div>
                        ))}
                        <div className="h-px bg-white/[0.05] my-3" />
                        <div className="text-center">
                          <div className="text-xl font-black text-white">{mcqStats.total > 0 ? Math.round((mcqStats.published / mcqStats.total) * 100) : 0}%</div>
                          <div className="text-[10px] text-white/35">Published</div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] mt-2">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all"
                              style={{ width: mcqStats.total ? `${(mcqStats.published / mcqStats.total) * 100}%` : '0%' }} />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {editSubjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-navy rounded-3xl p-8 w-full max-w-lg border border-purple-500/15 shadow-premium max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Subject</h2>
                  <p className="text-white/35 text-sm mt-0.5">Update subject details</p>
                </div>
                <button onClick={() => setEditSubjectModal(null)} className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <form onSubmit={handleUpdateSubject} className="flex flex-col gap-5">
                <input required placeholder="Subject name" value={editSf.name}
                  onChange={e => setEditSf(p => ({ ...p, name: e.target.value }))} className="input-field" />
                <textarea placeholder="Brief description…" value={editSf.description}
                  onChange={e => setEditSf(p => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none" rows={3} />
                <div>
                  <label className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2.5 block">Subject Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button type="button" key={icon} onClick={() => setEditSf(p => ({ ...p, icon }))}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${editSf.icon === icon ? 'scale-110 ring-2 ring-purple-500 bg-purple-500/20' : 'glass border border-white/[0.06] hover:border-white/25 hover:scale-105'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2.5 block">Subject Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button type="button" key={color} onClick={() => setEditSf(p => ({ ...p, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${editSf.color === color ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-navy-900' : 'hover:scale-110'}`}
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Level</label>
                    <select value={editSf.class_level} onChange={e => setEditSf(p => ({ ...p, class_level: e.target.value }))}
                      className="input-field" style={{ background: 'rgba(255,255,255,0.04)', color: 'white' }}>
                      <option value="" style={{ background: '#06112e' }}>All Levels</option>
                      {['Certificate','Professional','Advanced'].map(c => (
                        <option key={c} value={c} style={{ background: '#06112e' }}>{isNaN(c) ? `CA ${c}` : `Class ${c}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Display Order</label>
                    <input type="number" min="0" value={editSf.order_index}
                      onChange={e => setEditSf(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditSubjectModal(null)} className="flex-1 btn-outline py-3">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Chapter Modal */}
      <AnimatePresence>
        {editChapterModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-navy rounded-3xl p-8 w-full max-w-lg border border-purple-500/15 shadow-premium max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Chapter</h2>
                  <p className="text-white/35 text-sm mt-0.5">Update chapter details</p>
                </div>
                <button onClick={() => setEditChapterModal(null)} className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <form onSubmit={handleUpdateChapter} className="flex flex-col gap-4">
                <input required placeholder="Chapter title" value={editCf.title}
                  onChange={e => setEditCf(p => ({ ...p, title: e.target.value }))} className="input-field" />
                <textarea placeholder="Chapter content…" value={editCf.content}
                  onChange={e => setEditCf(p => ({ ...p, content: e.target.value }))}
                  className="input-field resize-none" rows={4} />
                <input placeholder="Video URL (YouTube embed, optional)" value={editCf.video_url}
                  onChange={e => setEditCf(p => ({ ...p, video_url: e.target.value }))} className="input-field" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Duration (minutes)</label>
                    <input type="number" min="0" value={editCf.duration_minutes}
                      onChange={e => setEditCf(p => ({ ...p, duration_minutes: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Display Order</label>
                    <input type="number" min="0" value={editCf.order_index}
                      onChange={e => setEditCf(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} className="input-field" />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={editCf.is_preview}
                    onChange={e => setEditCf(p => ({ ...p, is_preview: e.target.checked }))}
                    className="w-4 h-4 accent-purple-500" />
                  <span className="text-sm text-white/55">Free preview (visible without enrollment)</span>
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setEditChapterModal(null)} className="flex-1 btn-outline py-3">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Save Chapter</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-navy rounded-2xl p-6 w-full max-w-sm border border-red-500/20 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                Delete {deleteConfirm.type === 'subject' ? 'Subject' : 'Chapter'}?
              </h3>
              <p className="text-white/45 text-sm mb-5">
                <span className="text-white/70 font-medium">"{deleteConfirm.name}"</span> will be permanently deleted.
                {deleteConfirm.type === 'subject' && ' All chapters and MCQs within it will also be removed.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
                <button onClick={handleDeleteSubject} disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25 transition-colors disabled:opacity-50">
                  {saving ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete MCQ confirmation */}
      <AnimatePresence>
        {deleteMcqId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-navy rounded-2xl p-6 w-full max-w-sm border border-red-500/20">
              <Trash2 className="w-8 h-8 text-red-400 mb-3" />
              <h3 className="text-white font-bold mb-1">Delete this MCQ?</h3>
              <p className="text-white/40 text-sm mb-4">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteMcqId(null)} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
                <button onClick={() => handleDeleteMcq(deleteMcqId)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Subject Modal */}
      <AnimatePresence>
        {showSubjectForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-navy rounded-3xl p-8 w-full max-w-lg border border-purple-500/15 shadow-premium max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Subject</h2>
                  <p className="text-white/35 text-sm mt-0.5">Add a new subject to the platform</p>
                </div>
                <button onClick={() => setShowSubjectForm(false)} className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <form onSubmit={handleSaveSubject} className="flex flex-col gap-5">
                <input required placeholder="Subject name (e.g. Financial Reporting)" value={sf.name}
                  onChange={e => setSf(p => ({ ...p, name: e.target.value }))} className="input-field" />
                <textarea placeholder="Brief description…" value={sf.description}
                  onChange={e => setSf(p => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none" rows={3} />
                <div>
                  <label className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2.5 block">Subject Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button type="button" key={icon} onClick={() => setSf(p => ({ ...p, icon }))}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${sf.icon === icon ? 'scale-110 ring-2 ring-purple-500 bg-purple-500/20' : 'glass border border-white/[0.06] hover:border-white/25 hover:scale-105'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2.5 block">Subject Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button type="button" key={color} onClick={() => setSf(p => ({ ...p, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${sf.color === color ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-navy-900' : 'hover:scale-110'}`}
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Level</label>
                    <select value={sf.class_level} onChange={e => setSf(p => ({ ...p, class_level: e.target.value }))}
                      className="input-field" style={{ background: 'rgba(255,255,255,0.04)', color: 'white' }}>
                      <option value="" style={{ background: '#06112e' }}>All Levels</option>
                      {['Certificate','Professional','Advanced'].map(c => (
                        <option key={c} value={c} style={{ background: '#06112e' }}>{isNaN(c) ? `CA ${c}` : `Class ${c}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Display Order</label>
                    <input type="number" min="0" value={sf.order_index}
                      onChange={e => setSf(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowSubjectForm(false)} className="flex-1 btn-outline py-3">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Create Subject</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
