import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Bell, Send, Trash2, Edit2, Plus, X, ArrowLeft, Users, BookOpen, Star, Clock, Info, AlertCircle, CheckCheck, Megaphone } from 'lucide-react';
import api from '../api';

const typeOptions = [
  { value: 'info', label: 'Info', icon: <Info className="w-4 h-4" />, color: '#3b82f6' },
  { value: 'announcement', label: 'Announcement', icon: <Megaphone className="w-4 h-4" />, color: '#8b5cf6' },
  { value: 'warning', label: 'Warning', icon: <AlertCircle className="w-4 h-4" />, color: '#f59e0b' },
  { value: 'success', label: 'Success', icon: <CheckCheck className="w-4 h-4" />, color: '#10b981' },
  { value: 'lesson', label: 'New Lesson', icon: <BookOpen className="w-4 h-4" />, color: '#06b6d4' },
];

const targetOptions = [
  { value: 'all', label: 'All Students', icon: <Users className="w-4 h-4" /> },
  { value: 'class', label: 'By Class', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'user', label: 'Specific User', icon: <Users className="w-4 h-4" /> },
];

const typeBg = { info: 'bg-blue-500/10 border-blue-500/20 text-blue-400', announcement: 'bg-purple-500/10 border-purple-500/20 text-purple-400', warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', success: 'bg-green-500/10 border-green-500/20 text-green-400', lesson: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' };

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all', target_value: '', is_important: false, scheduled_at: '' });

  useEffect(() => {
    fetchNotifications();
    api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/admin/all');
      setNotifications(res.data);
    } finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      if (editItem) {
        await api.put(`/notifications/admin/${editItem.id}`, form);
        toast.success('Notification updated');
      } else {
        const res = await api.post('/notifications/admin/send', form);
        toast.success(`Notification sent to ${res.data.recipients} students!`);
      }
      setShowForm(false);
      setEditItem(null);
      resetForm();
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send notification');
    } finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, message: n.message, type: n.type, target: n.target, target_value: n.target_value || '', is_important: n.is_important, scheduled_at: '' });
    setEditItem(n);
    setShowForm(true);
  };

  const resetForm = () => setForm({ title: '', message: '', type: 'info', target: 'all', target_value: '', is_important: false, scheduled_at: '' });

  const openCreate = () => { resetForm(); setEditItem(null); setShowForm(true); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-3 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Admin
            </button>
            <h1 className="text-4xl font-black text-white mb-2">Notification <span className="gradient-text">Center</span></h1>
            <p className="text-white/50">Send targeted notifications to your students.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 glow-blue">
            <Plus className="w-4 h-4" /> New Notification
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sent', value: notifications.length, color: '#6366f1' },
            { label: 'Total Recipients', value: notifications.reduce((s, n) => s + parseInt(n.total_recipients || 0), 0), color: '#8b5cf6' },
            { label: 'Total Reads', value: notifications.reduce((s, n) => s + parseInt(n.read_count || 0), 0), color: '#10b981' },
            { label: 'Important', value: notifications.filter(n => n.is_important).length, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Notification list */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl border border-white/5">
                <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
                <p className="text-white/40 mb-6">Send your first notification to students.</p>
                <button onClick={openCreate} className="btn-primary">Create Notification</button>
              </div>
            ) : (
              notifications.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 flex-shrink-0 ${typeBg[n.type] || typeBg.info}`}>
                      {typeOptions.find(t => t.value === n.type)?.icon}
                      {n.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className={`font-bold text-white ${n.is_important ? 'text-yellow-300' : ''}`}>
                            {n.is_important && '⭐ '}{n.title}
                          </h3>
                          <p className="text-white/50 text-sm mt-1">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleEdit(n)} className="p-2 glass rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(n.id)} className="p-2 glass rounded-xl hover:bg-red-500/20 transition-colors text-white/40 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-white/30 flex-wrap">
                        <span>Target: <span className="text-white/50">{n.target === 'all' ? 'All Students' : n.target === 'class' ? `Class ${n.target_value}` : `User #${n.target_value}`}</span></span>
                        <span>{n.total_recipients} recipients · {n.read_count} read</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Send/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editItem ? 'Edit Notification' : 'New Notification'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <form onSubmit={handleSend} className="flex flex-col gap-4">
                <input required placeholder="Notification title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" />
                <textarea required placeholder="Message content..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="input-field resize-none" rows={4} />
                
                {/* Type */}
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Notification Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {typeOptions.map(t => (
                      <button type="button" key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${form.type === t.value ? 'border-current' : 'glass border-white/10 text-white/50'}`}
                        style={form.type === t.value ? { background: `${t.color}20`, color: t.color, borderColor: `${t.color}40` } : {}}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                {!editItem && (
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Send To</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {targetOptions.map(t => (
                        <button type="button" key={t.value} onClick={() => setForm(p => ({ ...p, target: t.value, target_value: '' }))}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${form.target === t.value ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'glass border-white/10 text-white/50'}`}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                    {form.target === 'class' && (
                      <select value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))} required className="input-field" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        <option value="" style={{ background: '#1a1a3e' }}>Select Class</option>
                        {[6,7,8,9,10,11,12].map(c => <option key={c} value={c} style={{ background: '#1a1a3e' }}>Class {c}</option>)}
                      </select>
                    )}
                    {form.target === 'user' && (
                      <select value={form.target_value} onChange={e => setForm(p => ({ ...p, target_value: e.target.value }))} required className="input-field" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        <option value="" style={{ background: '#1a1a3e' }}>Select Student</option>
                        {users.filter(u => u.role === 'student').map(u => <option key={u.id} value={u.id} style={{ background: '#1a1a3e' }}>{u.name} ({u.email})</option>)}
                      </select>
                    )}
                    {/* Schedule */}
                    <div className="mt-3">
                      <label className="text-xs text-white/50 mb-2 block">Schedule (optional)</label>
                      <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} className="input-field" />
                    </div>
                  </div>
                )}

                {/* Important toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(p => ({ ...p, is_important: !p.is_important }))}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form.is_important ? 'bg-yellow-500' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${form.is_important ? 'left-6' : 'left-0.5'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white/70">Mark as Important</span>
                  </div>
                </label>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 glass py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium">Cancel</button>
                  <button type="submit" disabled={sending} className="flex-1 btn-primary flex items-center justify-center gap-2 glow-blue disabled:opacity-50">
                    {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> {editItem ? 'Update' : 'Send Now'}</>}
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
