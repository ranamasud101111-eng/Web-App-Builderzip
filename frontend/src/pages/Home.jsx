import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, BookOpen, Users, Trophy, Zap, Star, Lock,
  ChevronRight, BarChart3, Shield, CheckCircle, Target, Clock,
  Award, FileText, ChevronDown, GraduationCap, MapPin,
  Sparkles, Brain, Play, Flame, BarChart2, HelpCircle,
  Medal, Lightbulb, Cpu
} from 'lucide-react';
import api from '../api';

/* ─── Animated number counter ────────────────────────────────────────────── */
const Counter = ({ end, suffix = '', duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const startTime = performance.now();
        const update = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(update);
          else setVal(end);
        };
        requestAnimationFrame(update);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, started]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* ─── FAQ accordion ──────────────────────────────────────────────────────── */
const FAQ = ({ q, a, isDark }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      onClick={() => setOpen(!open)}
      className="rounded-2xl cursor-pointer overflow-hidden transition-all duration-300"
      style={{
        background: open
          ? isDark ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.05)'
          : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${open
          ? isDark ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.25)'
          : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.12)'}`,
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
      }}>
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <span className={`font-semibold text-[14px] leading-snug ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{q}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${open ? 'bg-violet-600 rotate-180' : isDark ? 'bg-white/5' : 'bg-violet-100'}`}>
          <ChevronDown className={`w-3.5 h-3.5 ${open ? 'text-white' : isDark ? 'text-white/40' : 'text-violet-500'}`} />
        </div>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`px-6 pb-5 text-[13px] leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
          {a}
        </motion.div>
      )}
    </motion.div>
  );
};

/* ─── Floating glow icon ─────────────────────────────────────────────────── */
const GlowIcon = ({ icon: Icon, color, x, y, delay = 0, size = 48, isDark }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1, y: [0, -16, 0] }}
    transition={{ opacity: { delay, duration: 0.5 }, scale: { delay, duration: 0.5 }, y: { delay, duration: 5 + delay, repeat: Infinity, ease: 'easeInOut' } }}
    className="absolute hidden xl:flex items-center justify-center rounded-2xl"
    style={{
      left: x, top: y, width: size, height: size,
      background: isDark
        ? `linear-gradient(135deg, ${color}18, ${color}08)`
        : `linear-gradient(135deg, ${color}20, ${color}10)`,
      border: `1px solid ${color}${isDark ? '30' : '35'}`,
      boxShadow: isDark
        ? `0 0 20px ${color}20, inset 0 1px 0 ${color}15`
        : `0 4px 20px ${color}25, inset 0 1px 0 ${color}20`,
      backdropFilter: 'blur(12px)',
    }}>
    <Icon style={{ color, width: size * 0.42, height: size * 0.42 }} />
  </motion.div>
);

/* ─── Theme-aware card ───────────────────────────────────────────────────── */
const NeonCard = ({ children, color = '#8b5cf6', className = '', delay = 0, hover = true, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    whileHover={hover ? { y: -6, transition: { duration: 0.25 } } : {}}
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
        : 'rgba(255,255,255,0.92)',
      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(124,58,237,0.12)',
      boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
    }}
    onMouseEnter={e => {
      if (!hover) return;
      e.currentTarget.style.borderColor = `${color}${isDark ? '35' : '40'}`;
      e.currentTarget.style.boxShadow = isDark
        ? `0 0 30px ${color}18, inset 0 0 30px ${color}06`
        : `0 8px 32px ${color}20, 0 0 0 1px ${color}15`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.12)';
      e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)';
    }}>
    {children}
  </motion.div>
);

/* ─── Data ───────────────────────────────────────────────────────────────── */
const STATS = [
  { end: 20000, suffix: '+', label: 'Students Enrolled', sub: 'across Bangladesh', icon: Users, color: '#8b5cf6' },
  { end: 5000, suffix: '+', label: 'MCQ Questions', sub: 'ICAB-aligned', icon: FileText, color: '#ec4899' },
  { end: 98, suffix: '%', label: 'Satisfaction Rate', sub: 'from student surveys', icon: Star, color: '#f59e0b' },
  { end: 300, suffix: '+', label: 'Topics Covered', sub: 'cert & professional', icon: BookOpen, color: '#06b6d4' },
];

const FEATURES = [
  { icon: Target, title: 'ICAB-Pattern MCQs', desc: 'Questions precisely mirroring ICAB Certificate and Professional Level exam patterns. Built with actual past paper analysis.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Chapter-wise accuracy breakdowns, score trends, and study streaks — know exactly where to focus next.', color: '#ec4899' },
  { icon: Trophy, title: 'National Leaderboard', desc: 'Compete with thousands of CA aspirants across Bangladesh. See your rank, stay motivated, and climb.', color: '#f59e0b' },
  { icon: Zap, title: 'Instant Feedback', desc: 'Every wrong answer comes with a detailed explanation and reference. Learn at the speed of mistakes.', color: '#06b6d4' },
  { icon: Shield, title: 'Expert Content', desc: 'Study materials curated by ICAB-qualified faculty and CA examination toppers with real exam experience.', color: '#10b981' },
  { icon: Clock, title: 'Timed Mock Tests', desc: 'Simulate real ICAB exam pressure with chapter-wise and full-length timed tests, exactly like the actual paper.', color: '#f43f5e' },
];

const TESTIMONIALS = [
  { name: 'Tanvir Ahmed', role: 'CA Professional Level — Top Performer', text: 'CA Aspire BD\'s mock tests are the closest to the real ICAB exams I\'ve ever seen. Passed my Professional Level on first attempt with confidence.', color: '#8b5cf6' },
  { name: 'Nusrat Jahan', role: 'CA Certificate Level — First Attempt Pass', text: 'The analytics showed me exactly where I was weak. Within two weeks of targeted practice, my scores jumped dramatically. This platform works.', color: '#10b981' },
  { name: 'Mahmudul Hasan', role: 'CA Certificate Level Topper', text: 'Finally a platform built for ICAB, not ICAI. Every question, every format, every marking scheme is tailored for Bangladeshi CA students.', color: '#f59e0b' },
];

const FAQS = [
  { q: 'Is CA Aspire BD suitable for all ICAB levels?', a: 'Yes — CA Aspire BD covers both the CA Certificate Level and CA Professional Level under ICAB. Each subject is organized by level with the appropriate difficulty and syllabus alignment.' },
  { q: 'How many mock tests are available for ICAB preparation?', a: 'We have 5,000+ MCQs across all ICAB subjects, organized into topic-wise and chapter-wise practice sets fully aligned with the ICAB syllabus and exam format.' },
  { q: 'Is the platform free to use?', a: 'CA Aspire BD offers a free tier with access to selected chapters and preview questions. Full access to all chapters, mock tests, and analytics is available with premium enrollment.' },
  { q: 'How closely do mock tests match real ICAB exams?', a: 'Our content is prepared by ICAB-qualified faculty and regularly reviewed against the latest ICAB syllabi. The question pattern, difficulty, and marking scheme closely mirror actual ICAB examinations.' },
  { q: 'Can I track my progress over time?', a: 'Yes. Your dashboard shows detailed analytics including chapters completed, MCQ scores, time spent, wrong answer reviews, and your ranking on the national leaderboard.' },
];

/* ════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data.slice(0, 6))).catch(() => {});
  }, []);

  const bg1 = isDark ? '#050816' : '#faf9ff';
  const bg2 = isDark ? '#0b1026' : '#f3f0ff';
  const textPrimary = isDark ? '#f1f5f9' : '#1e1b4b';
  const textSecondary = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';
  const textMuted = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-500" style={{ background: bg1, color: textPrimary }}>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Ambient background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full" style={{ width: 900, height: 900, top: '-30%', left: '-20%', background: isDark ? 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)', filter: 'blur(1px)' }} />
          <div className="absolute rounded-full" style={{ width: 700, height: 700, top: '20%', right: '-15%', background: isDark ? 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%)', filter: 'blur(1px)' }} />
          <div className="absolute rounded-full" style={{ width: 600, height: 600, bottom: '-10%', left: '30%', background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)' }} />
          <div className="absolute rounded-full" style={{ width: 400, height: 400, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: isDark ? 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
        </div>

        {/* Dot grid */}
        <div className="hero-grid absolute inset-0 pointer-events-none" style={{ opacity: isDark ? 0.3 : 0.4 }} />

        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border" style={{ borderColor: isDark ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.08)', animation: 'spin 30s linear infinite' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full border" style={{ borderColor: isDark ? 'rgba(236,72,153,0.05)' : 'rgba(236,72,153,0.07)', animation: 'spin 20s linear infinite reverse' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full border" style={{ borderColor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.08)', animation: 'spin 15s linear infinite' }} />
        </div>

        {/* Floating icons */}
        <GlowIcon icon={Brain} color="#8b5cf6" x="7%" y="22%" delay={0.2} isDark={isDark} />
        <GlowIcon icon={Trophy} color="#f59e0b" x="88%" y="18%" delay={0.5} isDark={isDark} />
        <GlowIcon icon={Target} color="#10b981" x="5%" y="62%" delay={0.3} size={44} isDark={isDark} />
        <GlowIcon icon={BarChart3} color="#06b6d4" x="89%" y="60%" delay={0.7} size={44} isDark={isDark} />
        <GlowIcon icon={Flame} color="#f43f5e" x="12%" y="42%" delay={0.9} size={40} isDark={isDark} />
        <GlowIcon icon={Sparkles} color="#a78bfa" x="85%" y="40%" delay={0.6} size={40} isDark={isDark} />
        <GlowIcon icon={Cpu} color="#3b82f6" x="18%" y="78%" delay={1.1} size={36} isDark={isDark} />
        <GlowIcon icon={Medal} color="#fbbf24" x="80%" y="76%" delay={0.8} size={36} isDark={isDark} />

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-32">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10"
              style={{
                background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.08)',
                border: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.2)'}`,
                backdropFilter: 'blur(12px)',
              }}>
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[12px] font-bold tracking-wide uppercase" style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}>Bangladesh's #1 CA Preparation Platform</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black leading-[1.03] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}>
            <span style={{ color: textPrimary }}>Crack Your</span>{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 30%, #ec4899 65%, #f97316 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>ICAB CA</span>
            <br />
            <span style={{ color: textPrimary }}>Exams with </span>
            <span style={{
              background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Confidence</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ color: textSecondary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
            className="max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Purpose-built for Bangladeshi CA aspirants — chapter-wise MCQ practice,
            ICAB-aligned mock tests, and intelligent analytics to help you ace every level.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Link to="/dashboard"
                className="inline-flex items-center gap-2.5 text-base py-4 px-9 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899,#f97316)', backgroundSize: '200% 200%', boxShadow: '0 0 50px rgba(124,58,237,0.5), 0 0 0 1px rgba(124,58,237,0.3)' }}>
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/register"
                  className="inline-flex items-center gap-2.5 text-base py-4 px-10 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-1 group"
                  style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#ec4899 60%,#f97316 100%)', boxShadow: '0 0 50px rgba(124,58,237,0.45), 0 0 0 1px rgba(139,92,246,0.3)', backgroundSize: '200% 200%' }}>
                  Start Preparing Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="inline-flex items-center gap-2.5 text-base py-4 px-8 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)'}`,
                    color: isDark ? 'rgba(255,255,255,0.75)' : '#5b21b6',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)'; }}>
                  <Play className="w-4 h-4" /> Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-20">
            {['Free registration', 'No credit card needed', 'ICAB syllabus aligned', '20K+ BD students'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: textMuted }}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>

          {/* Mini stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 max-w-md mx-auto">
            {[
              { v: '20K+', l: 'Students', e: '👨‍🎓', c: '#8b5cf6' },
              { v: '5K+', l: 'MCQs', e: '📝', c: '#ec4899' },
              { v: '98%', l: 'Pass Rate', e: '🏆', c: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="flex-1 min-w-[100px] text-center rounded-2xl py-4 px-3 transition-all duration-300"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.12)'}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                <div className="text-2xl mb-1">{s.e}</div>
                <div className="text-xl font-black" style={{ color: s.c }}>{s.v}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: textMuted }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${bg1})` }} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STATS                                                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 transition-colors duration-500" style={{ background: bg2 }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map((s, i) => (
              <NeonCard key={i} color={s.color} delay={i * 0.08} className="p-7" isDark={isDark}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}${isDark ? '12' : '15'}`, border: `1px solid ${s.color}${isDark ? '22' : '28'}`, color: s.color }}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black leading-none mb-1" style={{
                  background: isDark
                    ? `linear-gradient(135deg, white, ${s.color})`
                    : `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  <Counter end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-[13px] font-bold mt-2" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#374151' }}>{s.label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: textMuted }}>{s.sub}</div>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden transition-colors duration-500" style={{ background: bg1 }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 65%)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold uppercase tracking-wider"
              style={{
                background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.07)',
                border: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.2)'}`,
                color: isDark ? '#a78bfa' : '#7c3aed',
              }}>
              <Zap className="w-3.5 h-3.5" /> Platform Features
            </div>
            <h2 className="font-black mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: textPrimary }}>
              Everything You Need to{' '}
              <span style={{ background: 'linear-gradient(135deg,#c4b5fd,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Excel</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: textSecondary }}>
              Comprehensive tools engineered specifically for serious ICAB CA aspirants in Bangladesh
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <NeonCard key={i} color={f.color} delay={i * 0.07} className="p-7 group" isDark={isDark}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}${isDark ? '12' : '15'}`, border: `1px solid ${f.color}${isDark ? '22' : '28'}`, color: f.color }}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-[16px] font-bold mb-2.5" style={{ color: textPrimary }}>{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: textSecondary }}>{f.desc}</p>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DASHBOARD PREVIEW                                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden transition-colors duration-500" style={{ background: `linear-gradient(180deg, ${bg2} 0%, ${bg1} 100%)` }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 65%)', filter: 'blur(1px)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left: text */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-[12px] font-bold uppercase tracking-wider"
                style={{
                  background: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.07)',
                  border: `1px solid ${isDark ? 'rgba(236,72,153,0.25)' : 'rgba(236,72,153,0.2)'}`,
                  color: isDark ? '#f9a8d4' : '#be185d',
                }}>
                <BarChart2 className="w-3.5 h-3.5" /> Smart Dashboard
              </div>
              <h2 className="font-black mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: textPrimary }}>
                Track Every Step of Your{' '}
                <span style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Preparation</span>
              </h2>
              <p className="text-[15px] leading-relaxed mb-10" style={{ color: textSecondary }}>
                Your personal command center — see your progress, spot weak areas, review wrong answers, and keep your study streak alive all in one gorgeous interface.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  ['Subject-wise progress rings', '#8b5cf6'],
                  ['Chapter completion tracking', '#10b981'],
                  ['Score trends & accuracy analytics', '#f59e0b'],
                  ['National leaderboard ranking', '#06b6d4'],
                  ['Wrong answer review & bookmarks', '#ec4899'],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <CheckCircle className="w-3 h-3" style={{ color }} />
                    </div>
                    <span className="text-[14px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#374151' }}>{label}</span>
                  </div>
                ))}
              </div>
              <Link to={user ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2.5 font-bold py-4 px-8 rounded-2xl text-white transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 40px rgba(124,58,237,0.35)', border: '1px solid rgba(139,92,246,0.3)' }}>
                {user ? 'Open Dashboard' : 'Create Free Account'} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Right: dashboard mockup */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} viewport={{ once: true }}
              className="relative">
              <div className="absolute -inset-6 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(16px)' }} />

              <div className="relative rounded-2xl overflow-hidden border"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg,rgba(11,16,38,0.98),rgba(5,8,22,0.99))'
                    : 'linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,247,255,0.99))',
                  border: `1px solid ${isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)'}`,
                  boxShadow: isDark
                    ? '0 0 60px rgba(124,58,237,0.15), 0 40px 80px rgba(0,0,0,0.6)'
                    : '0 0 40px rgba(124,58,237,0.1), 0 40px 80px rgba(0,0,0,0.12)',
                }}>

                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.08)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(124,58,237,0.03)' }}>
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                  <div className="flex-1 mx-4 py-1 px-3 rounded-full text-center text-[10px]" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.06)', color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.5)' }}>
                    caaspirebd.com/dashboard
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-4 gap-2.5">
                    {[['5', 'Subjects', '#8b5cf6'], ['72%', 'Progress', '#10b981'], ['38', 'Chapters', '#06b6d4'], ['3', 'Tests', '#f59e0b']].map(([v, l, c]) => (
                      <div key={l} className="rounded-xl p-3 text-center" style={{ background: `${c}${isDark ? '08' : '10'}`, border: `1px solid ${c}${isDark ? '18' : '22'}` }}>
                        <div className="text-lg font-black leading-none" style={{ color: c }}>{v}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(124,58,237,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.08)'}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#374151' }}>Weekly Activity</span>
                      <span className="text-[10px] font-bold text-emerald-500">+24% ↑</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[45, 72, 58, 89, 63, 95, 78].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm"
                          style={{ height: `${h}%`, background: 'linear-gradient(to top, rgba(124,58,237,0.7), rgba(236,72,153,0.4))' }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="flex-1 text-center text-[8px]" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)' }}>{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[['Financial Accounting', 78, '#8b5cf6'], ['Business Law', 45, '#10b981'], ['Auditing', 92, '#f59e0b']].map(([name, pct, color]) => (
                      <div key={name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(124,58,237,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.07)'}` }}>
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#374151' }}>{name}</div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
                          </div>
                        </div>
                        <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[['Practice MCQs', '#8b5cf6', Brain], ['Mock Test', '#ec4899', Target], ['Leaderboard', '#f59e0b', Trophy]].map(([l, c, Icon]) => (
                      <div key={l} className="rounded-xl p-3 text-center cursor-pointer transition-all hover:scale-105"
                        style={{ background: `${c}${isDark ? '10' : '12'}`, border: `1px solid ${c}${isDark ? '20' : '25'}` }}>
                        <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: c }} />
                        <div className="text-[9px] font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUBJECTS                                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {subjects.length > 0 && (
        <section className="py-28 px-4 transition-colors duration-500" style={{ background: bg1 }}>
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-end justify-between mb-16 flex-wrap gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-[12px] font-bold uppercase tracking-wider"
                  style={{
                    background: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.08)',
                    border: `1px solid ${isDark ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.2)'}`,
                    color: isDark ? '#67e8f9' : '#0891b2',
                  }}>
                  <BookOpen className="w-3.5 h-3.5" /> ICAB Course Library
                </div>
                <h2 className="font-black" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: textPrimary }}>
                  Featured{' '}
                  <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Subjects</span>
                </h2>
              </div>
              <Link to={user ? '/dashboard' : '/register'}
                className="flex items-center gap-1.5 text-[13px] font-bold transition-colors"
                style={{ color: '#8b5cf6' }}>
                Browse all subjects <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s, i) => (
                <NeonCard key={s.id} color="#8b5cf6" delay={i * 0.07} className="p-6 cursor-pointer" isDark={isDark}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{s.icon}</div>
                    {s.class_level && (
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.12)',
                          color: '#d97706',
                          border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.3)'}`,
                        }}>
                        {isNaN(s.class_level) ? s.class_level : `Level ${s.class_level}`}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-bold mb-1.5" style={{ color: textPrimary }}>{s.name}</h3>
                  <p className="text-[13px] mb-4 line-clamp-2 leading-relaxed" style={{ color: textSecondary }}>{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] flex items-center gap-1 font-medium" style={{ color: textMuted }}>
                      <FileText className="w-3 h-3" /> {s.chapter_count || 0} chapters
                    </span>
                    <span className="text-[12px] text-violet-500 flex items-center gap-1 font-bold">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </NeonCard>
              ))}
            </div>

            {!user && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-12 text-center">
                <div className="inline-flex items-center gap-4 rounded-2xl px-8 py-5 border"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.85)',
                    border: `1px solid ${isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)'}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
                  }}>
                  <Lock className="w-5 h-5 text-violet-500" />
                  <span className="text-[14px]" style={{ color: textSecondary }}>Sign up to unlock all ICAB subjects and start practising</span>
                  <Link to="/register"
                    className="text-sm py-2.5 px-6 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
                    Unlock Access
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden transition-colors duration-500" style={{ background: bg2 }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)' : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold uppercase tracking-wider"
              style={{
                background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)'}`,
                color: isDark ? '#fde68a' : '#b45309',
              }}>
              <Star className="w-3.5 h-3.5" /> Student Stories
            </div>
            <h2 className="font-black" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: textPrimary }}>
              Trusted by{' '}
              <span style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ICAB Toppers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <NeonCard key={i} color={t.color} delay={i * 0.12} className="p-7 relative" isDark={isDark}>
                <div className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, ${t.color}70, transparent)` }} />
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed mb-6 italic" style={{ color: textSecondary }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}90)`, boxShadow: `0 0 16px ${t.color}40` }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[13px]" style={{ color: textPrimary }}>{t.name}</p>
                    <p className="text-[11px] text-amber-500/80 font-medium">{t.role}</p>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PRICING                                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden transition-colors duration-500" style={{ background: bg1 }}>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 65%)' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold uppercase tracking-wider"
              style={{
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}`,
                color: isDark ? '#6ee7b7' : '#059669',
              }}>
              <Award className="w-3.5 h-3.5" /> Simple Pricing
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: textPrimary }}>
              Start{' '}
              <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Free</span>
              , Grow as You Go
            </h2>
            <p className="text-lg" style={{ color: textSecondary }}>No hidden charges. No surprises. Upgrade only when you're ready.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <NeonCard color="#8b5cf6" delay={0} className="p-8" isDark={isDark}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: textMuted }}>Free Plan</div>
              <div className="text-5xl font-black mb-1" style={{ color: textPrimary }}>৳0</div>
              <p className="text-[13px] mb-8" style={{ color: textSecondary }}>Forever free, no card needed</p>
              <div className="space-y-3 mb-8">
                {['Access to 1 free subject', 'Preview MCQs per chapter', 'Basic progress tracking', 'Leaderboard access'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-[13px]" style={{ color: textSecondary }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="block text-center py-3.5 rounded-xl font-bold text-[14px] transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.06)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)'}`,
                  color: isDark ? 'rgba(255,255,255,0.75)' : '#7c3aed',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)'; }}>
                Get Started Free
              </Link>
            </NeonCard>

            {/* Premium */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="p-8 rounded-2xl relative overflow-hidden"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(109,40,217,0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(139,92,246,0.05) 100%)',
                border: `1px solid ${isDark ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.25)'}`,
                boxShadow: isDark
                  ? '0 0 60px rgba(124,58,237,0.15), inset 0 1px 0 rgba(139,92,246,0.2)'
                  : '0 8px 40px rgba(124,58,237,0.12), inset 0 1px 0 rgba(139,92,246,0.15)',
              }}>
              <div className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(236,72,153,0.5), transparent)' }} />
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

              <div className="flex items-start justify-between mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-violet-500">Premium Plan</div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>Most Popular</span>
              </div>
              <div className="text-5xl font-black mb-0.5" style={{ color: textPrimary }}>৳499 <span className="text-[16px] font-medium text-violet-500">/mo</span></div>
              <p className="text-[13px] mb-8" style={{ color: textSecondary }}>Full access to all ICAB subjects</p>
              <div className="space-y-3 mb-8">
                {['All ICAB subjects unlocked', 'Unlimited MCQ practice', 'Full mock exam access', 'Deep analytics & insights', 'Wrong answer review', 'Flash cards & short notes', 'Priority support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <span className="text-[13px]" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#374151' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register"
                className="block text-center py-3.5 rounded-xl font-bold text-[14px] text-white transition-all duration-300 hover:brightness-110"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 30px rgba(124,58,237,0.45)' }}>
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FAQ                                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 transition-colors duration-500" style={{ background: bg2 }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold uppercase tracking-wider"
              style={{
                background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.07)',
                border: `1px solid ${isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.2)'}`,
                color: isDark ? '#a78bfa' : '#7c3aed',
              }}>
              Frequently Asked
            </div>
            <h2 className="font-black" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: textPrimary }}>
              Questions &{' '}
              <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Answers</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }}>
                <FAQ q={f.q} a={f.a} isDark={isDark} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 transition-colors duration-500" style={{ background: bg1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-20"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(109,40,217,0.06) 50%, rgba(236,72,153,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(109,40,217,0.04) 50%, rgba(236,72,153,0.05) 100%)',
              border: `1px solid ${isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)'}`,
              boxShadow: isDark ? '0 0 80px rgba(124,58,237,0.12)' : '0 8px 50px rgba(124,58,237,0.08)',
            }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.4), transparent)' }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-[12px] font-bold uppercase tracking-wider"
                style={{
                  background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
                  border: `1px solid ${isDark ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.2)'}`,
                  color: isDark ? '#c4b5fd' : '#7c3aed',
                }}>
                <GraduationCap className="w-3.5 h-3.5" /> Start Your CA Journey
              </div>

              <h2 className="font-black mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: textPrimary }}>
                Ready to Ace Your{' '}
                <span style={{ background: 'linear-gradient(135deg,#c4b5fd,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ICAB Exams?</span>
              </h2>

              <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: textSecondary }}>
                Join 20,000+ CA aspirants across Bangladesh. Start with a free account and unlock your full potential with our ICAB-aligned study platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register"
                  className="inline-flex items-center gap-2.5 text-base py-4 px-10 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-1 group"
                  style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#ec4899 60%,#f97316 100%)', boxShadow: '0 0 50px rgba(124,58,237,0.45)', backgroundSize: '200% 200%' }}>
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="inline-flex items-center gap-2.5 text-base py-4 px-8 rounded-2xl font-semibold transition-all duration-300"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)'}`,
                    color: isDark ? 'rgba(255,255,255,0.75)' : '#5b21b6',
                  }}>
                  Sign In Instead
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <footer className="py-12 px-4 border-t transition-colors duration-500" style={{ background: bg2, borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.1)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <div className="text-[16px] font-bold" style={{ color: textPrimary }}>CA Aspire BD</div>
                <div className="text-[9px] font-semibold text-amber-500 tracking-[0.12em] uppercase">ICAB Prep Platform</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[13px] font-medium" style={{ color: textSecondary }}>
              <Link to="/login" className="hover:text-violet-500 transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-violet-500 transition-colors">Register</Link>
              <Link to="/admin-login" className="hover:text-violet-500 transition-colors">Admin</Link>
            </div>
            <div className="text-[12px]" style={{ color: textMuted }}>
              © {new Date().getFullYear()} CA Aspire BD. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
