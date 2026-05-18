import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import {
  Activity, BookOpen, CheckCircle2, Target, Brain, Zap, Trophy,
  Clock, TrendingUp, Star, BarChart2, ChevronDown, ChevronUp,
  AlertCircle, Layers
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';

const LEVEL_COLORS = {
  Certificate: '#8b5cf6',
  Professional: '#06b6d4',
  Advanced: '#f59e0b',
};
const DEFAULT_COLOR = '#6366f1';

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.1)'}`,
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
        <p className={`text-[11px] font-semibold mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{label}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, color, collapsed, onToggle }) {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between mb-4 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h2 className={`text-[15px] font-bold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{title}</h2>
      </div>
      {collapsed
        ? <ChevronDown className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
        : <ChevronUp className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />}
    </button>
  );
}

function ProgressBar({ value, color, height = 6 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function Card({ children, className = '' }) {
  const { isDark } = useTheme();
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.1)'}`,
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}

function formatTime(secs) {
  if (!secs) return '0m';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-semibold shadow-xl"
      style={{
        background: isDark ? '#0f1a35' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.15)'}`,
        color: isDark ? 'rgba(255,255,255,0.8)' : '#1e293b',
      }}>
      <p className="mb-1 opacity-60">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%</p>
      ))}
    </div>
  );
};

export default function ProgressTracker() {
  const { isDark } = useTheme();
  const { modules } = useModuleSettings();
  const sections = modules.progressSections || {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const toggle = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  useEffect(() => {
    api.get('/progress/my-full-progress')
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load progress data'))
      .finally(() => setLoading(false));
  }, []);

  const textMuted = isDark ? 'text-white/40' : 'text-slate-400';
  const textSub = isDark ? 'text-white/60' : 'text-slate-600';
  const divider = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.08)';

  if (loading) {
    return (
      <div className="px-5 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-24 animate-pulse"
              style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }} />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl h-48 mb-5 animate-pulse"
            style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 md:px-8 max-w-6xl mx-auto">
        <Card className="flex flex-col items-center py-16 gap-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className={`text-sm font-semibold ${textSub}`}>{error}</p>
        </Card>
      </div>
    );
  }

  const { levelProgress, subjectProgress, chapterProgress, mcqProgress, examProgress, quizProgress } = data;

  const enrolledSubjects = subjectProgress.filter(s => s.enrolled);
  const completedSubjects = enrolledSubjects.filter(s => s.percentage === 100);
  const completedChapters = chapterProgress.filter(c => c.completed);
  const totalChapters = chapterProgress.length;

  const quizChartData = quizProgress.recentAttempts.map((a, i) => ({
    attempt: `#${i + 1}`,
    score: a.score,
  }));

  const mcqDonutData = mcqProgress.totalAnswered > 0 ? [
    { name: 'Correct', value: mcqProgress.totalCorrect, fill: '#22c55e' },
    { name: 'Wrong', value: mcqProgress.totalWrong, fill: '#ef4444' },
  ] : [{ name: 'No data', value: 1, fill: 'rgba(255,255,255,0.08)' }];

  return (
    <div className="px-5 md:px-8 max-w-6xl mx-auto space-y-6 pb-10">

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Brain} label="MCQs Practiced" value={mcqProgress.totalQuestions.toLocaleString()} color="#8b5cf6" delay={0} />
        <StatCard icon={Target} label="Accuracy" value={`${mcqProgress.accuracyPercent}%`} sub={`${mcqProgress.totalCorrect} correct`} color="#06b6d4" delay={0.05} />
        <StatCard icon={CheckCircle2} label="Chapters Done" value={completedChapters.length} sub={`of ${totalChapters} enrolled`} color="#22c55e" delay={0.1} />
        <StatCard icon={Trophy} label="Exams Taken" value={examProgress.mockExamsTaken + examProgress.customExamsTaken} sub={`Best: ${examProgress.bestScore.toFixed(1)}%`} color="#f59e0b" delay={0.15} />
      </div>

      {/* Level Progress */}
      {sections.levelProgress !== false && levelProgress.length > 0 && (
        <Card>
          <SectionHeader icon={Layers} title="Level Progress" color="#8b5cf6" collapsed={collapsed.level} onToggle={() => toggle('level')} />
          {!collapsed.level && (
            <div className="space-y-5">
              {levelProgress.map(lp => (
                <div key={lp.level}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: LEVEL_COLORS[lp.level] || DEFAULT_COLOR }} />
                      <span className={`text-[13px] font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{lp.level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-medium ${textMuted}`}>{lp.completedChapters}/{lp.totalChapters} chapters</span>
                      <span className="text-[13px] font-black" style={{ color: LEVEL_COLORS[lp.level] || DEFAULT_COLOR }}>{lp.percentage}%</span>
                    </div>
                  </div>
                  <ProgressBar value={lp.percentage} color={LEVEL_COLORS[lp.level] || DEFAULT_COLOR} height={8} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Subject Progress */}
      {sections.subjectProgress !== false && (
        <Card>
          <SectionHeader icon={BookOpen} title="Subject Progress" color="#06b6d4" collapsed={collapsed.subject} onToggle={() => toggle('subject')} />
          {!collapsed.subject && (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
                  <p className="text-lg font-black text-violet-400">{enrolledSubjects.length}</p>
                  <p className={`text-[10px] font-semibold ${textMuted}`}>Enrolled</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <p className="text-lg font-black text-green-400">{completedSubjects.length}</p>
                  <p className={`text-[10px] font-semibold ${textMuted}`}>Completed</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(6,182,212,0.1)' }}>
                  <p className="text-lg font-black text-cyan-400">{subjectProgress.length}</p>
                  <p className={`text-[10px] font-semibold ${textMuted}`}>Total Subjects</p>
                </div>
              </div>
              {enrolledSubjects.length === 0 ? (
                <p className={`text-sm text-center py-6 ${textMuted}`}>No enrolled subjects yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {enrolledSubjects.map(s => (
                    <div key={s.id} className="rounded-xl p-4"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(124,58,237,0.03)',
                        border: `1px solid ${divider}`,
                      }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-bold truncate ${isDark ? 'text-white/85' : 'text-slate-700'}`}>{s.name}</p>
                          <p className={`text-[10px] ${textMuted}`}>{s.classLevel}</p>
                        </div>
                        <span className="text-[13px] font-black" style={{ color: s.color || DEFAULT_COLOR }}>{s.percentage}%</span>
                      </div>
                      <ProgressBar value={s.percentage} color={s.color || DEFAULT_COLOR} height={5} />
                      <p className={`text-[10px] mt-2 ${textMuted}`}>{s.completedChapters}/{s.totalChapters} chapters done</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Chapter Progress */}
      {sections.chapterProgress !== false && chapterProgress.length > 0 && (
        <Card>
          <SectionHeader icon={BookOpen} title="Chapter Progress" color="#22c55e" collapsed={collapsed.chapter} onToggle={() => toggle('chapter')} />
          {!collapsed.chapter && (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <p className="text-lg font-black text-green-400">{completedChapters.length}</p>
                  <p className={`text-[10px] font-semibold ${textMuted}`}>Completed</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <p className="text-lg font-black text-red-400">{totalChapters - completedChapters.length}</p>
                  <p className={`text-[10px] font-semibold ${textMuted}`}>Remaining</p>
                </div>
              </div>
              <div className="mb-3">
                <ProgressBar
                  value={totalChapters > 0 ? Math.round((completedChapters.length / totalChapters) * 100) : 0}
                  color="linear-gradient(90deg, #22c55e, #16a34a)"
                  height={10}
                />
                <p className={`text-[11px] mt-1.5 ${textMuted}`}>{totalChapters > 0 ? Math.round((completedChapters.length / totalChapters) * 100) : 0}% overall completion</p>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                {chapterProgress.map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2 rounded-lg px-2"
                    style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${c.completed ? 'bg-green-500/20' : 'bg-white/5'}`}>
                      {c.completed
                        ? <CheckCircle2 className="w-3 h-3 text-green-400" />
                        : <div className="w-2 h-2 rounded-full bg-white/15" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold truncate ${c.completed ? (isDark ? 'text-white/70' : 'text-slate-600') : (isDark ? 'text-white/85' : 'text-slate-700')}`}>{c.title}</p>
                      <p className={`text-[10px] ${textMuted}`}>{c.subjectIcon} {c.subjectName}</p>
                    </div>
                    {c.completed && c.completedAt && (
                      <p className={`text-[10px] flex-shrink-0 ${textMuted}`}>
                        {new Date(c.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* MCQ Progress */}
      {sections.mcqProgress !== false && (
        <Card>
          <SectionHeader icon={Brain} title="MCQ Practice Progress" color="#8b5cf6" collapsed={collapsed.mcq} onToggle={() => toggle('mcq')} />
          {!collapsed.mcq && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Attempted', value: mcqProgress.totalAnswered.toLocaleString(), color: '#8b5cf6' },
                    { label: 'Accuracy', value: `${mcqProgress.accuracyPercent}%`, color: '#06b6d4' },
                    { label: 'Correct', value: mcqProgress.totalCorrect.toLocaleString(), color: '#22c55e' },
                    { label: 'Wrong', value: mcqProgress.totalWrong.toLocaleString(), color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }}>
                      <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${textMuted}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }}>
                  <p className={`text-[11px] font-semibold mb-1 ${textMuted}`}>Time Spent Practicing</p>
                  <p className="text-lg font-black text-amber-400">{formatTime(mcqProgress.totalTimeSeconds)}</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {mcqProgress.totalAnswered > 0 ? (
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="50%" outerRadius="90%" data={mcqDonutData} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={6} />
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      {mcqDonutData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                          <span className={`text-[11px] font-semibold ${textSub}`}>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm text-center ${textMuted}`}>No practice sessions yet.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Exam Progress */}
      {sections.examProgress !== false && (
        <Card>
          <SectionHeader icon={Target} title="Exam Progress" color="#f59e0b" collapsed={collapsed.exam} onToggle={() => toggle('exam')} />
          {!collapsed.exam && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Mock Exams', value: examProgress.mockExamsTaken, color: '#8b5cf6', icon: Target },
                { label: 'Custom Exams', value: examProgress.customExamsTaken, color: '#06b6d4', icon: Zap },
                { label: 'Best Score', value: `${examProgress.bestScore.toFixed(1)}%`, color: '#22c55e', icon: Star },
                { label: 'Avg Score', value: `${examProgress.avgScore.toFixed(1)}%`, color: '#f59e0b', icon: TrendingUp },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-4" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${item.color}22` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${textMuted}`}>{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Quiz Progress */}
      {sections.quizProgress !== false && (
        <Card>
          <SectionHeader icon={Zap} title="Quiz Progress" color="#06b6d4" collapsed={collapsed.quiz} onToggle={() => toggle('quiz')} />
          {!collapsed.quiz && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Total Quizzes', value: quizProgress.totalAttempts, color: '#8b5cf6' },
                    { label: 'Best Score', value: `${quizProgress.bestScore.toFixed(1)}%`, color: '#22c55e' },
                    { label: 'Avg Score', value: `${quizProgress.avgScore.toFixed(1)}%`, color: '#06b6d4' },
                    { label: 'Time Spent', value: formatTime(quizProgress.totalTimeSeconds), color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }}>
                      <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${textMuted}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {quizChartData.length > 0 ? (
                  <>
                    <p className={`text-[11px] font-semibold mb-3 ${textMuted}`}>Recent Quiz Scores</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={quizChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                        <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }} />
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        <Area type="monotone" dataKey="score" name="Score" stroke="#06b6d4" strokeWidth={2} fill="url(#quizGrad)" dot={{ fill: '#06b6d4', r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <p className={`text-sm text-center py-8 ${textMuted}`}>No quiz attempts yet.</p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
