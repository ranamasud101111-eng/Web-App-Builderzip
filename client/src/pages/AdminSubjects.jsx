import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { BookOpen, Plus, X, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#0ea5e9','#a855f7'];
const ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','🎵','💻','⚗️','🏛️','🔭','📐','🌿'];

export default function AdminSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', icon: '📚', color: '#6366f1', class_level: '', order_index: 0 });
  const [chapterForm, setChapterForm] = useState({ title: '', content: '', video_url: '', duration_minutes: 0, order_index: 0, is_preview: false });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } finally { setLoading(false); }
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/subjects', subjectForm);
      toast.success('Subject created!');
      setShowForm(false);
      setSubjectForm({ name: '', description: '', icon: '📚', color: '#6366f1', class_level: '', order_index: 0 });
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create subject');
    } finally { setSaving(false); }
  };

  const handleSaveChapter = async (e, subjectId) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/chapters', { ...chapterForm, subject_id: subjectId });
      toast.success('Chapter added!');
      setShowChapterForm(null);
      setChapterForm({ title: '', content: '', video_url: '', duration_minutes: 0, order_index: 0, is_preview: false });
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add chapter');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-3 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Admin
            </button>
            <h1 className="text-4xl font-black text-white mb-2">Manage <span className="gradient-text">Subjects</span></h1>
            <p className="text-white/50">Create subjects and add chapter content.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Subject
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.length === 0 && (
              <div className="text-center py-20 glass rounded-3xl border border-white/5">
                <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No subjects yet. Create your first subject!</p>
              </div>
            )}
            {subjects.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl border border-white/5 overflow-hidden">
                {/* Subject header */}
                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpanded(p => ({ ...p, [s.id]: !p[s.id] }))}>
                  <div className="text-3xl">{s.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold">{s.name}</h3>
                      {s.class_level && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${s.color}20`, color: s.color }}>Class {s.class_level}</span>}
                    </div>
                    <p className="text-white/40 text-sm">{s.chapter_count || 0} chapters · {s.student_count || 0} students</p>
                  </div>
                  {expanded[s.id] ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                </div>
                
                {/* Expanded chapters */}
                <AnimatePresence>
                  {expanded[s.id] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-white/10 p-4">
                        <SubjectChapters subjectId={s.id} color={s.color} />
                        {showChapterForm === s.id ? (
                          <form onSubmit={e => handleSaveChapter(e, s.id)} className="glass rounded-xl p-4 mt-3 border border-white/10 flex flex-col gap-3">
                            <input required placeholder="Chapter title" value={chapterForm.title} onChange={e => setChapterForm(p => ({ ...p, title: e.target.value }))} className="input-field" />
                            <textarea placeholder="Chapter content..." value={chapterForm.content} onChange={e => setChapterForm(p => ({ ...p, content: e.target.value }))} className="input-field resize-none" rows={4} />
                            <input placeholder="Video URL (optional)" value={chapterForm.video_url} onChange={e => setChapterForm(p => ({ ...p, video_url: e.target.value }))} className="input-field" />
                            <div className="grid grid-cols-2 gap-3">
                              <input type="number" placeholder="Duration (min)" value={chapterForm.duration_minutes} onChange={e => setChapterForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) }))} className="input-field" />
                              <input type="number" placeholder="Order index" value={chapterForm.order_index} onChange={e => setChapterForm(p => ({ ...p, order_index: parseInt(e.target.value) }))} className="input-field" />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={chapterForm.is_preview} onChange={e => setChapterForm(p => ({ ...p, is_preview: e.target.checked }))} className="w-4 h-4 accent-indigo-500" />
                              <span className="text-sm text-white/60">Free preview (visible without enrollment)</span>
                            </label>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setShowChapterForm(null)} className="flex-1 glass py-2 rounded-xl text-white/50 hover:text-white transition-colors">Cancel</button>
                              <button type="submit" disabled={saving} className="flex-1 btn-primary py-2 text-sm">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Add Chapter'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setShowChapterForm(s.id)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-3 px-2">
                            <Plus className="w-4 h-4" /> Add Chapter
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Subject creation modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Subject</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <form onSubmit={handleSaveSubject} className="flex flex-col gap-4">
                <input required placeholder="Subject name" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
                <textarea placeholder="Description" value={subjectForm.description} onChange={e => setSubjectForm(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" rows={3} />
                
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Choose Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button type="button" key={icon} onClick={() => setSubjectForm(p => ({ ...p, icon }))}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${subjectForm.icon === icon ? 'bg-indigo-500/30 border-2 border-indigo-400 scale-110' : 'glass border border-white/10 hover:border-white/30'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-2 block">Choose Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                      <button type="button" key={color} onClick={() => setSubjectForm(p => ({ ...p, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${subjectForm.color === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Class Level</label>
                    <select value={subjectForm.class_level} onChange={e => setSubjectForm(p => ({ ...p, class_level: e.target.value }))} className="input-field" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                      <option value="" style={{ background: '#1a1a3e' }}>All Classes</option>
                      {[6,7,8,9,10,11,12].map(c => <option key={c} value={c} style={{ background: '#1a1a3e' }}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Order</label>
                    <input type="number" value={subjectForm.order_index} onChange={e => setSubjectForm(p => ({ ...p, order_index: parseInt(e.target.value) }))} className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 glass py-3 rounded-xl text-white/60 hover:text-white transition-all font-medium">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Create Subject</>}
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

function SubjectChapters({ subjectId, color }) {
  const [chapters, setChapters] = useState([]);
  useEffect(() => {
    api.get(`/subjects/${subjectId}/chapters`).then(r => setChapters(r.data)).catch(() => {});
  }, [subjectId]);
  if (chapters.length === 0) return <p className="text-white/30 text-sm px-2">No chapters yet.</p>;
  return (
    <div className="space-y-2">
      {chapters.map((ch, i) => (
        <div key={ch.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${color}20`, color }}>
            {i + 1}
          </div>
          <span className="text-sm text-white/70">{ch.title}</span>
          {ch.is_preview && <span className="text-xs text-green-400 px-1.5 py-0.5 rounded bg-green-500/10">Preview</span>}
          {ch.duration_minutes > 0 && <span className="text-xs text-white/30 ml-auto">{ch.duration_minutes}min</span>}
        </div>
      ))}
    </div>
  );
}
