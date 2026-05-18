import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16"
        style={{ background: 'linear-gradient(160deg, #020818 0%, #060c24 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <div className="rounded-3xl p-8 border border-white/[0.07] text-center"
            style={{ background: 'rgba(10,15,46,0.85)', backdropFilter: 'blur(20px)' }}>
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-2">
              We sent a verification link to
            </p>
            <p className="text-indigo-300 font-semibold text-sm mb-6">{registeredEmail}</p>
            <p className="text-white/35 text-xs leading-relaxed mb-7">
              Click the link in the email to activate your account. The link expires in 24 hours. Check your spam folder if you don't see it.
            </p>
            <button onClick={handleResend} disabled={resending}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mb-4 disabled:opacity-50 border border-white/10 hover:border-indigo-500/40 transition-colors"
              style={{ background: 'rgba(79,70,229,0.15)' }}>
              {resending
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
              Resend verification email
            </button>
            <Link to="/login" className="text-white/35 hover:text-white/60 text-sm transition-colors">
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden pt-16">
      {/* Left panel */}
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
              <div className="text-white font-bold text-lg">CA Mock</div>
              <div className="text-gold-500 text-[9px] font-semibold tracking-widest uppercase">Premium Platform</div>
            </div>
          </Link>

          <div className="badge-gold mb-5 w-fit">Free Registration</div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Join 50,000+<br />
            <span className="gradient-text-gold">CA Aspirants</span>
          </h2>
          <p className="text-white/50 mb-10">Start your CA journey with India's most trusted exam preparation platform.</p>

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
            { value: '50K+', label: 'Students' },
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

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="orb w-80 h-80 bottom-[-5%] left-[-5%] opacity-10" style={{ background: '#7c3aed' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/45">Free forever. No credit card required.</p>
          </div>

          <div className="glass-navy rounded-3xl p-7 border border-purple-500/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="text" required placeholder="Full Name" value={form.name} autoComplete="name"
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field pl-11" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="email" required placeholder="Email address" value={form.email} autoComplete="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field pl-11" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type={showPwd ? 'text' : 'password'} required placeholder="Password (min. 6 characters)" value={form.password} autoComplete="new-password"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <select value={form.class_level} onChange={e => setForm(p => ({ ...p, class_level: e.target.value }))}
                  className="input-field pl-11 appearance-none"
                  style={{ color: form.class_level ? 'white' : 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)' }}>
                  <option value="" style={{ background: '#06112e' }}>Select Level (Optional)</option>
                  <option value="Foundation" style={{ background: '#06112e' }}>CA Foundation</option>
                  <option value="Intermediate" style={{ background: '#06112e' }}>CA Intermediate</option>
                  <option value="Final" style={{ background: '#06112e' }}>CA Final</option>
                  {[6,7,8,9,10,11,12].map(c => <option key={c} value={c} style={{ background: '#06112e' }}>Class {c}</option>)}
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

          <p className="text-center text-white/35 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign in <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
