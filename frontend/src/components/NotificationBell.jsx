import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, AlertCircle, Info, BookOpen, Megaphone, Star, Trash2 } from 'lucide-react';
import api from '../api';

const TYPE_CONFIG = {
  info: { icon: <Info className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  warning: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  success: { icon: <CheckCheck className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  announcement: { icon: <Megaphone className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  lesson: { icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchCount = async () => {
    try { const r = await api.get('/notifications/unread-count'); setUnreadCount(r.data.count); } catch {}
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      api.get('/notifications').then(r => setNotifications(r.data)).finally(() => setLoading(false));
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(p => p.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(p => {
        const n = p.find(x => x.id === id);
        if (n && !n.is_read) setUnreadCount(c => Math.max(0, c - 1));
        return p.filter(x => x.id !== id);
      });
    } catch {}
  };

  return (
    <div className="relative" ref={panelRef}>
      <button ref={bellRef} onClick={handleOpen}
        className="relative p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-all duration-200 group">
        <Bell className={`w-[18px] h-[18px] text-white/55 group-hover:text-white transition-colors ${unreadCount > 0 ? 'bell-ring' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold border-2 border-navy-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[380px] glass-navy rounded-2xl shadow-premium border border-purple-500/15 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white text-sm">Notifications</span>
              {unreadCount > 0 && <span className="badge-purple">{unreadCount} new</span>}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/[0.08] rounded-lg transition-colors">
                <X className="w-4 h-4 text-white/35" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-14 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-white/30 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                return (
                  <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                    className={`px-5 py-4 border-b border-white/[0.04] cursor-pointer transition-all duration-200 group/item ${!n.is_read ? 'bg-purple-500/[0.04] hover:bg-purple-500/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold line-clamp-1 ${n.is_important ? 'text-gold-400' : 'text-white/90'}`}>
                            {n.is_important && <Star className="w-3 h-3 inline mr-1 fill-gold-400 text-gold-400" />}
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-purple-400 mt-0.5"></div>}
                            <button
                              onClick={(e) => deleteNotification(e, n.id)}
                              className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md hover:bg-red-500/15 transition-all"
                              title="Delete notification">
                              <Trash2 className="w-3 h-3 text-red-400/60 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-white/25 mt-1.5 font-medium">{formatTime(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-white/[0.06] flex justify-center">
              <span className="text-[11px] text-white/25">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
