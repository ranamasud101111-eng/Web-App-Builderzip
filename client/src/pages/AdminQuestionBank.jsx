import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  HelpCircle, Plus, X, Edit2, Trash2, ChevronDown, ChevronRight,
  BarChart3, Bell, BookOpen, Home, LogOut, Menu, Shield,
  Brain, GraduationCap, Eye, EyeOff, Save, Loader2,
  Zap, Layers, Upload, File, CheckCircle, AlertCircle,
  FileText, FileUp, AlignLeft, RefreshCw,
} from 'lucide-react';
import api from '../api';

/* ─── Sidebar ─── */
const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

const LEVEL_ICONS   = ['📝','📜','💼','🏆','⭐','🌟','🔥','💡','🎯','📚'];
const SUBJECT_ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','💻','⚗️','📐','📊','💡','⚖️','🏛️'];

const IconPicker = ({ icons, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {icons.map(ic => (
      <button key={ic} type="button" onClick={() => onChange(ic)}
        className={`w-9 h-9 text-xl rounded-lg transition-all ${value===ic ? 'bg-purple-500/30 ring-2 ring-purple-400/50 scale-110' : 'bg-white/[0.04] hover:bg-white/[0.09]'}`}>
        {ic}
      </button>
    ))}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-white/10'}`}>
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-6' : 'left-1'}`} />
  </button>
);

const Modal = ({ onClose, children, wide }) => (
  <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }} transition={{ duration:0.18 }}
      className={`relative bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
      onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm text-white/60 font-medium">{label}</label>
    {children}
  </div>
);
const Input = (props) => (
  <input {...props} className={`w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 text-sm ${props.className||''}`} />
);
const Textarea = (props) => (
  <textarea {...props} className={`w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 text-sm resize-none ${props.className||''}`} />
);

const fmtSize = (b) => !b ? '' : b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;

const ContentBadge = ({ type }) => {
  const cfg = { mcq:{label:'MCQ',cls:'bg-purple-500/20 text-purple-300'}, pdf:{label:'PDF',cls:'bg-rose-500/20 text-rose-300'}, text:{label:'Text',cls:'bg-blue-500/20 text-blue-300'} };
  const c = cfg[type]; if (!c) return null;
  return <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.cls}`}>{c.label}</span>;
};

/* ════ CONTENT MODAL ════ */
function ContentModal({ chapter, subjectId, levelName, onClose, onSaved }) {
  const isCertificate = levelName?.toLowerCase() === 'certificate';
  const tabs = isCertificate ? ['mcq','pdf'] : ['pdf','text'];

  const [activeTab, setActiveTab]     = useState(tabs[0]);
  const [contents, setContents]       = useState({});
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  /* MCQ state */
  const [mcqs, setMcqs]               = useState([]);
  const [mcqLoading, setMcqLoading]   = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMcq, setEditingMcq]   = useState(null);
  const [mcqForm, setMcqForm]         = useState({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'a', explanation:'' });
  const [showBulk, setShowBulk]       = useState(false);
  const [bulkText, setBulkText]       = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  /* PDF state */
  const [pdfFile, setPdfFile]         = useState(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const pdfRef = useRef();

  /* Text state */
  const [textContent, setTextContent] = useState('');

  /* Visibility per type */
  const [visibility, setVisibility]   = useState({ mcq:true, pdf:true, text:true });

  const loadContents = async () => {
    try {
      const r = await api.get(`/qbank/chapters/${chapter.id}/contents`);
      setContents(r.data || {});
      if (r.data?.text) setTextContent(r.data.text.text_content || '');
      const vis = { mcq:true, pdf:true, text:true };
      Object.entries(r.data||{}).forEach(([t,c]) => { vis[t] = c.is_visible !== false; });
      setVisibility(vis);
    } catch {} finally { setLoading(false); }
  };

  const loadMcqs = useCallback(async () => {
    setMcqLoading(true);
    try { const r = await api.get(`/qbank/chapters/${chapter.id}/mcqs`); setMcqs(r.data||[]); }
    catch {} finally { setMcqLoading(false); }
  }, [chapter.id]);

  useEffect(() => { loadContents(); }, []);
  useEffect(() => { if (activeTab==='mcq') loadMcqs(); }, [activeTab]);

  /* ── Save current tab ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'mcq') {
        await api.put(`/qbank/chapters/${chapter.id}/contents/mcq`, { is_visible: visibility.mcq });
        toast.success('MCQ visibility saved');
      } else if (activeTab === 'pdf') {
        if (pdfFile) {
          const fd = new FormData(); fd.append('pdf', pdfFile); fd.append('is_visible', visibility.pdf);
          await api.post(`/qbank/chapters/${chapter.id}/contents/pdf/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          setPdfFile(null);
          toast.success('PDF uploaded!');
        } else if (!contents.pdf) { toast.error('Select a PDF first'); return; }
        else { await api.put(`/qbank/chapters/${chapter.id}/contents/pdf`, { is_visible: visibility.pdf }); toast.success('Saved'); }
      } else if (activeTab === 'text') {
        if (!textContent.trim()) { toast.error('Write some content first'); return; }
        await api.put(`/qbank/chapters/${chapter.id}/contents/text`, { is_visible: visibility.text, text_content: textContent });
        toast.success('Text saved');
      }
      await loadContents();
      onSaved(subjectId);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  /* ── MCQ actions ── */
  const resetMcqForm = () => { setMcqForm({ question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'a', explanation:'' }); setShowAddForm(false); setEditingMcq(null); };

  const saveMcq = async () => {
    const { question, option_a, option_b, option_c, option_d } = mcqForm;
    if (!question.trim()||!option_a||!option_b||!option_c||!option_d) { toast.error('Fill all required fields'); return; }
    try {
      if (editingMcq) {
        const r = await api.put(`/qbank/mcqs/${editingMcq.id}`, mcqForm);
        setMcqs(p => p.map(m => m.id===r.data.id ? r.data : m));
        toast.success('Question updated');
      } else {
        const r = await api.post(`/qbank/chapters/${chapter.id}/mcqs`, mcqForm);
        setMcqs(p => [...p, r.data]);
        if (!contents.mcq) {
          const c = await api.put(`/qbank/chapters/${chapter.id}/contents/mcq`, { is_visible: visibility.mcq });
          setContents(p => ({ ...p, mcq: c.data }));
        }
        toast.success('Question added');
      }
      resetMcqForm();
      onSaved(subjectId);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save'); }
  };

  const deleteMcq = async (id) => {
    try {
      await api.delete(`/qbank/mcqs/${id}`);
      setMcqs(p => p.filter(m => m.id!==id));
      toast.success('Question deleted');
      onSaved(subjectId);
    } catch { toast.error('Failed to delete'); }
  };

  const bulkImport = async () => {
    if (!bulkText.trim()) { toast.error('Paste MCQ text first'); return; }
    setBulkImporting(true);
    try {
      const r = await api.post(`/qbank/chapters/${chapter.id}/mcqs/bulk`, { text: bulkText });
      setMcqs(p => [...p, ...r.data.mcqs]);
      if (!contents.mcq) {
        const c = await api.put(`/qbank/chapters/${chapter.id}/contents/mcq`, { is_visible: visibility.mcq });
        setContents(p => ({ ...p, mcq: c.data }));
      }
      toast.success(`${r.data.inserted} questions imported!`);
      setBulkText(''); setShowBulk(false);
      onSaved(subjectId);
    } catch (e) { toast.error(e.response?.data?.error || 'Import failed'); }
    finally { setBulkImporting(false); }
  };

  const deleteContent = async (type) => {
    try {
      await api.delete(`/qbank/chapters/${chapter.id}/contents/${type}`);
      if (type==='mcq') setMcqs([]);
      if (type==='text') setTextContent('');
      if (type==='pdf') setPdfFile(null);
      setContents(p => { const n={...p}; delete n[type]; return n; });
      toast.success('Content deleted');
      onSaved(subjectId);
    } catch { toast.error('Failed to delete content'); }
  };

  const TABS = {
    mcq:  { icon: <HelpCircle size={15} />, label: 'MCQ Questions' },
    pdf:  { icon: <FileUp size={15} />,     label: 'PDF File' },
    text: { icon: <AlignLeft size={15} />,  label: 'Text Note' },
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 mb-2 inline-block">{levelName}</span>
          <h2 className="text-lg font-bold text-white">Question Bank Content</h2>
          <p className="text-sm text-white/50 mt-0.5 truncate max-w-sm">{chapter.title}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50 hover:text-white flex-shrink-0"><X size={18} /></button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12"><Loader2 size={28} className="animate-spin text-purple-400" /></div>
      ) : (
        <div className="p-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all relative ${activeTab===tab ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}>
                {TABS[tab].icon}{TABS[tab].label}
                {contents[tab] && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            ))}
          </div>

          {/* ── MCQ tab ── */}
          {activeTab==='mcq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-white">{mcqs.length} Question{mcqs.length!==1?'s':''}</p>
                  <p className="text-xs text-white/40 mt-0.5">Multiple choice questions for this chapter</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Visible</span>
                  <Toggle value={visibility.mcq} onChange={() => setVisibility(p => ({...p,mcq:!p.mcq}))} />
                </div>
              </div>

              {mcqLoading ? <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-purple-400" /></div> : (
                <>
                  {/* MCQ list */}
                  {mcqs.length > 0 && !showAddForm && !showBulk && (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {mcqs.map((mcq, i) => (
                        <div key={mcq.id} className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05] group">
                          <span className="text-white/25 text-xs font-mono mt-0.5 flex-shrink-0 w-5">{i+1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/85 leading-snug">{mcq.question}</p>
                            <p className="text-xs text-emerald-400 mt-1">✓ {mcq.correct_option?.toUpperCase()}) {mcq[`option_${mcq.correct_option}`]}</p>
                          </div>
                          <div className="flex gap-1 opacity-40 group-hover:opacity-100 flex-shrink-0">
                            <button onClick={() => { setEditingMcq(mcq); setMcqForm({ question:mcq.question, option_a:mcq.option_a, option_b:mcq.option_b, option_c:mcq.option_c, option_d:mcq.option_d, correct_option:mcq.correct_option, explanation:mcq.explanation||'' }); setShowAddForm(true); }}
                              className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors"><Edit2 size={12}/></button>
                            <button onClick={() => deleteMcq(mcq.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add / Bulk buttons */}
                  {!showAddForm && !showBulk && (
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddForm(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm transition-colors">
                        <Plus size={14}/>Add Question
                      </button>
                      <button onClick={() => setShowBulk(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 text-sm transition-colors">
                        <Upload size={14}/>Bulk Import
                      </button>
                    </div>
                  )}

                  {/* Add / Edit form */}
                  {showAddForm && (
                    <div className="space-y-3 p-4 bg-white/[0.04] rounded-xl border border-white/10">
                      <h4 className="text-sm font-semibold text-white">{editingMcq ? 'Edit Question' : 'Add Question'}</h4>
                      <Textarea rows={3} placeholder="Question text *" value={mcqForm.question} onChange={e => setMcqForm(p=>({...p,question:e.target.value}))} />
                      <div className="grid grid-cols-2 gap-2">
                        {['a','b','c','d'].map(opt => (
                          <Input key={opt} placeholder={`Option ${opt.toUpperCase()} *`} value={mcqForm[`option_${opt}`]} onChange={e => setMcqForm(p=>({...p,[`option_${opt}`]:e.target.value}))} />
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50">Correct Answer *</label>
                        <div className="flex gap-2">
                          {['a','b','c','d'].map(opt => (
                            <button key={opt} type="button" onClick={() => setMcqForm(p=>({...p,correct_option:opt}))}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mcqForm.correct_option===opt ? 'bg-emerald-500 text-white' : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.1]'}`}>
                              {opt.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea rows={2} placeholder="Explanation (optional)" value={mcqForm.explanation} onChange={e => setMcqForm(p=>({...p,explanation:e.target.value}))} />
                      <div className="flex gap-2">
                        <button onClick={resetMcqForm} className="flex-1 py-2 rounded-xl bg-white/[0.06] text-white/60 text-sm">Cancel</button>
                        <button onClick={saveMcq} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500">
                          {editingMcq ? 'Update' : 'Add'} Question
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bulk import */}
                  {showBulk && (
                    <div className="space-y-3 p-4 bg-white/[0.03] rounded-xl border border-indigo-500/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Bulk Import MCQs</p>
                        <button onClick={() => { setShowBulk(false); setBulkText(''); }} className="text-white/30 hover:text-white text-sm">✕</button>
                      </div>
                      <div className="text-xs text-white/40 p-3 bg-black/30 rounded-lg leading-relaxed">
                        <p className="font-medium text-white/60 mb-1">Format (one per block):</p>
                        <code className="text-emerald-300 block whitespace-pre">{`1. Question here?\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAnswer: A\nExplanation: reason`}</code>
                      </div>
                      <Textarea rows={8} placeholder="Paste MCQs here..." value={bulkText} onChange={e => setBulkText(e.target.value)} />
                      <button onClick={bulkImport} disabled={bulkImporting}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-50">
                        {bulkImporting ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}Import Questions
                      </button>
                    </div>
                  )}

                  {/* Delete MCQ section */}
                  {contents.mcq && !showAddForm && !showBulk && (
                    <div className="flex items-center justify-between">
                      <button onClick={() => deleteContent('mcq')} className="flex items-center gap-1.5 text-xs text-red-400/50 hover:text-red-400 transition-colors">
                        <Trash2 size={11}/>Delete MCQ section
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium disabled:opacity-50">
                        {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}Save Visibility
                      </button>
                    </div>
                  )}
                  {!contents.mcq && !showAddForm && !showBulk && (
                    <div className="flex justify-end">
                      <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium disabled:opacity-50">
                        {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}Save
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── PDF tab ── */}
          {activeTab==='pdf' && (
            <div className="space-y-4">
              {contents.pdf?.filename && !pdfFile && (
                <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <File size={18} className="text-rose-400 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{contents.pdf.original_name}</p>
                    <p className="text-xs text-white/40">{fmtSize(contents.pdf.file_size)} · Active</p>
                  </div>
                  <a href={`/api/qbank/file/${contents.pdf.filename}`} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs hover:bg-rose-500/30 transition-colors">View</a>
                  <button onClick={() => deleteContent('pdf')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                </div>
              )}
              {pdfFile && (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{pdfFile.name}</p>
                    <p className="text-xs text-white/40">{fmtSize(pdfFile.size)} · Ready</p>
                  </div>
                  <button onClick={() => setPdfFile(null)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors"><X size={14}/></button>
                </div>
              )}
              <div
                onDragOver={e => { e.preventDefault(); setPdfDragOver(true); }}
                onDragLeave={() => setPdfDragOver(false)}
                onDrop={e => { e.preventDefault(); setPdfDragOver(false); const f=e.dataTransfer.files[0]; if(f?.type==='application/pdf') setPdfFile(f); else toast.error('PDF only'); }}
                onClick={() => pdfRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${pdfDragOver?'border-purple-400 bg-purple-500/10':'border-white/10 hover:border-white/25 bg-white/[0.02]'}`}>
                <Upload size={28} className="mx-auto mb-3 text-white/30"/>
                <p className="text-sm text-white/60 font-medium">{contents.pdf?.filename?'Drop new PDF to replace':'Drop PDF here or click'}</p>
                <p className="text-xs text-white/30 mt-1">PDF only · Max 50MB</p>
                <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => { if(e.target.files[0]) setPdfFile(e.target.files[0]); e.target.value=''; }}/>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-sm font-medium text-white">Visible to students</p>
                <Toggle value={visibility.pdf} onChange={() => setVisibility(p=>({...p,pdf:!p.pdf}))}/>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">
                  {saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Save
                </button>
              </div>
            </div>
          )}

          {/* ── Text tab ── */}
          {activeTab==='text' && (
            <div className="space-y-4">
              <Textarea rows={12} value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="Write text content here..."/>
              <p className="text-xs text-white/30 text-right">{textContent.length} characters</p>
              <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-sm font-medium text-white">Visible to students</p>
                <Toggle value={visibility.text} onChange={() => setVisibility(p=>({...p,text:!p.text}))}/>
              </div>
              <div className="flex items-center justify-between">
                {contents.text && (
                  <button onClick={() => deleteContent('text')} className="flex items-center gap-1.5 text-xs text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={11}/>Delete text content
                  </button>
                )}
                <div className="ml-auto">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50">
                    {saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ════ MAIN PAGE ════ */
export default function AdminQuestionBank() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [qbankVisible, setQbankVisible]   = useState(true);
  const [levels,   setLevels]   = useState([]);
  const [subjects, setSubjects] = useState({});
  const [chapters, setChapters] = useState({});
  const [expanded, setExpanded] = useState({ levels:{}, subjects:{} });
  const [subjectLevelMap, setSubjectLevelMap] = useState({});
  const [loading, setLoading]   = useState(true);

  const [levelModal,   setLevelModal]   = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [chapterModal, setChapterModal] = useState(null);
  const [contentModal, setContentModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const emptyLevel   = { name:'', description:'', icon:'📝', order_index:0, is_visible:true };
  const emptySubject = { name:'', description:'', icon:'📚', order_index:0, is_visible:true };
  const emptyChapter = { title:'', description:'', order_index:0, is_visible:true };
  const [lf, setLf] = useState(emptyLevel);
  const [sf, setSf] = useState(emptySubject);
  const [cf, setCf] = useState(emptyChapter);

  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, levelsRes] = await Promise.all([api.get('/qbank/settings'), api.get('/qbank/levels')]);
        setQbankVisible(settingsRes.data?.qbank_visible !== false);
        setLevels(levelsRes.data || []);
      } catch { toast.error('Failed to load Question Bank'); }
      finally { setLoading(false); }
    })();
  }, []);

  const loadSubjects = useCallback(async (levelId) => {
    try {
      const r = await api.get(`/qbank/levels/${levelId}/subjects`);
      setSubjects(p => ({ ...p, [levelId]: r.data }));
      const map = {};
      (r.data||[]).forEach(s => { map[s.id] = levelId; });
      setSubjectLevelMap(p => ({ ...p, ...map }));
    } catch { toast.error('Failed to load subjects'); }
  }, []);

  const loadChapters = useCallback(async (subjectId) => {
    try {
      const r = await api.get(`/qbank/subjects/${subjectId}/chapters`);
      setChapters(p => ({ ...p, [subjectId]: r.data }));
    } catch { toast.error('Failed to load chapters'); }
  }, []);

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

  const toggleGlobalVisible = async () => {
    const nv = !qbankVisible;
    try { await api.put('/qbank/settings', { qbank_visible: nv }); setQbankVisible(nv); toast.success(nv ? 'Question Bank visible to students' : 'Question Bank hidden from students'); }
    catch { toast.error('Failed to update'); }
  };

  /* ── Level CRUD ── */
  const saveLevelModal = async () => {
    if (!lf.name.trim()) { toast.error('Name required'); return; }
    setSubmitting(true);
    try {
      if (levelModal.mode==='add') { const r=await api.post('/qbank/levels',lf); setLevels(p=>[...p,r.data]); toast.success('Level created'); }
      else { const r=await api.put(`/qbank/levels/${levelModal.data.id}`,lf); setLevels(p=>p.map(x=>x.id===r.data.id?r.data:x)); toast.success('Level updated'); }
      setLevelModal(null);
    } catch (e) { toast.error(e.response?.data?.error||'Failed'); }
    finally { setSubmitting(false); }
  };
  const toggleLevelVisible = async (level) => {
    try { const r=await api.put(`/qbank/levels/${level.id}`,{...level,is_visible:!level.is_visible}); setLevels(p=>p.map(x=>x.id===r.data.id?r.data:x)); }
    catch { toast.error('Failed'); }
  };

  /* ── Subject CRUD ── */
  const saveSubjectModal = async () => {
    if (!sf.name.trim()) { toast.error('Name required'); return; }
    setSubmitting(true);
    const levelId = subjectModal.levelId;
    try {
      if (subjectModal.mode==='add') { const r=await api.post('/qbank/subjects',{...sf,level_id:levelId}); setSubjects(p=>({...p,[levelId]:[...(p[levelId]||[]),r.data]})); setSubjectLevelMap(p=>({...p,[r.data.id]:levelId})); toast.success('Subject created'); }
      else { const r=await api.put(`/qbank/subjects/${subjectModal.data.id}`,sf); setSubjects(p=>({...p,[levelId]:(p[levelId]||[]).map(x=>x.id===r.data.id?r.data:x)})); toast.success('Subject updated'); }
      setSubjectModal(null);
    } catch (e) { toast.error(e.response?.data?.error||'Failed'); }
    finally { setSubmitting(false); }
  };
  const toggleSubjectVisible = async (subject, levelId) => {
    try { const r=await api.put(`/qbank/subjects/${subject.id}`,{...subject,is_visible:!subject.is_visible}); setSubjects(p=>({...p,[levelId]:(p[levelId]||[]).map(x=>x.id===r.data.id?r.data:x)})); }
    catch { toast.error('Failed'); }
  };

  /* ── Chapter CRUD ── */
  const saveChapterModal = async () => {
    if (!cf.title.trim()) { toast.error('Title required'); return; }
    setSubmitting(true);
    const subjectId = chapterModal.subjectId;
    try {
      if (chapterModal.mode==='add') { const r=await api.post('/qbank/chapters',{...cf,subject_id:subjectId}); setChapters(p=>({...p,[subjectId]:[...(p[subjectId]||[]),r.data]})); toast.success('Chapter created'); }
      else { const r=await api.put(`/qbank/chapters/${chapterModal.data.id}`,cf); setChapters(p=>({...p,[subjectId]:(p[subjectId]||[]).map(x=>x.id===r.data.id?{...x,...r.data}:x)})); toast.success('Chapter updated'); }
      setChapterModal(null);
    } catch (e) { toast.error(e.response?.data?.error||'Failed'); }
    finally { setSubmitting(false); }
  };
  const toggleChapterVisible = async (chapter, subjectId) => {
    try { const r=await api.put(`/qbank/chapters/${chapter.id}`,{...chapter,is_visible:!chapter.is_visible}); setChapters(p=>({...p,[subjectId]:(p[subjectId]||[]).map(x=>x.id===r.data.id?{...x,...r.data}:x)})); }
    catch { toast.error('Failed'); }
  };

  const execDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, extra } = deleteTarget;
    setSubmitting(true);
    try {
      if (type==='level') { await api.delete(`/qbank/levels/${id}`); setLevels(p=>p.filter(x=>x.id!==id)); }
      else if (type==='subject') { await api.delete(`/qbank/subjects/${id}`); setSubjects(p=>({...p,[extra.levelId]:(p[extra.levelId]||[]).filter(x=>x.id!==id)})); }
      else if (type==='chapter') { await api.delete(`/qbank/chapters/${id}`); setChapters(p=>({...p,[extra.subjectId]:(p[extra.subjectId]||[]).filter(x=>x.id!==id)})); }
      toast.success(`${type} deleted`);
      setDeleteTarget(null);
    } catch { toast.error(`Failed to delete ${type}`); }
    finally { setSubmitting(false); }
  };

  const onContentSaved = (subjectId) => loadChapters(subjectId);

  const openContentModal = (chapter, subjectId) => {
    const levelId = subjectLevelMap[subjectId];
    const level = levels.find(l => l.id === levelId);
    setContentModal({ chapter, subjectId, levelName: level?.name || 'Certificate' });
  };

  const navItems = [
    { to:'/admin',              icon:<BarChart3     className="w-4 h-4"/>, label:'Dashboard' },
    { to:'/admin/subjects',     icon:<BookOpen      className="w-4 h-4"/>, label:'Subjects & Chapters' },
    { to:'/admin/mcqs',         icon:<Brain         className="w-4 h-4"/>, label:'MCQ Manager' },
    { to:'/admin/exams',        icon:<GraduationCap className="w-4 h-4"/>, label:'Exam Manager' },
    { to:'/admin/classes',      icon:<Layers        className="w-4 h-4"/>, label:'Classes' },
    { to:'/admin/flashcards',   icon:<Zap           className="w-4 h-4"/>, label:'Flash Cards' },
    { to:'/admin/notifications',icon:<Bell          className="w-4 h-4"/>, label:'Notifications' },
    { to:'/admin/shortnotes',   icon:<FileText      className="w-4 h-4"/>, label:'Short Notes' },
    { to:'/admin/question-bank',icon:<HelpCircle    className="w-4 h-4"/>, label:'Question Bank' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
      <Loader2 size={32} className="animate-spin text-purple-400"/>
    </div>
  );

  return (
    <div className="min-h-screen flex pt-[68px]" style={{ background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
      {/* Sidebar */}
      <div className={`fixed top-[68px] bottom-0 left-0 z-40 transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full'} lg:translate-x-0 lg:relative lg:flex lg:transform-none`}>
        <div className="sidebar w-64 flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <HelpCircle size={20} className="text-white"/>
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">Admin Panel</h1>
                <p className="text-white/50 text-xs">{user?.name}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => <SidebarLink key={item.to} {...item} active={location.pathname===item.to}/>)}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button onClick={() => { logout(); navigate('/'); }} className="sidebar-item w-full text-red-400/80 hover:text-red-400">
              <LogOut size={16}/><span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-[68px] z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/[0.07]" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-white/70"/>
          </button>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">Question Bank Management</h2>
            <p className="text-white/40 text-xs mt-0.5">Manage levels, subjects, chapters and question content</p>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-4 max-w-5xl mx-auto w-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <Toggle value={qbankVisible} onChange={toggleGlobalVisible}/>
              <div>
                <p className="text-sm font-medium text-white leading-tight">
                  {qbankVisible ? 'Question Bank visible to students' : 'Question Bank hidden from students'}
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  {qbankVisible ? 'Students can access the Question Bank' : 'Students cannot see Question Bank'}
                </p>
              </div>
            </div>
            <button onClick={() => { setLf(emptyLevel); setLevelModal({ mode:'add' }); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0">
              <Plus size={16}/>Add Level
            </button>
          </div>

          {/* Levels */}
          {levels.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <HelpCircle size={40} className="mx-auto mb-3 opacity-30"/>
              <p>No levels yet. Add your first level above.</p>
            </div>
          ) : levels.map(level => (
            <div key={level.id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <button onClick={() => toggleLevel(level.id)} className="p-1 rounded-lg hover:bg-white/[0.07] text-white/50 hover:text-white">
                  {expanded.levels[level.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                </button>
                <span className="text-xl">{level.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white">{level.name}</span>
                  {level.description && <span className="text-white/40 text-sm ml-2">{level.description}</span>}
                </div>
                {!level.is_visible && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Hidden</span>}
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleLevelVisible(level)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                    {level.is_visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                  </button>
                  <button onClick={() => { setLf({...level}); setLevelModal({ mode:'edit', data:level }); }} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={() => setDeleteTarget({ type:'level', id:level.id, label:level.name })} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                  <button onClick={() => { setSf(emptySubject); setSubjectModal({ mode:'add', levelId:level.id }); if(!expanded.levels[level.id]) toggleLevel(level.id); }}
                    className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium">
                    <Plus size={12}/>Subject
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded.levels[level.id] && (
                  <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.18}}
                    className="border-t border-white/[0.06]">
                    {!(subjects[level.id]||[]).length ? (
                      <p className="px-8 py-5 text-white/30 text-sm text-center">No subjects yet.</p>
                    ) : (subjects[level.id]||[]).map(subject => (
                      <div key={subject.id} className="border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-3 pl-10 pr-5 py-3">
                          <button onClick={() => toggleSubject(subject.id)} className="p-1 rounded-lg hover:bg-white/[0.07] text-white/50 hover:text-white">
                            {expanded.subjects[subject.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                          </button>
                          <span className="text-lg">{subject.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-white/90 font-medium text-sm">{subject.name}</span>
                            {subject.description && <span className="text-white/30 text-xs ml-2">{subject.description}</span>}
                          </div>
                          {!subject.is_visible && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Hidden</span>}
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleSubjectVisible(subject, level.id)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                              {subject.is_visible ? <Eye size={13}/> : <EyeOff size={13}/>}
                            </button>
                            <button onClick={() => { setSf({...subject}); setSubjectModal({ mode:'edit', levelId:level.id, data:subject }); }} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                              <Edit2 size={13}/>
                            </button>
                            <button onClick={() => setDeleteTarget({ type:'subject', id:subject.id, label:subject.name, extra:{levelId:level.id} })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                              <Trash2 size={13}/>
                            </button>
                            <button onClick={() => { setCf(emptyChapter); setChapterModal({ mode:'add', subjectId:subject.id }); if(!expanded.subjects[subject.id]) toggleSubject(subject.id); }}
                              className="ml-1 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-medium">
                              <Plus size={11}/>Chapter
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expanded.subjects[subject.id] && (
                            <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.15}} className="">
                              {!(chapters[subject.id]||[]).length ? (
                                <p className="pl-20 pr-5 py-4 text-white/25 text-xs text-center">No chapters yet.</p>
                              ) : (chapters[subject.id]||[]).map(chapter => (
                                <div key={chapter.id} className="flex items-center gap-3 pl-20 pr-5 py-3 border-t border-white/[0.03] hover:bg-white/[0.02] group">
                                  <HelpCircle size={13} className="text-white/25 flex-shrink-0"/>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-white/80 text-sm">{chapter.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {(chapter.contents||[]).map(c => <ContentBadge key={c.type} type={c.type}/>)}
                                  </div>
                                  {!chapter.is_visible && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Hidden</span>}
                                  <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => toggleChapterVisible(chapter, subject.id)} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors">
                                      {chapter.is_visible ? <Eye size={12}/> : <EyeOff size={12}/>}
                                    </button>
                                    <button onClick={() => { setCf({title:chapter.title,description:chapter.description||'',order_index:chapter.order_index,is_visible:chapter.is_visible}); setChapterModal({ mode:'edit', subjectId:subject.id, data:chapter }); }}
                                      className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-colors"><Edit2 size={12}/></button>
                                    <button onClick={() => setDeleteTarget({ type:'chapter', id:chapter.id, label:chapter.title, extra:{subjectId:subject.id} })}
                                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                                    <button onClick={() => openContentModal(chapter, subject.id)}
                                      className="ml-1 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium">
                                      <Plus size={11}/>{(chapter.contents||[]).length ? 'Edit Content' : 'Add Content'}
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

      {/* ── Modals ── */}
      <AnimatePresence>
        {levelModal && (
          <Modal onClose={() => setLevelModal(null)}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{levelModal.mode==='add'?'Add Level':'Edit Level'}</h2>
              <button onClick={() => setLevelModal(null)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Name *"><Input value={lf.name} onChange={e=>setLf(p=>({...p,name:e.target.value}))} placeholder="e.g. Certificate"/></Field>
              <Field label="Description"><Input value={lf.description} onChange={e=>setLf(p=>({...p,description:e.target.value}))} placeholder="Optional"/></Field>
              <Field label="Icon"><IconPicker icons={LEVEL_ICONS} value={lf.icon} onChange={ic=>setLf(p=>({...p,icon:ic}))}/></Field>
              <Field label="Order"><Input type="number" value={lf.order_index} onChange={e=>setLf(p=>({...p,order_index:+e.target.value}))}/></Field>
              <div className="flex items-center gap-3"><Toggle value={lf.is_visible} onChange={() => setLf(p=>({...p,is_visible:!p.is_visible}))}/><span className="text-sm text-white/60">Visible to students</span></div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setLevelModal(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
              <button onClick={saveLevelModal} disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm disabled:opacity-50">
                {submitting?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}{levelModal.mode==='add'?'Create':'Save'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {subjectModal && (
          <Modal onClose={() => setSubjectModal(null)}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{subjectModal.mode==='add'?'Add Subject':'Edit Subject'}</h2>
              <button onClick={() => setSubjectModal(null)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Name *"><Input value={sf.name} onChange={e=>setSf(p=>({...p,name:e.target.value}))} placeholder="e.g. Accounting"/></Field>
              <Field label="Description"><Input value={sf.description} onChange={e=>setSf(p=>({...p,description:e.target.value}))} placeholder="Optional"/></Field>
              <Field label="Icon"><IconPicker icons={SUBJECT_ICONS} value={sf.icon} onChange={ic=>setSf(p=>({...p,icon:ic}))}/></Field>
              <Field label="Order"><Input type="number" value={sf.order_index} onChange={e=>setSf(p=>({...p,order_index:+e.target.value}))}/></Field>
              <div className="flex items-center gap-3"><Toggle value={sf.is_visible} onChange={() => setSf(p=>({...p,is_visible:!p.is_visible}))}/><span className="text-sm text-white/60">Visible to students</span></div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setSubjectModal(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
              <button onClick={saveSubjectModal} disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm disabled:opacity-50">
                {submitting?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}{subjectModal.mode==='add'?'Create':'Save'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chapterModal && (
          <Modal onClose={() => setChapterModal(null)}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{chapterModal.mode==='add'?'Add Chapter':'Edit Chapter'}</h2>
              <button onClick={() => setChapterModal(null)} className="p-2 rounded-lg hover:bg-white/[0.07] text-white/50"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Title *"><Input value={cf.title} onChange={e=>setCf(p=>({...p,title:e.target.value}))} placeholder="e.g. Chapter 1: Introduction"/></Field>
              <Field label="Description"><Input value={cf.description} onChange={e=>setCf(p=>({...p,description:e.target.value}))} placeholder="Optional"/></Field>
              <Field label="Order"><Input type="number" value={cf.order_index} onChange={e=>setCf(p=>({...p,order_index:+e.target.value}))}/></Field>
              <div className="flex items-center gap-3"><Toggle value={cf.is_visible} onChange={() => setCf(p=>({...p,is_visible:!p.is_visible}))}/><span className="text-sm text-white/60">Visible to students</span></div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-2">
              <button onClick={() => setChapterModal(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
              <button onClick={saveChapterModal} disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm disabled:opacity-50">
                {submitting?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}{chapterModal.mode==='add'?'Create':'Save'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mx-auto">
                <AlertCircle size={24} className="text-red-400"/>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Delete {deleteTarget.type}?</h3>
                <p className="text-white/50 text-sm mt-2">"<span className="text-white/80">{deleteTarget.label}</span>" and all its contents will be permanently deleted.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
                <button onClick={execDelete} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50">
                  {submitting?<Loader2 size={14} className="animate-spin"/>:<Trash2 size={14}/>}Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contentModal && (
          <ContentModal
            chapter={contentModal.chapter}
            subjectId={contentModal.subjectId}
            levelName={contentModal.levelName}
            onClose={() => setContentModal(null)}
            onSaved={onContentSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
