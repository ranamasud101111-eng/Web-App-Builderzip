import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const { default: api } = await import('../api');
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    } finally { setResending(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedEmail('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data || {};
      const status = err.response?.status;
      if (status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email || form.email);
        toast.error('Please verify your email before logging in.');
      } else if (status === 403) {
        toast.error('Admin accounts must use the Admin Login portal');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } finally { setLoading(false); }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/45' : 'text-slate-500';
  const textMuted = isDark ? 'text-white/30' : 'text-slate-400';
  const iconColor = isDark ? 'text-white/25' : 'text-slate-400';
  const eyeColor = isDark ? 'text-white/25 hover:text-white/60' : 'text-slate-400 hover:text-slate-600';

  return (
    <div className="min-h-screen flex overflow-hidden pt-16 transition-colors duration-300"
      style={isDark ? undefined : { background: 'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(139,92,246,0.13) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(236,72,153,0.09) 0%, transparent 50%), #f7f5ff' }}>

      {/* Left decorative panel — always dark */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #06112e 0%, #0a1a4a 50%, #06112e 100%)' }}>
        <div className="orb w-72 h-72 top-[-5%] left-[-10%] opacity-30" style={{ background: '#7c3aed' }} />
        <div className="orb w-56 h-56 bottom-[10%] right-[-5%] opacity-20" style={{ background: '#f59e0b', animationDelay: '4s' }} />
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

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Bangladesh's #1<br />
            <span className="gradient-text-gold">ICAB CA Exam Platform</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Join 20,000+ Bangladeshi CA aspirants who trust CA Aspire BD for their ICAB preparation.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: '🎯', text: '5,000+ MCQs across all ICAB subjects' },
              { icon: '📊', text: 'Detailed performance analytics' },
              { icon: '🏆', text: 'Bangladesh leaderboard rankings' },
              { icon: '📝', text: 'ICAB-aligned chapter-wise mock tests' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white/60 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 glass-navy rounded-2xl p-4 border border-purple-500/15">
          <div className="flex items-center gap-3 mb-2">
            {['👨‍💼','👩‍💼','👨‍🎓','👩‍🎓','👨‍💻'].map((e, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-sm border-2 border-[#06112e]">{e}</div>
            ))}
            <span className="text-white/60 text-xs ml-1">+20k students</span>
          </div>
          <p className="text-white/70 text-xs leading-relaxed italic">"CA Aspire BD helped me pass my CA Professional Level on the first attempt. The ICAB-aligned mock tests are exactly like the real exams!"</p>
          <p className="text-amber-400 text-xs font-semibold mt-1">— Tanvir Ahmed, CA Professional Level 2024</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {isDark ? (
          <div className="orb w-96 h-96 top-[-10%] right-[-5%] opacity-10" style={{ background: '#7c3aed', animationDelay: '2s' }} />
        ) : (
          <>
            <div className="absolute top-[-12%] right-[-8%] w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-[-8%] left-[10%] w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border"
              style={{
                background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.1)',
                borderColor: isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.3)',
              }}>
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-600 text-xs font-semibold tracking-wide">Student Portal</span>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Welcome back</h1>
            <p className={textSecondary}>Sign in to continue your preparation</p>
          </div>

          <div className="glass-navy rounded-3xl p-7 border border-purple-500/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                <input type="email" required placeholder="Email address" value={form.email} autoComplete="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field pl-11" />
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                <input type={showPwd ? 'text' : 'password'} required placeholder="Password" value={form.password} autoComplete="current-password"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <span className={`text-xs cursor-default ${textMuted}`}>Forgot password? Contact your administrator</span>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {unverifiedEmail && (
              <div className="mt-4 rounded-xl p-4 border border-amber-500/20"
                style={{ background: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.08)' }}>
                <p className="text-amber-600 text-xs mb-2 leading-relaxed">
                  Your email <strong>{unverifiedEmail}</strong> hasn't been verified yet.
                </p>
                <button onClick={handleResend} disabled={resending}
                  className="text-amber-600 text-xs font-semibold flex items-center gap-1.5 hover:text-amber-700 transition-colors disabled:opacity-50">
                  {resending
                    ? <div className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
                    : <Mail className="w-3 h-3" />}
                  Resend verification email
                </button>
              </div>
            )}
          </div>

          <p className={`text-center mt-6 text-sm ${textMuted}`}>
            New to CA Aspire BD?{' '}
            <Link to="/register" className="text-violet-500 hover:text-violet-600 font-semibold transition-colors">
              Create free account <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </p>

          <p className={`text-center mt-4 text-xs ${textMuted}`}>
            Are you an administrator?{' '}
            <Link to="/admin-login" className={`underline underline-offset-2 transition-colors ${isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}>
              Admin Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
