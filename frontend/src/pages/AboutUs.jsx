import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { GraduationCap, Users, BookOpen, Target, Shield, Award, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VALUES = [
  { icon: Target, title: 'ICAB-Aligned Content', desc: 'Every question, every mock test, every subject is crafted to match the ICAB Certificate and Professional Level syllabi exactly.', color: '#8b5cf6' },
  { icon: Users, title: 'Student-First Design', desc: 'Built by people who understand the pressure of CA exams in Bangladesh. Our platform is optimized for how students actually learn.', color: '#10b981' },
  { icon: Shield, title: 'Trusted & Reliable', desc: 'Used by 20,000+ CA aspirants across Bangladesh. Our content is reviewed regularly against the latest ICAB guidelines.', color: '#f59e0b' },
  { icon: Heart, title: 'Accessible Education', desc: 'Quality exam preparation should not be locked behind high fees. We believe every aspirant deserves access to world-class resources.', color: '#ec4899' },
];

export default function AboutUs() {
  const { isDark } = useTheme();
  const bg = isDark ? '#050816' : '#faf9ff';
  const bg2 = isDark ? '#0b1026' : '#f3f0ff';
  const textPrimary = isDark ? '#f1f5f9' : '#1e1b4b';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const textMuted = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)';
  const cardBorder = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.1)';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: textPrimary }}>
      <div className="max-w-5xl mx-auto px-4 py-20">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.08)', border: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.2)'}`, color: isDark ? '#a78bfa' : '#7c3aed' }}>
            <GraduationCap className="w-3.5 h-3.5" /> About CA Aspire BD
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight" style={{ color: textPrimary }}>
            Bangladesh's #1{' '}
            <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ICAB CA Platform
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: textSecondary }}>
            CA Aspire BD was founded with a single mission — to make world-class CA exam preparation accessible to every aspirant in Bangladesh. We are built by CA students, for CA students.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-8 sm:p-12 mb-16 text-center"
          style={{ background: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)', border: `1px solid ${cardBorder}` }}>
          <h2 className="text-2xl font-black mb-4" style={{ color: textPrimary }}>Our Mission</h2>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: textSecondary }}>
            To empower every Bangladeshi CA aspirant with intelligent, ICAB-aligned study tools — mock tests, analytics, flashcards, and curated content — so that passing the CA exam is not a matter of privilege, but of preparation.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {VALUES.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${v.color}15`, border: `1px solid ${v.color}25` }}>
                <v.icon className="w-5 h-5" style={{ color: v.color }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: textPrimary }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: '20,000+', label: 'Students' },
            { value: '5,000+', label: 'MCQ Questions' },
            { value: '98%', label: 'Satisfaction' },
            { value: '300+', label: 'Topics' },
          ].map((s, i) => (
            <div key={i} className="text-center rounded-2xl py-6 px-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="text-3xl font-black mb-1" style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div className="text-xs font-semibold" style={{ color: textMuted }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-center rounded-3xl p-10" style={{ background: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)', border: `1px solid ${cardBorder}` }}>
          <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#8b5cf6' }} />
          <h2 className="text-2xl font-black mb-3" style={{ color: textPrimary }}>Ready to Start?</h2>
          <p className="mb-6" style={{ color: textSecondary }}>Join thousands of CA aspirants across Bangladesh who are already preparing smarter.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)' }}>
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
