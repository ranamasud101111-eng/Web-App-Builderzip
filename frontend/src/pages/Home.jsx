import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, Users, Trophy, Zap, Star, Lock,
  ChevronRight, BarChart3, Shield, CheckCircle, Target, Clock,
  Award, TrendingUp, FileText, ChevronDown, GraduationCap, MapPin,
  Sparkles, Brain, XCircle, Bookmark, Play, Flame, BarChart2
} from 'lucide-react';
import api from '../api';

/* ─── Animated counter ─────────────────────────────────────────────────────── */
const Counter = ({ end, suffix = '', prefix = '' }) => {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        let cur = 0;
        const step = end / 70;
        const t = setInterval(() => { cur += step; if (cur >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(cur)); }, 22);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, started]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

/* ─── FAQ item ──────────────────────────────────────────────────────────────── */
const FAQ = ({ q, a, isDark }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
      isDark
        ? open ? 'border border-violet-500/30 bg-violet-500/5' : 'border border-white/[0.07] bg-white/[0.025]'
        : open ? 'border border-violet-300 bg-violet-50' : 'border border-slate-200 bg-white'
    }`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
        <span className={`font-semibold text-sm pr-4 ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-violet-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className={`px-6 pb-5 text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{a}</div>}
    </div>
  );
};

const STATS = [
  { end: 20000, suffix: '+', label: 'Students Enrolled', icon: Users },
  { end: 5000, suffix: '+', label: 'MCQs & Mock Tests', icon: FileText },
  { end: 98, suffix: '%', label: 'Student Satisfaction', icon: Star },
  { end: 300, suffix: '+', label: 'ICAB Topics Covered', icon: BookOpen },
];

const FEATURES = [
  { icon: Target, title: 'ICAB-Pattern MCQs', desc: 'Questions precisely aligned with ICAB Certificate and Professional Level exam patterns and syllabus', color: '#7c3aed' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Identify your weak areas with chapter-wise performance breakdowns and score trends', color: '#f59e0b' },
  { icon: Trophy, title: 'National Leaderboard', desc: 'Compete with CA aspirants across Bangladesh and see where you stand nationwide', color: '#10b981' },
  { icon: Zap, title: 'Instant Feedback', desc: 'Learn from every mistake immediately with detailed answer explanations and references', color: '#06b6d4' },
  { icon: Shield, title: 'Expert Content', desc: 'Study material prepared by ICAB-qualified faculty and CA examination toppers', color: '#8b5cf6' },
  { icon: Clock, title: 'Timed Mock Tests', desc: 'Simulate real ICAB exam conditions with chapter-wise and full-length timed papers', color: '#f43f5e' },
];

const TESTIMONIALS = [
  { name: 'Tanvir Ahmed', level: 'CA Professional Level — Top Performer', text: 'CA Aspire BD is the most focused platform for ICAB preparation in Bangladesh. The mock tests are exactly like the real exams. Passed Professional Level on the first attempt!', stars: 5, initials: 'TA', color: '#7c3aed' },
  { name: 'Nusrat Jahan', level: 'CA Certificate Level — First Attempt', text: 'The chapter-wise practice helped me understand exactly where I was weak. The analytics are brilliant. CA Aspire BD made my Certificate Level preparation structured and effective.', stars: 5, initials: 'NJ', color: '#10b981' },
  { name: 'Mahmudul Hasan', level: 'CA Certificate Level Topper', text: 'As a Bangladeshi CA student, I needed a platform built for ICAB — not ICAI. CA Aspire BD is exactly that. The leaderboard kept me motivated throughout my preparation.', stars: 5, initials: 'MH', color: '#f59e0b' },
];

const FAQS = [
  { q: 'Is CA Aspire BD suitable for all ICAB levels?', a: 'Yes. CA Aspire BD covers both the CA Certificate Level and CA Professional Level under ICAB. Each subject is organized by level with appropriate difficulty and syllabus alignment.' },
  { q: 'How many mock tests are available for ICAB preparation?', a: 'We have 5,000+ MCQs across all ICAB subjects, organized into topic-wise and chapter-wise practice sets fully aligned with the ICAB syllabus and exam format.' },
  { q: 'Is the platform free to use?', a: 'CA Aspire BD offers a free tier with access to selected chapters and preview questions. Full access to all chapters, mock tests, and analytics is available with premium enrollment.' },
  { q: 'How closely do mock tests match real ICAB exams?', a: 'Our content is prepared by ICAB-qualified faculty and regularly reviewed against the latest ICAB syllabi. The question pattern, difficulty level, and marking scheme closely mirror actual ICAB examinations.' },
  { q: 'Can I track my progress over time?', a: 'Yes. Your dashboard shows detailed progress analytics including chapters completed, MCQ scores, time spent studying, wrong answer reviews, and your ranking on the national leaderboard.' },
];

/* ─── Floating icon bubble ─────────────────────────────────────────────────── */
const FloatIcon = ({ icon: Icon, color, style, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -18, 0], rotate: [0, 4, -2, 0] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    className="absolute hidden lg:flex items-center justify-center w-12 h-12 rounded-2xl shadow-xl"
    style={{ ...style, background: `${color}18`, border: `1px solid ${color}30`, backdropFilter: 'blur(12px)' }}>
    <Icon className="w-5 h-5" style={{ color }} />
  </motion.div>
);

/* ─── Dashboard preview mockup ─────────────────────────────────────────────── */
const DashboardPreview = ({ isDark }) => (
  <div className={`rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-violet-500/15 bg-[#08091e]' : 'border-violet-200 bg-slate-50'}`}>
    {/* Window chrome */}
    <div className={`flex items-center gap-2 px-4 py-3 ${isDark ? 'bg-[#0d0f2b] border-b border-white/[0.05]' : 'bg-white border-b border-slate-100'}`}>
      <div className="w-3 h-3 rounded-full bg-red-400" />
      <div className="w-3 h-3 rounded-full bg-amber-400" />
      <div className="w-3 h-3 rounded-full bg-emerald-400" />
      <div className={`flex-1 mx-4 rounded-full text-center text-[10px] py-1 px-3 ${isDark ? 'bg-white/5 text-white/25' : 'bg-slate-100 text-slate-400'}`}>caaspirebd.com/dashboard</div>
    </div>
    {/* Content */}
    <div className="p-5 space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-4 gap-3">
        {[['5', 'Subjects', '#8b5cf6'], ['72%', 'Progress', '#10b981'], ['38', 'Chapters', '#06b6d4'], ['3', 'Tests', '#f59e0b']].map(([v, l, c]) => (
          <div key={l} className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.04] border border-white/[0.05]' : 'bg-white border border-slate-100 shadow-sm'}`}>
            <div className="text-lg font-black" style={{ color: c }}>{v}</div>
            <div className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{l}</div>
          </div>
        ))}
      </div>
      {/* Chart placeholder */}
      <div className={`rounded-xl p-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.04]' : 'bg-white border border-slate-100 shadow-sm'}`}>
        <div className={`text-[11px] font-bold mb-3 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Weekly Activity</div>
        <div className="flex items-end gap-1.5 h-14">
          {[45, 72, 58, 89, 63, 95, 78].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md transition-all" style={{ height: `${h}%`, background: `linear-gradient(to top, #7c3aed88, #8b5cf666)` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
            <span key={idx} className={`flex-1 text-center text-[8px] ${isDark ? 'text-white/20' : 'text-slate-300'}`}>{d}</span>
          ))}
        </div>
      </div>
      {/* Subject cards */}
      <div className="space-y-2">
        {[['Financial Accounting', 78, '#7c3aed'], ['Business Law', 45, '#10b981'], ['Auditing', 92, '#f59e0b']].map(([name, pct, color]) => (
          <div key={name} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/[0.04]' : 'bg-white border border-slate-100 shadow-sm'}`}>
            <div className="flex-1">
              <div className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{name}</div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.08]' : 'bg-slate-100'}`}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
              </div>
            </div>
            <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data.slice(0, 6))).catch(() => {});
  }, []);

  /* ── Theme-specific classes ──────────────────────────────────────────────── */
  const pageBg = isDark
    ? 'bg-[#050816]'
    : 'bg-gradient-to-br from-[#fafaff] via-[#f5f3ff] to-[#eef4ff]';

  const sectionMuted = isDark ? 'bg-[#06112e]/60' : 'bg-violet-50/70';

  const headingPrimary = isDark ? 'text-white' : 'text-violet-950';
  const textMuted = isDark ? 'text-white/45' : 'text-slate-500';
  const textSubtle = isDark ? 'text-white/30' : 'text-slate-400';

  const labelBg = isDark
    ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
    : 'bg-violet-100 border border-violet-200 text-violet-600';

  const cardBase = isDark
    ? 'bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/25 hover:bg-violet-500/[0.05]'
    : 'bg-white border border-slate-200/70 hover:border-violet-300 shadow-sm hover:shadow-violet-100';

  const statCard = isDark
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-white border border-slate-100 shadow-sm';

  const testimonialCard = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-slate-200/70 shadow-sm';

  const dividerColor = isDark ? 'border-white/[0.05]' : 'border-slate-200';
  const footerLinkColor = isDark ? 'text-white/35 hover:text-white/70' : 'text-slate-400 hover:text-violet-600';

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${pageBg}`}>

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

        {/* Background elements — dark only */}
        {isDark && (
          <>
            <div className="orb w-[700px] h-[700px] opacity-[0.14]" style={{ background: '#7c3aed', top: '-15%', left: '-8%' }} />
            <div className="orb w-[500px] h-[500px] opacity-[0.08]" style={{ background: '#ec4899', top: '40%', right: '-8%', animationDelay: '5s' }} />
            <div className="orb w-[400px] h-[400px] opacity-[0.07]" style={{ background: '#3b82f6', bottom: '-12%', left: '35%', animationDelay: '9s' }} />
            <div className="hero-grid absolute inset-0 opacity-40" />
          </>
        )}

        {/* Background elements — light only */}
        {!isDark && (
          <>
            <div className="absolute top-0 left-0 right-0 h-[70vh] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.07) 0%, transparent 65%)' }} />
            <div className="absolute w-80 h-80 rounded-full pointer-events-none -top-20 -left-20 blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, #ede9fe, transparent)' }} />
            <div className="absolute w-64 h-64 rounded-full pointer-events-none top-1/2 -right-20 blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #dbeafe, transparent)' }} />
          </>
        )}

        {/* Floating icons */}
        <FloatIcon icon={Brain} color="#7c3aed" style={{ top: '22%', left: '8%' }} delay={0} />
        <FloatIcon icon={Trophy} color="#f59e0b" style={{ top: '16%', right: '10%' }} delay={1.5} />
        <FloatIcon icon={Target} color="#10b981" style={{ bottom: '28%', left: '6%' }} delay={0.8} />
        <FloatIcon icon={BarChart3} color="#3b82f6" style={{ bottom: '24%', right: '8%' }} delay={2.2} />
        <FloatIcon icon={Flame} color="#f43f5e" style={{ top: '55%', left: '13%' }} delay={1} />
        <FloatIcon icon={Sparkles} color="#06b6d4" style={{ top: '40%', right: '14%' }} delay={1.8} />

        {/* Orbit ring — dark only */}
        {isDark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full border border-violet-500/[0.06] animate-spin-slow" />
            <div className="absolute w-[480px] h-[480px] rounded-full border border-violet-500/[0.04]" style={{ animation: 'spin 16s linear infinite reverse' }} />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Location badge */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 ${labelBg}`}>
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold tracking-wide">Bangladesh's #1 CA Preparation Platform</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-5xl md:text-7xl lg:text-8xl font-black leading-[1.04] mb-6 tracking-tight ${headingPrimary}`}>
            Crack Your&nbsp;
            <span style={{ background: 'linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 40%,#ec4899 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ICAB CA</span>
            <br />Exams with <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Confidence</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed ${textMuted}`}>
            Purpose-built for Bangladeshi CA aspirants — chapter-wise MCQ practice, ICAB-aligned mock tests, and intelligent analytics to help you ace Certificate Level and Professional Level examinations.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            {user ? (
              <Link to="/dashboard"
                className="inline-flex items-center gap-2.5 text-base py-4 px-9 rounded-2xl font-bold text-white shadow-xl transition-all duration-300"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: isDark ? '0 0 40px rgba(124,58,237,0.45)' : '0 8px 30px rgba(124,58,237,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isDark ? '0 0 60px rgba(124,58,237,0.6)' : '0 12px 40px rgba(124,58,237,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isDark ? '0 0 40px rgba(124,58,237,0.45)' : '0 8px 30px rgba(124,58,237,0.3)'; }}>
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/register"
                  className="inline-flex items-center gap-2.5 text-base py-4 px-9 rounded-2xl font-bold text-white transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: isDark ? '0 0 40px rgba(124,58,237,0.45)' : '0 8px 30px rgba(124,58,237,0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}>
                  Start Preparing Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login"
                  className={`inline-flex items-center gap-2.5 text-base py-4 px-8 rounded-2xl font-semibold transition-all duration-200 ${
                    isDark
                      ? 'text-white/80 border border-white/12 hover:border-white/25 hover:bg-white/5 hover:text-white'
                      : 'text-violet-700 border border-violet-200 hover:border-violet-400 hover:bg-violet-50 shadow-sm'
                  }`}>
                  <Play className="w-4 h-4" /> Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-5 mb-16">
            {['Free registration', 'No credit card needed', 'ICAB syllabus aligned', '20K+ BD students'].map((t, i) => (
              <span key={i} className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>

          {/* Mini stat row */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 max-w-sm mx-auto">
            {[{ label: 'Students', value: '20K+', emoji: '👨‍🎓' }, { label: 'MCQs', value: '5K+', emoji: '📝' }, { label: 'Pass Rate', value: '98%', emoji: '🏆' }].map((s, i) => (
              <div key={i} className={`flex-1 min-w-[90px] rounded-2xl p-4 text-center transition-all ${statCard}`}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className={`text-lg font-black ${headingPrimary}`}>{s.value}</div>
                <div className={`text-[10px] font-medium mt-0.5 ${textSubtle}`}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ ICAB LEVELS ════════════════════════════════════════════════════ */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-3xl overflow-hidden border ${isDark ? 'bg-white/[0.025] border-violet-500/10' : 'bg-white border-slate-200/70 shadow-sm'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
              {[
                { level: 'CA Certificate Level', desc: 'Foundation-stage preparation with full ICAB syllabus coverage, chapter-wise MCQs and mock papers.', icon: '🎓', color: '#7c3aed' },
                { level: 'CA Professional Level', desc: 'Advanced-stage preparation with scenario-based questions and professional competency practice.', icon: '📊', color: '#f59e0b' },
                { level: 'Chapter-wise Practice', desc: 'Targeted practice by individual chapters across all ICAB subjects — study smarter, not harder.', icon: '📋', color: '#10b981' },
              ].map((item, i) => (
                <div key={i} className={`p-7 flex flex-col gap-3 transition-all ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-violet-50/50'}`}>
                  <div className="text-3xl">{item.icon}</div>
                  <h3 className={`font-bold text-base ${headingPrimary}`}>{item.level}</h3>
                  <p className={`text-sm leading-relaxed ${textMuted}`}>{item.desc}</p>
                  <span className="text-xs font-semibold mt-1 flex items-center gap-1" style={{ color: item.color }}>
                    Fully Available <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${sectionMuted}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`rounded-3xl p-10 sm:p-14 border relative overflow-hidden ${isDark ? 'bg-white/[0.02] border-violet-500/10' : 'bg-white border-slate-200/70 shadow-sm'}`}>
            {isDark && <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'linear-gradient(135deg, #7c3aed, transparent 50%)' }} />}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10">
              {STATS.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mx-auto mb-4">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black mb-1`}
                    style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    <Counter end={s.end} suffix={s.suffix} />
                  </div>
                  <div className={`text-xs font-medium ${textMuted}`}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 ${labelBg}`}>
              <Zap className="w-3.5 h-3.5" /> Platform Features
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${headingPrimary}`}>
              Everything You Need to <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Excel</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${textMuted}`}>
              Comprehensive tools engineered specifically for serious ICAB CA aspirants in Bangladesh
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className={`rounded-2xl p-7 group cursor-default transition-all duration-300 hover:-translate-y-1.5 ${cardBase}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}22` }}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold mb-2 ${headingPrimary}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD PREVIEW ══════════════════════════════════════════════ */}
      <section className={`py-24 px-4 ${sectionMuted}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${labelBg}`}>
                <BarChart2 className="w-3.5 h-3.5" /> Smart Dashboard
              </div>
              <h2 className={`text-4xl md:text-5xl font-black mb-5 ${headingPrimary}`}>
                Track Every Step of Your <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Preparation</span>
              </h2>
              <p className={`text-lg leading-relaxed mb-8 ${textMuted}`}>
                Your personal command center — see your progress, spot weak areas, review wrong answers, and keep your study streak alive all in one place.
              </p>
              <div className="space-y-3">
                {[['Subject-wise progress rings', '#7c3aed'], ['Chapter completion tracking', '#10b981'], ['Score trends & accuracy', '#f59e0b'], ['National leaderboard rank', '#06b6d4']].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <CheckCircle className="w-3 h-3" style={{ color }} />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to={user ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2.5 font-bold py-4 px-8 rounded-2xl text-white transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 30px rgba(124,58,237,0.3)' }}>
                  {user ? 'Open Dashboard' : 'Create Free Account'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
              className="relative">
              {isDark && (
                <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-20"
                  style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
              )}
              <DashboardPreview isDark={isDark} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SUBJECTS ═══════════════════════════════════════════════════════ */}
      {subjects.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-end justify-between mb-14 flex-wrap gap-6">
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${labelBg}`}>
                  <BookOpen className="w-3.5 h-3.5" /> ICAB Course Library
                </div>
                <h2 className={`text-4xl md:text-5xl font-black ${headingPrimary}`}>
                  Featured <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Subjects</span>
                </h2>
              </div>
              <Link to={user ? '/dashboard' : '/register'}
                className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}>
                Browse all subjects <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s, i) => (
                <motion.div key={s.id}
                  initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.09 }} viewport={{ once: true }}
                  className={`rounded-2xl p-6 group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${cardBase}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{s.icon}</div>
                    {s.class_level && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                        {isNaN(s.class_level) ? s.class_level : `Level ${s.class_level}`}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold text-lg mb-1.5 ${headingPrimary}`}>{s.name}</h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${textMuted}`}>{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs flex items-center gap-1 ${textSubtle}`}>
                      <FileText className="w-3 h-3" /> {s.chapter_count || 0} chapters
                    </span>
                    <span className="text-xs text-violet-500 flex items-center gap-1 font-semibold group-hover:gap-2 transition-all">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {!user && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-10 text-center">
                <div className={`inline-flex items-center gap-3 rounded-2xl px-8 py-5 border ${isDark ? 'bg-white/[0.03] border-violet-500/15' : 'bg-white border-violet-200 shadow-sm'}`}>
                  <Lock className="w-5 h-5 text-violet-500" />
                  <span className={`text-sm ${textMuted}`}>Sign up to unlock all ICAB subjects and start practising</span>
                  <Link to="/register"
                    className="text-sm py-2.5 px-5 rounded-xl font-bold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    Unlock Access
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ═══ TESTIMONIALS ═══════════════════════════════════════════════════ */}
      <section className={`py-24 px-4 ${sectionMuted}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 ${labelBg}`}>
              <Star className="w-3.5 h-3.5" /> Student Stories
            </div>
            <h2 className={`text-4xl md:text-5xl font-black ${headingPrimary}`}>
              Trusted by <span style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ICAB Toppers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className={`rounded-2xl p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${testimonialCard}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${t.color}99, ${t.color}30, transparent)` }} />
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-6 italic ${isDark ? 'text-white/60' : 'text-slate-500'}`}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${headingPrimary}`}>{t.name}</p>
                    <p className="text-amber-500 text-xs font-medium">{t.level}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 ${labelBg}`}>
              <Award className="w-3.5 h-3.5" /> Simple Pricing
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${headingPrimary}`}>
              Start <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Free</span>, Grow as You Go
            </h2>
            <p className={`text-lg ${textMuted}`}>No hidden charges. Upgrade when you need more.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free plan */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} viewport={{ once: true }}
              className={`rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-[11px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Free Plan</div>
              <div className={`text-5xl font-black mb-1 ${headingPrimary}`}>৳0</div>
              <p className={`text-sm mb-7 ${textMuted}`}>Forever free, no card needed</p>
              <div className="space-y-3 mb-8">
                {['Access to 1 free subject', 'Preview MCQs per chapter', 'Basic progress tracking', 'Leaderboard access'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
                Get Started Free
              </Link>
            </motion.div>

            {/* Premium plan */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
              className="rounded-2xl p-8 border relative overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(109,40,217,0.08))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: isDark ? '0 0 40px rgba(124,58,237,0.12)' : '0 8px 40px rgba(124,58,237,0.15)' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899,#7c3aed)' }} />
              <div className="flex items-start justify-between mb-4">
                <div className="text-[11px] font-black uppercase tracking-widest text-violet-400">Premium Plan</div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>Most Popular</span>
              </div>
              <div className={`text-5xl font-black mb-1 ${headingPrimary}`}>৳499 <span className="text-base font-medium text-violet-400">/mo</span></div>
              <p className={`text-sm mb-7 ${textMuted}`}>Full access to all ICAB subjects</p>
              <div className="space-y-3 mb-8">
                {['All ICAB subjects unlocked', 'Unlimited MCQ practice', 'Full mock exam access', 'Deep analytics & insights', 'Wrong answer review', 'Flash cards & short notes', 'Priority support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="block text-center py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════════ */}
      <section className={`py-24 px-4 ${sectionMuted}`}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 ${labelBg}`}>
              Frequently Asked
            </div>
            <h2 className={`text-4xl font-black ${headingPrimary}`}>
              Questions & <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Answers</span>
            </h2>
          </motion.div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => <FAQ key={i} {...f} isDark={isDark} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl p-12 text-center border"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg,#0e1a4a 0%,#120b2e 50%,#0e1a4a 100%)'
                  : 'linear-gradient(135deg,#f5f3ff 0%,#ede9fe 50%,#f5f3ff 100%)',
                border: `1px solid ${isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.25)'}`,
                boxShadow: isDark ? '0 0 80px rgba(124,58,237,0.08)' : '0 20px 60px rgba(124,58,237,0.1)',
              }}>
              {isDark && (
                <>
                  <div className="orb w-80 h-80 opacity-20" style={{ background: '#7c3aed', top: '-30%', right: '-10%' }} />
                  <div className="orb w-60 h-60 opacity-12" style={{ background: '#ec4899', bottom: '-20%', left: '-5%', animationDelay: '4s' }} />
                </>
              )}
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg,transparent,#7c3aed,#ec4899,#7c3aed,transparent)' }} />
              <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${labelBg}`}>
                  <Award className="w-3.5 h-3.5" /> Join Today — It's Free
                </div>
                <h2 className={`text-4xl md:text-5xl font-black mb-4 ${headingPrimary}`}>
                  Ready to Pass Your <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ICAB CA?</span>
                </h2>
                <p className={`text-lg mb-10 max-w-xl mx-auto ${textMuted}`}>
                  Join 20,000+ Bangladeshi CA students who are preparing smarter with CA Aspire BD — the platform built specifically for ICAB aspirants.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register"
                    className="inline-flex items-center justify-center gap-2.5 text-base py-4 px-10 rounded-2xl font-bold text-white transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 30px rgba(245,158,11,0.4)' }}>
                    Create Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login"
                    className={`inline-flex items-center justify-center gap-2.5 text-base py-4 px-8 rounded-2xl font-semibold transition-all ${isDark ? 'text-white/70 border border-white/10 hover:border-white/20 hover:bg-white/5' : 'text-violet-700 border border-violet-300 hover:bg-violet-50'}`}>
                    Already registered? Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer className={`border-t py-16 px-4 ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                  <GraduationCap className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <div className={`font-bold text-base ${headingPrimary}`}>CA Aspire BD</div>
                  <div className="text-amber-500 text-[9px] font-semibold tracking-widest uppercase">Premium ICAB Platform</div>
                </div>
              </div>
              <p className={`text-sm leading-relaxed max-w-xs ${textMuted}`}>
                Bangladesh's most focused CA exam preparation platform — built specifically for ICAB aspirants preparing for Certificate and Professional Level examinations.
              </p>
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-wider mb-4 ${textSubtle}`}>Platform</p>
              <div className="flex flex-col gap-2.5">
                {[{ to: '/', label: 'Home' }, { to: '/register', label: 'Sign Up Free' }, { to: '/login', label: 'Sign In' }, { to: '/dashboard', label: 'Dashboard' }].map(l => (
                  <Link key={l.to} to={l.to} className={`text-sm transition-colors ${footerLinkColor}`}>{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-wider mb-4 ${textSubtle}`}>Exam Levels</p>
              <div className="flex flex-col gap-2.5">
                {['CA Certificate Level', 'CA Professional Level', 'Chapter-wise MCQs', 'Mock Tests', 'Analytics'].map(l => (
                  <span key={l} className={`text-sm ${footerLinkColor}`}>{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t ${dividerColor}`}>
            <p className={`text-xs ${textSubtle}`}>© {new Date().getFullYear()} CA Aspire BD. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                <span key={l} className={`text-xs cursor-pointer transition-colors ${footerLinkColor}`}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
