import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../api';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, CheckCircle, ChevronRight, Send } from 'lucide-react';

const benefits = [
  'Access to all CA subjects and chapters',
  'Unlimited practice with mock tests',
  'Track your progress with analytics',
  'Compete on the national leaderboard',
  'Get instant notifications from teachers',
];

export default function Register() {
  const { register } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', class_level: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.class_level);
      setRegisteredEmail(form.email);
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        setRegisteredEmail(form.email);
        setSubmitted(true);
      } else {
        toast.error(data?.error || 'Registration failed');
      }
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: registeredEmail });
      toast.success('Verification email resent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    } finally { setResending(false); }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/45' : 'text-slate-500';
  const textMuted = isDark ? 'text-white/35' : 'text-slate-400';
  const iconColor = isDark ? 'text-white/25' : 'text-slate-400';
  const eyeColor = isDark ? 'text-white/25 hover:text-white/60' : 'text-slate-400 hover:text-slate-600';

  const pageStyle = isDark
    ? { background: 'linear-gradient(160deg, #020818 0%, #060c24 100%)' }
    : { background: 'radial-gradient(ellipse 70% 50% at 20% 10%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 80% 90%, rgba(236,72,153,0.08) 0%, transparent 50%), #f7f5ff' };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 transition-colors duration-300" style={pageStyle}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <div className="rounded-3xl p-8 border text-center transition-colors duration-300"
            style={{
              background: isDark ? 'rgba(10,15,46,0.85)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.12)',
              boxShadow: isDark ? 'none' : '0 8px 40px rgba(0,0,0,0.08)',
            }}>
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-indigo-500" />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Check your email</h2>
            <p className={`text-sm leading-relaxed mb-2 ${textSecondary}`}>We sent a verification link to</p>
            <p className="text-indigo-500 font-semibold text-sm mb-6">{registeredEmail}</p>
            <p className={`text-xs leading-relaxed mb-7 ${textMuted}`}>
              Click the link in the email to activate your account. The link expires in 24 hours. Check your spam folder if you don't see it.
            </p>
            <button onClick={handleResend} disabled={resending}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-4 disabled:opacity-50 border transition-colors"
              style={{
                background: isDark ? 'rgba(79,70,229,0.15)' : 'rgba(124,58,237,0.08)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)',
                color: isDark ? 'white' : '#6d28d9',
              }}>
              {resending
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
              Resend verification email
            </button>
            <Link to="/login" className={`text-sm transition-colors ${isDark ? 'text-white/35 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}>
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden pt-16 transition-colors duration-300"
      style={isDark ? undefined : { background: 'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(139,92,246,0.13) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(236,72,153,0.09) 0%, transparent 50%), #f7f5ff' }}>

      {/* Left panel — always dark */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #06112e 0%, #0e1a4a 50%, #06112e 100%)' }}>
        <div className="orb w-80 h-80 top-[-8%] right-[-8%] opacity-25" style={{ background: '#7c3aed' }} />
        <div className="orb w-60 h-60 bottom-[8%] left-[-5%] opacity-20" style={{ background: '#f59e0b', animationDelay: '3s' }} />
        <div className="hero-grid absolute inset-0 opacity-40" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">CA Aspire BD</div>
              <div className="text-amber-400 text-[9px] font-semibold tracking-widest uppercase">ICAB Prep Platform</div>
            </div>
          </Link>

          <div className="badge-gold mb-5 w-fit">Free Registration</div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Join 20,000+<br />
            <span className="gradient-text-gold">ICAB CA Aspirants</span>
          </h2>
          <p className="text-white/50 mb-10">Start your ICAB CA journey with Bangladesh's most trusted exam preparation platform.</p>

          <div className="flex flex-col gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-white/60 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: '20K+', label: 'Students' },
            { value: '5K+', label: 'MCQs' },
            { value: '98%', label: 'Pass Rate' },
          ].map((s, i) => (
            <div key={i} className="glass-navy rounded-2xl p-4 text-center border border-purple-500/10">
              <div className="text-xl font-black gradient-text-gold">{s.value}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {isDark ? (
          <div className="orb w-80 h-80 bottom-[-5%] left-[-5%] opacity-10" style={{ background: '#7c3aed' }} />
        ) : (
          <>
            <div className="absolute top-[-8%] right-[-10%] w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-[-6%] left-[5%] w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">

          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Create your account</h1>
            <p className={textSecondary}>Free forever. No credit card required.</p>
          </div>

          <div className="glass-navy rounded-3xl p-7 border border-purple-500/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                <input type="text" required placeholder="Full Name" value={form.name} autoComplete="name"
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field pl-11" />
              </div>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                <input type="email" required placeholder="Email address" value={form.email} autoComplete="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field pl-11" />
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                <input type={showPwd ? 'text' : 'password'} required placeholder="Password (min. 6 characters)" value={form.password} autoComplete="new-password"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <BookOpen className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                <select value={form.class_level} onChange={e => setForm(p => ({ ...p, class_level: e.target.value }))}
                  className="input-field pl-11 appearance-none"
                  style={{
                    color: form.class_level ? (isDark ? 'white' : '#1e293b') : (isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'),
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                  }}>
                  <option value="" style={{ background: isDark ? '#06112e' : '#ffffff', color: '#1e293b' }}>Select ICAB Level (Optional)</option>
                  <option value="Certificate" style={{ background: isDark ? '#06112e' : '#ffffff', color: '#1e293b' }}>CA Certificate Level</option>
                  <option value="Professional" style={{ background: isDark ? '#06112e' : '#ffffff', color: '#1e293b' }}>CA Professional Level</option>
                  <option value="Advanced" style={{ background: isDark ? '#06112e' : '#ffffff', color: '#1e293b' }}>CA Advanced Level</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 mt-1 disabled:opacity-50">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className={`text-center mt-6 text-sm ${textMuted}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-violet-500 hover:text-violet-600 font-semibold transition-colors">
              Sign in <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
