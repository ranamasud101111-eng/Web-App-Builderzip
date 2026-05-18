import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Users, Trophy, Zap, Star, Lock,
  ChevronRight, Play, BarChart3, Shield, CheckCircle,
  Target, Clock, Award, TrendingUp, FileText, ChevronDown,
  GraduationCap, MapPin, Sparkles
} from 'lucide-react';
import api from '../api';

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
        const t = setInterval(() => {
          cur += step;
          if (cur >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(cur));
        }, 22);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, started]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/[0.06] glass-card'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left">
        <span className="font-semibold text-white/90 text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-purple-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{a}</div>}
    </div>
  );
};

const SubjectCard = ({ s, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.09, duration: 0.5 }} viewport={{ once: true }}
    className="exam-card p-6 group cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="text-4xl">{s.icon}</div>
      {s.class_level && (
        <span className="badge-gold">{isNaN(s.class_level) ? s.class_level : `Level ${s.class_level}`}</span>
      )}
    </div>
    <h3 className="font-bold text-white text-lg mb-1.5">{s.name}</h3>
    <p className="text-white/40 text-sm mb-4 line-clamp-2">{s.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/30 flex items-center gap-1">
        <FileText className="w-3 h-3" /> {s.chapter_count || 0} chapters
      </span>
      <span className="text-xs text-purple-400 flex items-center gap-1 font-medium group-hover:gap-2 transition-all">
        Explore <ChevronRight className="w-3 h-3" />
      </span>
    </div>
  </motion.div>
);

const stats = [
  { end: 20000, suffix: '+', label: 'ICAB Students Enrolled', icon: <Users className="w-6 h-6" /> },
  { end: 5000, suffix: '+', label: 'MCQs & Mock Tests', icon: <FileText className="w-6 h-6" /> },
  { end: 98, suffix: '%', label: 'Student Satisfaction', icon: <Star className="w-6 h-6" /> },
  { end: 300, suffix: '+', label: 'ICAB Topics Covered', icon: <BookOpen className="w-6 h-6" /> },
];

const features = [
  { icon: <Target className="w-6 h-6" />, title: 'ICAB-Pattern MCQs', desc: 'Questions precisely aligned with ICAB Certificate and Professional Level exam patterns and syllabus', color: '#7c3aed' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Deep Analytics', desc: 'Identify your weak areas with chapter-wise performance breakdowns and score trends', color: '#f59e0b' },
  { icon: <Trophy className="w-6 h-6" />, title: 'National Leaderboard', desc: 'Compete with CA aspirants across Bangladesh and see where you stand nationwide', color: '#10b981' },
  { icon: <Zap className="w-6 h-6" />, title: 'Instant Feedback', desc: 'Learn from every mistake immediately with detailed answer explanations and references', color: '#06b6d4' },
  { icon: <Shield className="w-6 h-6" />, title: 'Expert Content', desc: 'Study material prepared by ICAB-qualified faculty and CA examination toppers', color: '#8b5cf6' },
  { icon: <Clock className="w-6 h-6" />, title: 'Timed Mock Tests', desc: 'Simulate real ICAB exam conditions with chapter-wise and full-length timed papers', color: '#f43f5e' },
];

const faqs = [
  {
    q: 'Is CA Aspire BD suitable for all ICAB levels?',
    a: 'Yes. CA Aspire BD covers both the CA Certificate Level and CA Professional Level under ICAB. Each subject is organized by level with appropriate difficulty and syllabus alignment.'
  },
  {
    q: 'How many mock tests are available for ICAB preparation?',
    a: 'We have 5,000+ MCQs across all ICAB subjects, organized into topic-wise and chapter-wise practice sets fully aligned with the ICAB syllabus and exam format.'
  },
  {
    q: 'Is the platform free to use?',
    a: 'CA Aspire BD offers a free tier with access to selected chapters and preview questions. Full access to all chapters, mock tests, and analytics is available with premium enrollment.'
  },
  {
    q: 'How closely do mock tests match real ICAB exams?',
    a: 'Our content is prepared by ICAB-qualified faculty and regularly reviewed against the latest ICAB syllabi. The question pattern, difficulty level, and marking scheme closely mirror actual ICAB examinations.'
  },
  {
    q: 'Can I track my progress over time?',
    a: 'Yes. Your dashboard shows detailed progress analytics including chapters completed, MCQ scores, time spent studying, wrong answer reviews, and your ranking on the national leaderboard.'
  },
];

export default function Home() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="orb w-[600px] h-[600px] opacity-20" style={{ background: '#7c3aed', top: '-15%', left: '-10%' }} />
        <div className="orb w-[500px] h-[500px] opacity-15" style={{ background: '#f59e0b', top: '30%', right: '-8%', animationDelay: '4s' }} />
        <div className="orb w-[400px] h-[400px] opacity-10" style={{ background: '#06b6d4', bottom: '-10%', left: '30%', animationDelay: '8s' }} />
        <div className="hero-grid absolute inset-0 opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-navy border border-gold-500/25 mb-8">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-gold-400 text-sm font-semibold tracking-wide">Bangladesh's CA Preparation Platform</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tight"
          >
            <span className="gradient-text-hero">Crack Your ICAB</span>
            <br />
            <span className="text-white/90">CA Exams with Confidence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Purpose-built for Bangladeshi CA aspirants — chapter-wise MCQ practice, ICAB-aligned mock tests, and intelligent analytics to help you ace Certificate Level and Professional Level examinations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {user ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2.5 text-base py-4 px-8 glow-purple">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-gold flex items-center gap-2.5 text-base py-4 px-9 font-bold glow-gold">
                  Start Preparing Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="btn-outline flex items-center gap-2.5 text-base py-4 px-8">
                  <Play className="w-4 h-4" /> Sign In
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {['Free registration', 'No credit card needed', 'ICAB syllabus aligned', '20K+ BD students'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
                <CheckCircle className="w-3 h-3 text-green-500" /> {t}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-sm mx-auto"
          >
            {[
              { label: 'Students', value: '20K+', icon: '👨‍🎓' },
              { label: 'MCQs', value: '5K+', icon: '📝' },
              { label: 'Pass Rate', value: '98%', icon: '🏆' },
            ].map((item, i) => (
              <div key={i} className="glass-navy rounded-2xl p-4 text-center border border-purple-500/12">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-lg font-black text-white">{item.value}</div>
                <div className="text-[10px] text-white/35 font-medium">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ ICAB LEVELS BANNER ═══ */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-navy rounded-3xl border border-purple-500/12 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
              {[
                { level: 'CA Certificate Level', desc: 'Foundation-stage preparation with full ICAB syllabus coverage, chapter-wise MCQs and mock papers.', icon: '🎓', color: '#7c3aed' },
                { level: 'CA Professional Level', desc: 'Advanced-stage preparation with scenario-based questions and professional competency practice.', icon: '📊', color: '#f59e0b' },
                { level: 'Chapter-wise Practice', desc: 'Targeted practice by individual chapters across all ICAB subjects — study smarter, not harder.', icon: '📋', color: '#10b981' },
              ].map((item, i) => (
                <div key={i} className="p-7 flex flex-col gap-3">
                  <div className="text-3xl">{item.icon}</div>
                  <h3 className="font-bold text-white text-base">{item.level}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  <span className="text-xs font-semibold mt-1" style={{ color: item.color }}>Fully Available →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="glass-navy rounded-3xl p-12 border border-purple-500/12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #7c3aed, transparent 50%)' }} />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/12 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-4">
                    {s.icon}
                  </div>
                  <div className="stat-number gradient-text-gold mb-1">
                    <Counter end={s.end} suffix={s.suffix} />
                  </div>
                  <div className="text-white/40 text-xs font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="section-label mx-auto w-fit"><Zap className="w-3.5 h-3.5" /> Platform Features</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need to <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Comprehensive tools engineered specifically for serious ICAB CA aspirants in Bangladesh
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}25` }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SUBJECTS ═══ */}
      {subjects.length > 0 && (
        <section className="py-24 px-4" style={{ background: 'rgba(6,11,36,0.5)' }}>
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-end justify-between mb-14 flex-wrap gap-6">
              <div>
                <div className="section-label w-fit"><BookOpen className="w-3.5 h-3.5" /> ICAB Course Library</div>
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  Featured <span className="gradient-text">Subjects</span>
                </h2>
              </div>
              {user ? (
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Browse all subjects <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link to="/register" className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors">
                  Get full access <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((s, i) => <SubjectCard key={s.id} s={s} index={i} />)}
            </div>

            {!user && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-10 text-center">
                <div className="inline-flex items-center gap-3 glass-navy rounded-2xl px-8 py-5 border border-purple-500/15">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <span className="text-white/50 text-sm">Sign up to unlock all ICAB subjects and start practising</span>
                  <Link to="/register" className="btn-gold text-sm py-2 px-5 font-bold flex items-center gap-1.5">
                    Unlock Access <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="section-label mx-auto w-fit"><Star className="w-3.5 h-3.5" /> Student Stories</div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Trusted by <span className="gradient-text-gold">ICAB Toppers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Tanvir Ahmed',
                level: 'CA Professional Level — Top Performer',
                text: 'CA Aspire BD is the most focused platform for ICAB preparation in Bangladesh. The mock tests are exactly like the real exams. Passed my Professional Level on the first attempt!',
                stars: 5
              },
              {
                name: 'Nusrat Jahan',
                level: 'CA Certificate Level — First Attempt',
                text: 'The chapter-wise practice helped me understand exactly where I was weak. The analytics are brilliant. CA Aspire BD made my Certificate Level preparation structured and effective.',
                stars: 5
              },
              {
                name: 'Mahmudul Hasan',
                level: 'CA Certificate Level Topper',
                text: 'As a Bangladeshi CA student, I needed a platform built for ICAB — not ICAI. CA Aspire BD is exactly that. The leaderboard kept me motivated throughout my preparation.',
                stars: 5
              },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="glass-card rounded-2xl p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-gold-500 opacity-60" />
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-gold-400 fill-gold-400" />)}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gold-500 text-xs font-medium">{t.level}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-24 px-4" style={{ background: 'rgba(6,11,36,0.5)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="section-label mx-auto w-fit mb-4">Frequently Asked</div>
            <h2 className="text-4xl font-black text-white">Questions & <span className="gradient-text">Answers</span></h2>
          </motion.div>
          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => <FAQ key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      {!user && (
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl p-12 text-center"
              style={{ background: 'linear-gradient(135deg, #0e1a4a 0%, #12108a 50%, #0e1a4a 100%)' }}>
              <div className="orb w-80 h-80 opacity-20" style={{ background: '#7c3aed', top: '-30%', right: '-10%' }} />
              <div className="orb w-60 h-60 opacity-15" style={{ background: '#f59e0b', bottom: '-20%', left: '-5%', animationDelay: '4s' }} />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 via-gold-500 to-purple-600" />
              <div className="relative z-10">
                <div className="section-label mx-auto w-fit mb-6"><Award className="w-3.5 h-3.5" /> Join Today</div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to <span className="gradient-text-gold">Pass Your ICAB CA?</span>
                </h2>
                <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                  Join 20,000+ Bangladeshi CA students who are preparing smarter with CA Aspire BD — the platform built specifically for ICAB aspirants.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn-gold flex items-center justify-center gap-2.5 text-base py-4 px-10 font-bold glow-gold">
                    Create Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="btn-outline flex items-center justify-center gap-2.5 text-base py-4 px-8">
                    Already registered? Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.05] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">CA Aspire BD</div>
                  <div className="text-gold-500 text-[9px] font-semibold tracking-widest uppercase">Premium ICAB Platform</div>
                </div>
              </div>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                Bangladesh's most trusted ICAB CA exam preparation platform. Purpose-built for Certificate Level and Professional Level aspirants.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
              <div className="flex flex-col gap-2.5">
                {['Dashboard', 'Leaderboard', 'Mock Tests', 'Analytics'].map(l => (
                  <span key={l} className="text-white/35 text-sm hover:text-white/70 transition-colors cursor-pointer">{l}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <div className="flex flex-col gap-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Support'].map(l => (
                  <span key={l} className="text-white/35 text-sm hover:text-white/70 transition-colors cursor-pointer">{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm">© 2025 CA Aspire BD. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-white/25 text-xs">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
