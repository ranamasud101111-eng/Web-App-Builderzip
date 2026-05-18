import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, BookOpen, Send, CheckCircle } from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPassword() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/45' : 'text-slate-500';
  const textMuted = isDark ? 'text-white/30' : 'text-slate-400';
  const iconColor = isDark ? 'text-white/25' : 'text-slate-400';

  return (
    <div className="min-h-screen flex overflow-hidden pt-16 transition-colors duration-300"
      style={isDark ? undefined : {
        background: 'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(139,92,246,0.13) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(236,72,153,0.09) 0%, transparent 50%), #f7f5ff'
      }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #06112e 0%, #0a1a4a 50%, #06112e 100%)' }}>
        <div className="orb w-72 h-72 top-[-5%] left-[-10%] opacity-30" style={{ background: '#7c3aed' }} />
        <div className="orb w-56 h-56 bottom-[10%] right-[-5%] opacity-20" style={{ background: '#06b6d4', animationDelay: '3s' }} />
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
            Forgot your<br />
            <span className="gradient-text-gold">password?</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            No worries — it happens to everyone. We'll send a secure reset link to your email address so you can get back to your studies quickly.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: '🔒', text: 'Secure token-based reset' },
              { icon: '⏱️', text: 'Link expires in 1 hour for safety' },
              { icon: '📧', text: 'Sent to your registered email only' },
              { icon: '✅', text: 'Login immediately after reset' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white/60 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 glass-navy rounded-2xl p-4 border border-purple-500/15">
          <p className="text-white/50 text-xs leading-relaxed">Having trouble? Contact your administrator or teacher directly for immediate account access assistance.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {isDark ? (
          <div className="orb w-96 h-96 top-[-10%] right-[-5%] opacity-10" style={{ background: '#7c3aed', animationDelay: '2s' }} />
        ) : (
          <>
            <div className="absolute top-[-12%] right-[-8%] w-80 h-80 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-[-8%] left-[10%] w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">

          <Link to="/login"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${isDark ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-slate-600'}`}>
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border"
                  style={{
                    background: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.1)',
                    borderColor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.25)',
                  }}>
                  <Mail className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-violet-600 text-xs font-semibold tracking-wide">Password Reset</span>
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Reset password</h1>
                <p className={textSecondary}>Enter your registered email and we'll send you a reset link</p>
              </div>

              <div className="glass-navy rounded-3xl p-7 border border-purple-500/10">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${textMuted}`}>Email address</label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                      <input
                        type="email"
                        required
                        placeholder="Enter your registered email"
                        value={email}
                        autoComplete="email"
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-400"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 py-3.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Send className="w-4 h-4" /><span>Send Reset Link</span></>}
                  </button>
                </form>
              </div>

              <p className={`text-center mt-6 text-sm ${textMuted}`}>
                Remembered your password?{' '}
                <Link to="/login" className="text-violet-500 hover:text-violet-600 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="glass-navy rounded-3xl p-8 border border-purple-500/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Check your email</h2>
                <p className={`text-sm leading-relaxed mb-2 ${textSecondary}`}>
                  If <span className="font-semibold text-violet-400">{email}</span> is registered, we've sent a password reset link to it.
                </p>
                <p className={`text-xs leading-relaxed mb-7 ${textMuted}`}>
                  The link expires in <strong className={isDark ? 'text-white/50' : 'text-slate-500'}>1 hour</strong>. Check your spam folder if you don't see it.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors border ${isDark ? 'border-white/10 text-white/60 hover:text-white/80 hover:border-white/20' : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                    Try a different email
                  </button>
                  <Link to="/login"
                    className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
                    Back to login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
