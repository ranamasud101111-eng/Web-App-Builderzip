import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BookOpen, Plus, X, ArrowLeft, ChevronDown, ChevronUp,
  BarChart3, Bell, Home, LogOut, Menu, Shield, FileText, Brain, GraduationCap, Layers
} from 'lucide-react';
import api from '../api';

const COLORS = ['#7c3aed','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#0ea5e9','#a855f7','#ec4899','#14b8a6'];
const ICONS = ['📚','🧮','🔬','🌍','📖','✏️','🎨','🎵','💻','⚗️','🏛️','🔭','📐','🌿','📊','💡','🏆','⚖️'];

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function AdminSubjects() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sf, setSf] = useState({ name: '', description: '', icon: '📚', color: '#7c3aed', class_level: '', order_index: 0 });
  const [cf, setCf] = useState({ title: '', content: '', video_url: '', duration_minutes: '', order_index: 0, is_preview: false });

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/subjects', label: 'Subjects & Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/mcqs', label: 'MCQ Manager', icon: <Brain className="w-4 h-4" /> },
    { to: '/admin/exams', label: 'Exam Manager', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/admin/classes', label: 'Classes', icon: <Layers className="w-4 h-4" /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Student View', icon: <Home className="w-4 h-4" /> },
  ];

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try { const r = await api.get('/subjects'); setSubjects(r.data); }
    finally { setLoading(false); }
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

  const handleSaveChapter = async (e, subjectId) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/chapters', { ...cf, subject_id: subjectId, duration_minutes: parseInt(cf.duration_minutes) || 0 });
      toast.success('Chapter added!');
      setShowChapterForm(null);
      setCf({ title: '', content: '', video_url: '', duration_minutes: '', order_index: 0, is_preview: false });
      fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar flex flex-col ${mobile ? 'w-full h-full' : 'w-64 min-h-screen'} p-5`}>
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base">CA Mock</div>
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

  return (
    <div className="flex min-h-screen pt-[68px]">
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
          <span className="font-bold text-white">Subjects</span>
          <div className="w-10" />
        </div>

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Subjects & Chapters</h1>
            <p className="text-white/35 text-sm">Create subjects and build chapter content for students.</p>
          </div>
          <button onClick={() => setShowSubjectForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Subject
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {subjects.length === 0 && (
              <div className="text-center py-24 card-premium rounded-3xl">
                <BookOpen className="w-14 h-14 text-white/15 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No subjects yet</h3>
                <p className="text-white/35 text-sm mb-6">Create your first subject to start adding content.</p>
                <button onClick={() => setShowSubjectForm(true)} className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Subject
                </button>
              </div>
            )}
            {subjects.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-premium rounded-2xl overflow-hidden">
                {/* Subject header */}
                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.03] transition-colors"
                  onClick={() => setExpanded(p => ({ ...p, [s.id]: !p[s.id] }))}>
                  <div className="text-3xl">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-white font-bold">{s.name}</h3>
                      {s.class_level && (
                        <span className="badge-gold">{isNaN(s.class_level) ? s.class_level : `Class ${s.class_level}`}</span>
                      )}
                    </div>
                    <p className="text-white/35 text-xs mt-0.5">
                      {s.chapter_count || 0} chapters · {s.student_count || 0} students enrolled
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color || '#7c3aed' }} />
                    {expanded[s.id] ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expanded[s.id] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-white/[0.05] p-5">
                        <SubjectChapters subjectId={s.id} color={s.color} />

                        {showChapterForm === s.id ? (
                          <form onSubmit={e => handleSaveChapter(e, s.id)}
                            className="glass-navy rounded-2xl p-5 mt-4 border border-purple-500/15 flex flex-col gap-3">
                            <h4 className="text-sm font-semibold text-white mb-1">Add New Chapter</h4>
                            <input required placeholder="Chapter title" value={cf.title}
                              onChange={e => setCf(p => ({ ...p, title: e.target.value }))} className="input-field" />
                            <textarea placeholder="Chapter content..." value={cf.content}
                              onChange={e => setCf(p => ({ ...p, content: e.target.value }))}
                              className="input-field resize-none" rows={5} />
                            <input placeholder="Video URL (YouTube embed, optional)" value={cf.video_url}
                              onChange={e => setCf(p => ({ ...p, video_url: e.target.value }))} className="input-field" />
                            <div className="grid grid-cols-2 gap-3">
                              <input type="number" min="0" placeholder="Duration (minutes)" value={cf.duration_minutes}
                                onChange={e => setCf(p => ({ ...p, duration_minutes: e.target.value }))} className="input-field" />
                              <input type="number" min="0" placeholder="Order index" value={cf.order_index}
                                onChange={e => setCf(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} className="input-field" />
                            </div>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input type="checkbox" checked={cf.is_preview}
                                onChange={e => setCf(p => ({ ...p, is_preview: e.target.checked }))}
                                className="w-4 h-4 accent-purple-500 rounded" />
                              <span className="text-sm text-white/55">Free preview (visible without enrollment)</span>
                            </label>
                            <div className="flex gap-2 mt-1">
                              <button type="button" onClick={() => setShowChapterForm(null)}
                                className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
                              <button type="submit" disabled={saving}
                                className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add Chapter'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setShowChapterForm(s.id)}
                            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-4 px-2 font-medium">
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
                <textarea placeholder="Brief description..." value={sf.description}
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
                      {['Foundation','Intermediate','Final',6,7,8,9,10,11,12].map(c => (
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

function SubjectChapters({ subjectId, color }) {
  const [chapters, setChapters] = useState([]);
  useEffect(() => {
    api.get(`/subjects/${subjectId}/chapters`).then(r => setChapters(r.data)).catch(() => {});
  }, [subjectId]);

  if (chapters.length === 0) return (
    <p className="text-white/25 text-sm px-2 py-2">No chapters yet — add the first one below.</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {chapters.map((ch, i) => (
        <div key={ch.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: `${color || '#7c3aed'}18`, color: color || '#a78bfa' }}>
            {i + 1}
          </div>
          <span className="text-sm text-white/65 flex-1 truncate">{ch.title}</span>
          <div className="flex items-center gap-2">
            {ch.is_preview && <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg">Preview</span>}
            {ch.duration_minutes > 0 && <span className="text-xs text-white/25">{ch.duration_minutes}m</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
