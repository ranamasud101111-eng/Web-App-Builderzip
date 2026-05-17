import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Bell, Send, Trash2, Edit2, Plus, X, ArrowLeft,
  Users, BookOpen, Star, Clock, Info, AlertCircle,
  CheckCheck, Megaphone, BarChart3, FileText,
  Home, LogOut, Menu, Shield, Brain, GraduationCap, Layers,
  Zap,
  HelpCircle,
} from 'lucide-react';
import api from '../api';

const typeOptions = [
  { value: 'info', label: 'Info', icon: <Info className="w-4 h-4" />, color: '#3b82f6' },
  { value: 'announcement', label: 'Announcement', icon: <Megaphone className="w-4 h-4" />, color: '#7c3aed' },
  { value: 'warning', label: 'Alert', icon: <AlertCircle className="w-4 h-4" />, color: '#f59e0b' },
  { value: 'success', label: 'Success', icon: <CheckCheck className="w-4 h-4" />, color: '#10b981' },
  { value: 'lesson', label: 'New Lesson', icon: <BookOpen className="w-4 h-4" />, color: '#06b6d4' },
];

const targetOptions = [
  { value: 'all', label: 'All Students', sub: 'Broadcast to everyone' },
  { value: 'class', label: 'By Level', sub: 'Target a class/level' },
  { value: 'user', label: 'Single Student', sub: 'Direct message' },
];

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`sidebar-item ${active ? 'active' : ''}`}>
    <span className="sidebar-icon w-4 h-4 flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function AdminNotifications() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement', target: 'all', target_value: '', is_important: false, scheduled_at: '' });

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
    fetchNotifications();
    api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try { const r = await api.get('/notifications/admin/all'); setNotifications(r.data); }
    finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      if (editItem) {
        await api.put(`/notifications/admin/${editItem.id}`, form);
        toast.success('Notification updated');
      } else {
        const r = await api.post('/notifications/admin/send', form);
        toast.success(`Sent to ${r.data.recipients} students`);
      }
      setShowForm(false); setEditItem(null); resetForm(); fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try { await api.delete(`/notifications/admin/${id}`); toast.success('Deleted'); fetchNotifications(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, message: n.message, type: n.type, target: n.target, target_value: n.target_value || '', is_important: n.is_important, scheduled_at: '' });
    setEditItem(n); setShowForm(true);
  };

  const resetForm = () => setForm({ title: '', message: '', type: 'announcement', target: 'all', target_value: '', is_important: false, scheduled_at: '' });

  const typeCfg = typeOptions.reduce((acc, t) => { acc[t.value] = t; return acc; }, {});

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
    <>
    <div className="flex min-h-screen pt-[68px]">
      <div className="hidden lg:block flex-shrink-0 fixed left-0 top-[68px] bottom-0 w-64 z-40"><Sidebar /></div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="glass p-2.5 rounded-xl"><Menu className="w-5 h-5" /></button>
          <span className="font-bold text-white">Notifications</span>
          <div className="w-10" />
        </div>

        {/* Page header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Notification Center</h1>
            <p className="text-white/35 text-sm">Send targeted notifications to your students.</p>
          </div>
          <button onClick={() => { resetForm(); setEditItem(null); setShowForm(true); }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Notification
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sent', value: notifications.length, color: '#7c3aed' },
            { label: 'Recipients', value: notifications.reduce((s, n) => s + parseInt(n.total_recipients || 0), 0), color: '#f59e0b' },
            { label: 'Total Reads', value: notifications.reduce((s, n) => s + parseInt(n.read_count || 0), 0), color: '#10b981' },
            { label: 'Important', value: notifications.filter(n => n.is_important).length, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="card-premium p-4">
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-white/35">{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 card-premium rounded-3xl">
            <Bell className="w-14 h-14 text-white/15 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
            <p className="text-white/35 mb-6 text-sm">Create your first notification to engage students.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Notification
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n, i) => {
              const tc = typeCfg[n.type] || typeCfg.info;
              return (
                <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="card-premium p-5 hover:border-purple-500/25 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{ background: `${tc.color}12`, color: tc.color, borderColor: `${tc.color}25` }}>
                      {tc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className={`font-bold text-sm ${n.is_important ? 'text-gold-400' : 'text-white/90'}`}>
                            {n.is_important && <Star className="w-3.5 h-3.5 inline mr-1.5 fill-gold-400 text-gold-400" />}
                            {n.title}
                          </h3>
                          <p className="text-white/40 text-xs mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleEdit(n)} className="p-2 glass rounded-xl hover:bg-white/[0.08] transition-colors text-white/35 hover:text-white">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(n.id)} className="p-2 glass rounded-xl hover:bg-red-500/15 transition-colors text-white/35 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-[11px] text-white/25 flex-wrap">
                        <span style={{ color: tc.color }} className="font-semibold capitalize">{tc.label}</span>
                        <span>Target: {n.target === 'all' ? 'All Students' : n.target === 'class' ? `Level ${n.target_value}` : 'Single User'}</span>
                        <span>{n.total_recipients} recipients · {n.read_count} read</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {createPortal(
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="glass-navy rounded-3xl p-8 w-full max-w-lg border border-purple-500/15 shadow-premium max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{editItem ? 'Edit Notification' : 'New Notification'}</h2>
                  <p className="text-white/35 text-sm mt-0.5">{editItem ? 'Update this notification' : 'Compose and send to students'}</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleSend} className="flex flex-col gap-5">
                <input required placeholder="Notification title" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" />
                <textarea required placeholder="Write your message here..." value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field resize-none" rows={4} />

                {/* Type */}
                <div>
                  <label className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2.5 block">Notification Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {typeOptions.map(t => (
                      <button type="button" key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.type === t.value ? 'scale-[1.02]' : 'glass border-white/[0.06] text-white/40 hover:border-white/15'}`}
                        style={form.type === t.value ? { background: `${t.color}15`, color: t.color, borderColor: `${t.color}35` } : {}}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                {!editItem && (
                  <div>
                    <label className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-2.5 block">Send To</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {targetOptions.map(t => (
                        <button type="button" key={t.value} onClick={() => setForm(p => ({ ...p, target: t.value, target_value: '' }))}
                          className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-xs border transition-all ${form.target === t.value ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'glass border-white/[0.06] text-white/40 hover:border-white/15'}`}>
                          <span className="font-semibold">{t.label}</span>
                          <span className="text-[10px] opacity-60 mt-0.5">{t.sub}</span>
                        </button>
                      ))}
                    </div>
                    {form.target === 'class' && (
                      <select value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))} required
                        className="input-field" style={{ background: 'rgba(255,255,255,0.04)', color: 'white' }}>
                        <option value="" style={{ background: '#06112e' }}>Select Level</option>
                        {['Foundation','Intermediate','Final',6,7,8,9,10,11,12].map(c => (
                          <option key={c} value={c} style={{ background: '#06112e' }}>{isNaN(c) ? `CA ${c}` : `Class ${c}`}</option>
                        ))}
                      </select>
                    )}
                    {form.target === 'user' && (
                      <select value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))} required
                        className="input-field" style={{ background: 'rgba(255,255,255,0.04)', color: 'white' }}>
                        <option value="" style={{ background: '#06112e' }}>Select Student</option>
                        {users.filter(u => u.role === 'student').map(u => (
                          <option key={u.id} value={u.id} style={{ background: '#06112e' }}>{u.name} — {u.email}</option>
                        ))}
                      </select>
                    )}
                    <div className="mt-3">
                      <label className="text-xs text-white/35 mb-2 block">Schedule (optional)</label>
                      <input type="datetime-local" value={form.scheduled_at}
                        onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                )}

                {/* Important toggle */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div onClick={() => setForm(p => ({ ...p, is_important: !p.is_important }))}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${form.is_important ? 'bg-gold-500' : 'bg-white/10'}`}>
                    <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all duration-300 shadow-sm ${form.is_important ? 'left-[22px]' : 'left-[3px]'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={`w-4 h-4 transition-colors ${form.is_important ? 'text-gold-400 fill-gold-400' : 'text-white/30'}`} />
                    <span className="text-sm text-white/55 font-medium">Mark as Important</span>
                  </div>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 btn-outline py-3 font-medium">Cancel</button>
                  <button type="submit" disabled={sending}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {sending
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Send className="w-4 h-4" />{editItem ? 'Update' : 'Send Now'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    , document.body)}
    </>
  );
}
