import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Circle, Plus, Trash2, Timer, Play, Pause, RotateCcw,
  Coffee, Brain, Flag, Calendar, ChevronDown, X, Flame, Target
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
};

const MODES = [
  { key: 'work',      label: 'Focus',       minutes: 25, icon: Brain,  color: '#8b5cf6' },
  { key: 'short',     label: 'Short Break', minutes: 5,  icon: Coffee, color: '#10b981' },
  { key: 'long',      label: 'Long Break',  minutes: 15, icon: Coffee, color: '#06b6d4' },
];

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function PomodoroTimer({ isDark }) {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ today_count: 0, total_count: 0, today_minutes: 0 });
  const intervalRef = useRef(null);
  const currentMode = MODES.find(m => m.key === mode);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get('/todos/pomodoro/stats'); setStats(r.data); } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    setTimeLeft(currentMode.minutes * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'work') {
              api.post('/todos/pomodoro', { duration_minutes: currentMode.minutes, completed: true })
                .then(() => fetchStats())
                .catch(() => {});
              toast.success('🍅 Pomodoro complete! Time for a break.');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const totalSec = currentMode.minutes * 60;
  const progress = (timeLeft / totalSec) * 100;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="card-premium p-6">
      <div className="flex items-center gap-2 mb-5">
        <Timer className="w-4 h-4 text-violet-400" />
        <h3 className="font-bold text-white text-sm">Pomodoro Timer</h3>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        {MODES.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all"
            style={mode === m.key
              ? { background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }
              : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative" style={{ width: 184, height: 184 }}>
          <svg width="184" height="184" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="92" cy="92" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="92" cy="92" r="80" fill="none"
              stroke={currentMode.color} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none',
                filter: `drop-shadow(0 0 8px ${currentMode.color}60)` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tabular-nums">{formatTime(timeLeft)}</span>
            <span className="text-xs font-medium mt-1" style={{ color: currentMode.color }}>
              {currentMode.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setRunning(v => !v)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all"
            style={{ background: `${currentMode.color}20`, color: currentMode.color, border: `1px solid ${currentMode.color}35` }}>
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={() => { setTimeLeft(currentMode.minutes * 60); setRunning(false); }}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <RotateCcw className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
        {[
          { label: 'Today', value: stats.today_count, icon: Flame, color: '#f59e0b' },
          { label: 'Total', value: stats.total_count, icon: Target, color: '#8b5cf6' },
          { label: 'Min Today', value: stats.today_minutes, icon: Timer, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-white/30 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodoPomodoro() {
  const { isDark } = useTheme();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDue, setNewDue] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchTodos = useCallback(async () => {
    try { const r = await api.get('/todos'); setTodos(r.data); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const r = await api.post('/todos', { title: newTitle.trim(), priority: newPriority, due_date: newDue || undefined });
      setTodos(prev => [r.data, ...prev]);
      setNewTitle('');
      setNewDue('');
    } catch { toast.error('Failed to add task'); }
    finally { setAdding(false); }
  };

  const toggleTodo = async (todo) => {
    try {
      const r = await api.patch(`/todos/${todo.id}`, { completed: !todo.completed });
      setTodos(prev => prev.map(t => t.id === todo.id ? r.data : t));
    } catch { toast.error('Failed to update task'); }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch { toast.error('Failed to delete task'); }
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const doneCount = todos.filter(t => t.completed).length;
  const activeCount = todos.length - doneCount;

  return (
    <div className="px-5 sm:px-7 max-w-[1200px] mx-auto pb-16 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">To-Do & Pomodoro</h1>
        <p className="text-sm text-white/35 mt-1">Stay focused and track your study tasks</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* To-Do Section */}
        <div className="lg:col-span-2 space-y-4">

          {/* Add task form */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card-premium p-5">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex gap-2">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="Add a new study task..."
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors" />
                <button type="submit" disabled={adding || !newTitle.trim()}
                  className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-white/30" />
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white/30" />
                  <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none" />
                </div>
              </div>
            </form>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Tasks', value: todos.length, color: '#8b5cf6' },
              { label: 'Active', value: activeCount, color: '#f59e0b' },
              { label: 'Completed', value: doneCount, color: '#10b981' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                className="card-premium p-4 text-center">
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[11px] text-white/30 font-medium mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {['all', 'active', 'done'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={filter === f
                  ? { background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {f}
              </button>
            ))}
          </div>

          {/* Todo list */}
          <div className="space-y-2">
            <AnimatePresence>
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="shimmer h-16 rounded-2xl" />)
              ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card-premium p-10 text-center">
                  <CheckCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">
                    {filter === 'done' ? 'No completed tasks yet' : filter === 'active' ? 'No active tasks' : 'No tasks yet — add one above!'}
                  </p>
                </motion.div>
              ) : filtered.map((todo, i) => {
                const pc = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
                return (
                  <motion.div key={todo.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="card-premium p-4 flex items-center gap-3 group hover:border-violet-500/20 transition-all">
                    <button onClick={() => toggleTodo(todo)} className="flex-shrink-0 transition-transform hover:scale-110">
                      {todo.completed
                        ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                        : <Circle className="w-5 h-5 text-white/20 group-hover:text-white/40" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium transition-all ${todo.completed ? 'line-through text-white/25' : 'text-white/85'}`}>
                        {todo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
                          {pc.label}
                        </span>
                        {todo.due_date && (
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(todo.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/15">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Pomodoro column */}
        <div>
          <PomodoroTimer isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
