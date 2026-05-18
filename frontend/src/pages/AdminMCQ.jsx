import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Brain, Plus, X, Edit2, Trash2, Upload, FileText, Type,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, Eye,
  Save, RefreshCw, BarChart3, Bell, BookOpen, Home, LogOut,
  Menu, Shield, Filter, Search, Loader2, History, GraduationCap, Layers,
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

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

const emptyForm = {
  subject_id: '', chapter_id: '', question: '',
  option_a: '', option_b: '', option_c: '', option_d: '',
  correct_option: 'A', explanation: '', difficulty: 'medium'
};

/* ─── Single MCQ Form ─── */
function SingleMCQForm({ subjects, onSaved, editItem, onCancelEdit }) {
  const [form, setForm] = useState(editItem || emptyForm);
  const [chapters, setChapters] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) setForm(editItem);
  }, [editItem]);

  useEffect(() => {
    if (form.subject_id) {
      api.get(`/subjects/${form.subject_id}/chapters`).then(r => setChapters(r.data)).catch(() => {});
    } else { setChapters([]); }
  }, [form.subject_id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d || !form.correct_option) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      if (editItem?.id) {
        await api.put(`/mcqs/${editItem.id}`, form);
        toast.success('MCQ updated!');
      } else {
        await api.post('/mcqs', form);
        toast.success('MCQ added!');
        setForm(emptyForm);
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40 mb-1.5 block font-medium">Subject *</label>
          <select value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value, chapter_id: '' }))}
            className="input-field" style={{ background: 'rgba(255,255,255,0.04)', color: 'white' }} required>
            <option value="" style={{ background: '#06112e' }}>Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#06112e' }}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1.5 block font-medium">Chapter *</label>
          <select value={form.chapter_id} onChange={e => setForm(p => ({ ...p, chapter_id: e.target.value }))}
            className="input-field" style={{ background: 'rgba(255,255,255,0.04)', color: 'white' }} required>
            <option value="" style={{ background: '#06112e' }}>Select Chapter</option>
            {chapters.map(c => <option key={c.id} value={c.id} style={{ background: '#06112e' }}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/40 mb-1.5 block font-medium">Question *</label>
        <textarea value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
          className="input-field resize-none" rows={3} placeholder="Enter the MCQ question..." required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OPTION_KEYS.map((key, idx) => (
          <div key={key}>
            <label className="text-xs text-white/40 mb-1.5 flex items-center gap-1.5 font-medium">
              <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${form.correct_option === OPTION_LABELS[idx] ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.06] text-white/35'}`}>
                {OPTION_LABELS[idx]}
              </span>
              Option {OPTION_LABELS[idx]} *
            </label>
            <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="input-field" placeholder={`Option ${OPTION_LABELS[idx]}`} required />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40 mb-1.5 block font-medium">Correct Answer *</label>
          <div className="grid grid-cols-4 gap-2">
            {OPTION_LABELS.map(l => (
              <button type="button" key={l} onClick={() => setForm(p => ({ ...p, correct_option: l }))}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${form.correct_option === l ? 'bg-emerald-500/25 text-emerald-400 border-emerald-500/35 scale-[1.03]' : 'glass border-white/[0.08] text-white/40 hover:border-emerald-500/20'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1.5 block font-medium">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {[['easy','#10b981'],['medium','#f59e0b'],['hard','#f43f5e']].map(([d, color]) => (
              <button type="button" key={d} onClick={() => setForm(p => ({ ...p, difficulty: d }))}
                className={`py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all ${form.difficulty === d ? 'scale-[1.03]' : 'glass border-white/[0.08] text-white/40'}`}
                style={form.difficulty === d ? { background: `${color}18`, color, borderColor: `${color}35` } : {}}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/40 mb-1.5 block font-medium">Explanation (optional)</label>
        <textarea value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
          className="input-field resize-none" rows={3} placeholder="Explain why the correct answer is right..." />
      </div>

      <div className="flex gap-3 pt-1">
        {editItem && (
          <button type="button" onClick={onCancelEdit} className="btn-outline py-3 px-5 text-sm">Cancel Edit</button>
        )}
        <button type="submit" disabled={saving}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editItem ? <><Save className="w-4 h-4" /> Update MCQ</> : <><Plus className="w-4 h-4" /> Add MCQ</>}
        </button>
      </div>
    </form>
  );
}

/* ─── Bulk Import Panel ─── */
function BulkImportPanel({ subjects, onImported }) {
  const [inputType, setInputType] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [parsed, setParsed] = useState([]);
  const [errors, setErrors] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [targetSubject, setTargetSubject] = useState('');
  const [targetChapter, setTargetChapter] = useState('');
  const [chapters, setChapters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (targetSubject) {
      api.get(`/subjects/${targetSubject}/chapters`).then(r => setChapters(r.data)).catch(() => {});
    } else { setChapters([]); }
  }, [targetSubject]);

  const handleParse = async () => {
    setParsing(true); setPreviewing(false); setImportResult(null);
    try {
      let response;
      if (inputType === 'text') {
        response = await api.post('/mcqs/bulk-import/parse', { text });
      } else {
        const fd = new FormData();
        fd.append('file', file);
        response = await api.post('/mcqs/bulk-import/parse', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setParsed(response.data.questions);
      setErrors(response.data.errors || []);
      setPreviewing(true);
      toast.success(`Parsed ${response.data.total_parsed} questions`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Parsing failed');
    } finally { setParsing(false); }
  };

  const updateParsedQ = (idx, field, value) => {
    setParsed(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const removeParsedQ = (idx) => setParsed(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!targetSubject || !targetChapter) { toast.error('Select subject and chapter'); return; }
    if (!parsed.length) { toast.error('No questions to import'); return; }
    setSaving(true);
    try {
      const r = await api.post('/mcqs/bulk-import/save', {
        questions: parsed,
        subject_id: targetSubject,
        chapter_id: targetChapter,
        source_type: inputType,
        filename: file?.name || 'text_paste',
      });
      setImportResult(r.data);
      toast.success(`Imported ${r.data.imported} MCQs!`);
      onImported?.();
      setPreviewing(false); setParsed([]); setText(''); setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally { setSaving(false); }
  };

  const EXAMPLE_TEXT = `Q1. What is the primary objective of financial reporting?
A) To maximize profits
B) To provide useful information to investors and creditors
C) To minimize tax liability
D) To satisfy regulatory requirements
Answer: B
Explanation: Financial reporting aims to provide decision-useful information to investors, creditors, and other stakeholders.

Q2. Which accounting standard deals with presentation of financial statements?
A) Ind AS 2
B) Ind AS 7
C) Ind AS 1
D) Ind AS 16
Answer: C
Explanation: Ind AS 1 prescribes the basis for presentation of general purpose financial statements.`;

  return (
    <div className="flex flex-col gap-5">
      {/* Input type selector */}
      <div>
        <label className="text-xs text-white/40 mb-2.5 block font-medium uppercase tracking-wide">Import Source</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'text', label: 'Paste Text', icon: <Type className="w-4 h-4" /> },
            { val: 'pdf', label: 'PDF File', icon: <FileText className="w-4 h-4" /> },
            { val: 'docx', label: 'DOCX File', icon: <FileText className="w-4 h-4" /> },
          ].map(t => (
            <button type="button" key={t.val} onClick={() => { setInputType(t.val); setPreviewing(false); }}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-semibold transition-all ${inputType === t.val ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'glass border-white/[0.06] text-white/40 hover:border-white/15'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {inputType === 'text' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-white/40 font-medium">Paste MCQs (1–500 questions)</label>
            <button type="button" onClick={() => setText(EXAMPLE_TEXT)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Load example</button>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            className="input-field resize-none font-mono text-xs leading-relaxed" rows={14}
            placeholder={`Paste questions in any format:\n\nQ1. Question text here\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\nAnswer: B\nExplanation: Because...\n\n(empty line between questions)`} />
          <p className="text-xs text-white/25 mt-1.5">Supports formats: Q1./1./Q. prefixes, A)/A./a) options, Answer:/Ans:/Correct: keys</p>
        </div>
      )}

      {(inputType === 'pdf' || inputType === 'docx') && (
        <div>
          <label className="text-xs text-white/40 mb-2 block font-medium">Upload File</label>
          <div onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${file ? 'border-purple-500/40 bg-purple-500/[0.06]' : 'border-white/[0.1] hover:border-purple-500/30'}`}>
            <Upload className={`w-8 h-8 mx-auto mb-3 ${file ? 'text-purple-400' : 'text-white/25'}`} />
            {file ? (
              <div>
                <p className="text-white font-semibold text-sm">{file.name}</p>
                <p className="text-white/35 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-white/50 text-sm">Click to upload {inputType.toUpperCase()}</p>
                <p className="text-white/25 text-xs mt-1">Max 10MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" className="hidden"
            accept={inputType === 'pdf' ? '.pdf' : '.docx'}
            onChange={e => setFile(e.target.files[0])} />
        </div>
      )}

      <button type="button" onClick={handleParse}
        disabled={parsing || (!text.trim() && !file)}
        className="btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-40">
        {parsing ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing…</> : <><Eye className="w-4 h-4" /> Parse & Preview</>}
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="glass-navy rounded-xl p-4 border border-amber-500/15">
          <p className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {errors.length} parse warning(s)</p>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {errors.map((e, i) => <p key={i} className="text-xs text-white/35">{e}</p>)}
          </div>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className="glass-navy rounded-xl p-4 border border-emerald-500/15">
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Imported {importResult.imported} of {importResult.total} questions
          </p>
        </div>
      )}

      {/* Preview */}
      {previewing && parsed.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" /> Preview — {parsed.length} questions parsed
            </h3>
            <div className="flex items-center gap-2">
              <select value={targetSubject} onChange={e => setTargetSubject(e.target.value)}
                className="input-field py-2 text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'white', minWidth: 120 }}>
                <option value="" style={{ background: '#06112e' }}>Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#06112e' }}>{s.name}</option>)}
              </select>
              <select value={targetChapter} onChange={e => setTargetChapter(e.target.value)}
                className="input-field py-2 text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'white', minWidth: 120 }}>
                <option value="" style={{ background: '#06112e' }}>Chapter</option>
                {chapters.map(c => <option key={c.id} value={c.id} style={{ background: '#06112e' }}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-4 max-h-[600px] overflow-y-auto pr-1">
            {parsed.map((q, i) => (
              <div key={i} className="glass-navy rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="badge-purple text-[10px] flex-shrink-0 mt-0.5">Q {i + 1}</span>
                  <button onClick={() => removeParsedQ(i)}
                    className="p-1.5 hover:bg-red-500/15 rounded-lg transition-colors text-white/25 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {editIdx === i ? (
                  <div className="flex flex-col gap-2.5">
                    <textarea value={q.question} onChange={e => updateParsedQ(i, 'question', e.target.value)}
                      className="input-field resize-none text-sm" rows={2} />
                    {OPTION_KEYS.map((key, oi) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${q.correct_option === OPTION_LABELS[oi] ? 'bg-emerald-500/25 text-emerald-400' : 'bg-white/[0.06] text-white/40'}`}>
                          {OPTION_LABELS[oi]}
                        </span>
                        <input value={q[key]} onChange={e => updateParsedQ(i, key, e.target.value)} className="input-field text-sm py-2" />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <div>
                        <label className="text-[10px] text-white/35 mb-1 block">Correct</label>
                        <div className="flex gap-1">
                          {OPTION_LABELS.map(l => (
                            <button type="button" key={l} onClick={() => updateParsedQ(i, 'correct_option', l)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${q.correct_option === l ? 'bg-emerald-500/25 text-emerald-400 border-emerald-500/30' : 'glass border-white/[0.08] text-white/35'}`}>{l}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <textarea value={q.explanation || ''} onChange={e => updateParsedQ(i, 'explanation', e.target.value)}
                      className="input-field resize-none text-xs" rows={2} placeholder="Explanation..." />
                    <button onClick={() => setEditIdx(null)} className="btn-outline py-2 text-xs">Done editing</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-white/80 text-sm mb-3 leading-relaxed">{q.question}</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {OPTION_KEYS.map((key, oi) => (
                        <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${q.correct_option === OPTION_LABELS[oi] ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20' : 'text-white/40'}`}>
                          <span className="font-bold">{OPTION_LABELS[oi]}.</span> {q[key]}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <p className="text-white/30 text-xs mt-1.5 line-clamp-2">💡 {q.explanation}</p>}
                    <button onClick={() => setEditIdx(i)} className="text-[11px] text-purple-400 hover:text-purple-300 mt-2 transition-colors flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving || !targetSubject || !targetChapter}
            className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Import {parsed.length} MCQs</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── MCQ List ─── */
function MCQList({ subjects, onEdit }) {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ subject_id: '', chapter_id: '' });
  const [chapters, setChapters] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (filters.subject_id) {
      api.get(`/subjects/${filters.subject_id}/chapters`).then(r => setChapters(r.data)).catch(() => {});
    } else { setChapters([]); setFilters(p => ({ ...p, chapter_id: '' })); }
  }, [filters.subject_id]);

  useEffect(() => { loadMCQs(); }, [filters, page]);

  const loadMCQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (filters.subject_id) params.set('subject_id', filters.subject_id);
      if (filters.chapter_id) params.set('chapter_id', filters.chapter_id);
      const r = await api.get(`/mcqs?${params}`);
      setMcqs(r.data.mcqs);
      setTotal(r.data.total);
    } catch { toast.error('Failed to load MCQs'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this MCQ?')) return;
    try { await api.delete(`/mcqs/${id}`); toast.success('Deleted'); loadMCQs(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = search ? mcqs.filter(q => q.question.toLowerCase().includes(search.toLowerCase())) : mcqs;

  const diffColor = { easy: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', medium: 'text-amber-400 border-amber-500/20 bg-amber-500/10', hard: 'text-red-400 border-red-500/20 bg-red-500/10' };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <select value={filters.subject_id} onChange={e => setFilters(p => ({ ...p, subject_id: e.target.value }))}
          className="input-field py-2.5 text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'white', minWidth: 150 }}>
          <option value="" style={{ background: '#06112e' }}>All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#06112e' }}>{s.name}</option>)}
        </select>
        {chapters.length > 0 && (
          <select value={filters.chapter_id} onChange={e => setFilters(p => ({ ...p, chapter_id: e.target.value }))}
            className="input-field py-2.5 text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'white', minWidth: 150 }}>
            <option value="" style={{ background: '#06112e' }}>All Chapters</option>
            {chapters.map(c => <option key={c.id} value={c.id} style={{ background: '#06112e' }}>{c.title}</option>)}
          </select>
        )}
        <button onClick={loadMCQs} className="glass border border-white/[0.08] p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors">
          <RefreshCw className="w-4 h-4 text-white/40" />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-white/35 font-medium">{total} total MCQs · showing {filtered.length}</p>
        {total > 30 && (
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="glass px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white disabled:opacity-30">← Prev</button>
            <span className="text-xs text-white/35">Page {page}</span>
            <button disabled={filtered.length < 30} onClick={() => setPage(p => p + 1)} className="glass px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card-premium rounded-2xl">
          <Brain className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{mcqs.length === 0 ? 'No MCQs yet — add some above!' : 'No matching MCQs'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="card-premium p-5 group">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-purple-500/12 border border-purple-500/15 flex items-center justify-center text-purple-400 text-xs font-bold flex-shrink-0">
                  {i + 1 + (page - 1) * 30}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm font-medium mb-2 line-clamp-2">{q.question}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                    {OPTION_KEYS.map((key, oi) => (
                      <div key={key} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${q.correct_option === OPTION_LABELS[oi] ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'text-white/35'}`}>
                        <span className="font-bold w-4">{OPTION_LABELS[oi]}.</span>
                        <span className="truncate">{q[key]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold capitalize ${diffColor[q.difficulty] || diffColor.medium}`}>{q.difficulty}</span>
                    {q.subject_name && <span className="text-[10px] text-white/30">{q.subject_name}</span>}
                    {q.chapter_title && <span className="text-[10px] text-white/25">· {q.chapter_title}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(q)} className="p-2 glass rounded-xl hover:bg-white/[0.08] transition-colors text-white/35 hover:text-purple-400">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 glass rounded-xl hover:bg-red-500/15 transition-colors text-white/35 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Import History ─── */
function ImportHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mcqs/import-history').then(r => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>;
  if (!history.length) return <p className="text-white/25 text-sm text-center py-8">No import history yet</p>;

  return (
    <div className="flex flex-col gap-3">
      {history.map((h, i) => (
        <div key={h.id} className="card-premium p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-white/75 font-medium">{h.filename || 'Text paste'}</span>
                <span className="badge-purple text-[10px]">{h.source_type?.toUpperCase()}</span>
              </div>
              <p className="text-xs text-white/35">
                {h.total_imported} imported · {h.total_parsed} parsed · by {h.admin_name}
                · {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-400">{h.total_imported}</div>
              <div className="text-[10px] text-white/25">imported</div>
            </div>
          </div>
          {h.errors?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/[0.05]">
              <p className="text-[10px] text-amber-400">{h.errors.length} warning(s) during import</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main AdminMCQ page ─── */
export default function AdminMCQ() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('add-single');
  const [editItem, setEditItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mcqCount, setMcqCount] = useState(0);

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

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data)).catch(() => {});
    api.get('/mcqs?limit=1').then(r => setMcqCount(r.data.total)).catch(() => {});
  }, []);

  const handleSaved = () => {
    api.get('/mcqs?limit=1').then(r => setMcqCount(r.data.total)).catch(() => {});
    if (editItem) { setEditItem(null); setActiveTab('list'); }
  };

  const handleEdit = (q) => { setEditItem(q); setActiveTab('add-single'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar flex flex-col ${mobile ? 'w-full h-full' : 'w-64 min-h-screen'} p-5`}>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base">CA Aspire BD</div>
          <div className="text-[9px] text-gold-500 font-semibold tracking-widest uppercase">Admin Panel</div>
        </div>
        {mobile && <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg"><X className="w-4 h-4 text-white/40" /></button>}
      </div>
      <div className="flex items-center gap-2.5 glass-navy rounded-xl px-3 py-2.5 mb-6 border border-purple-500/12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
          <Shield className="w-4 h-4 text-navy-950" />
        </div>
        <div><p className="text-white text-xs font-semibold">Administrator</p><p className="text-white/30 text-[10px]">Full access</p></div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map(item => <SidebarLink key={item.to} {...item} active={location.pathname === item.to} />)}
      </div>
      <button onClick={() => { logout(); navigate('/'); }} className="sidebar-item mt-4 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08]">
        <LogOut className="w-4 h-4 flex-shrink-0" /><span>Sign Out</span>
      </button>
    </div>
  );

  const tabs = [
    { key: 'add-single', label: editItem ? 'Edit MCQ' : 'Add MCQ', icon: <Plus className="w-3.5 h-3.5" /> },
    { key: 'bulk-import', label: 'Bulk Import', icon: <Upload className="w-3.5 h-3.5" /> },
    { key: 'list', label: `All MCQs (${mcqCount})`, icon: <Brain className="w-3.5 h-3.5" /> },
    { key: 'history', label: 'Import History', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex">
      <div className="hidden lg:block flex-shrink-0 fixed left-0 top-[68px] bottom-0 w-64 z-40"><Sidebar /></div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="glass p-2.5 rounded-xl"><Menu className="w-5 h-5" /></button>
          <span className="font-bold text-white">MCQ Manager</span>
          <div className="w-10" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">MCQ Manager</h1>
          <p className="text-white/35 text-sm">Add, edit, and bulk import MCQ questions for your students.</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key !== 'add-single') setEditItem(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === t.key ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white shadow-glow-purple' : 'glass-card text-white/50 hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card-premium rounded-2xl p-7">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === 'add-single' && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    {editItem ? <><Edit2 className="w-4 h-4 text-purple-400" /> Edit MCQ</> : <><Plus className="w-4 h-4 text-purple-400" /> Add Single MCQ</>}
                  </h2>
                  <SingleMCQForm subjects={subjects} onSaved={handleSaved} editItem={editItem} onCancelEdit={() => { setEditItem(null); setActiveTab('list'); }} />
                </div>
              )}
              {activeTab === 'bulk-import' && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-400" /> Bulk Import MCQs
                  </h2>
                  <BulkImportPanel subjects={subjects} onImported={handleSaved} />
                </div>
              )}
              {activeTab === 'list' && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" /> All MCQs
                  </h2>
                  <MCQList subjects={subjects} onEdit={handleEdit} />
                </div>
              )}
              {activeTab === 'history' && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" /> Import History
                  </h2>
                  <ImportHistory />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
