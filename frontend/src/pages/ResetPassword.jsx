import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, BookOpen, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function ResetPassword() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset link. Please request a new one.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/45' : 'text-slate-500';
  const textMuted = isDark ? 'text-white/30' : 'text-slate-400';
  const iconColor = isDark ? 'text-white/25' : 'text-slate-400';
  const eyeColor = isDark ? 'text-white/25 hover:text-white/60' : 'text-slate-400 hover:text-slate-600';

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (p.length < 8) return { label: 'Weak', color: '#f59e0b', width: '40%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: '#eab308', width: '60%' };
    if (!/[^A-Za-z0-9]/.test(p)) return { label: 'Good', color: '#22c55e', width: '80%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  })();

  return (
    <div className="min-h-screen flex overflow-hidden pt-16 transition-colors duration-300"
      style={isDark ? undefined : {
        background: 'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(139,92,246,0.13) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(236,72,153,0.09) 0%, transparent 50%), #f7f5ff'
      }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #06112e 0%, #0a1a4a 50%, #06112e 100%)' }}>
        <div className="orb w-72 h-72 top-[-5%] left-[-10%] opacity-30" style={{ background: '#22c55e' }} />
        <div className="orb w-56 h-56 bottom-[10%] right-[-5%] opacity-20" style={{ background: '#7c3aed', animationDelay: '4s' }} />
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
            Set your new<br />
            <span className="gradient-text-gold">password</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Choose a strong password to keep your CA Aspire BD account secure. You'll use it every time you sign in.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: '🔢', text: 'At least 6 characters long' },
              { icon: '🔠', text: 'Mix of uppercase and lowercase' },
              { icon: '🔢', text: 'Include numbers for strength' },
              { icon: '✨', text: 'Special characters make it stronger' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white/60 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 glass-navy rounded-2xl p-4 border border-purple-500/15">
          <p className="text-white/50 text-xs">After resetting, you'll be automatically redirected to the login page.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {isDark ? (
          <div className="orb w-96 h-96 top-[-10%] right-[-5%] opacity-10" style={{ background: '#22c55e', animationDelay: '2s' }} />
        ) : (
          <div className="absolute top-[-12%] right-[-8%] w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">

          <Link to="/login"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${isDark ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-slate-600'}`}>
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="glass-navy rounded-3xl p-8 border border-purple-500/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Password reset!</h2>
                <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>
                  Your password has been updated successfully. Redirecting you to the login page…
                </p>
                <div className="w-full rounded-full h-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3.5, ease: 'linear' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-green-400" />
                </div>
                <Link to="/login" className="btn-primary flex items-center justify-center gap-2 py-3 mt-5 text-sm">
                  Go to login now
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border"
                  style={{
                    background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.1)',
                    borderColor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.25)',
                  }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 text-xs font-semibold tracking-wide">Secure Reset</span>
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>New password</h1>
                <p className={textSecondary}>Choose a strong password for your account</p>
              </div>

              <div className="glass-navy rounded-3xl p-7 border border-purple-500/10">
                {!token ? (
                  <div className="text-center py-4">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 text-sm font-medium mb-4">Invalid or missing reset link.</p>
                    <Link to="/forgot-password" className="btn-primary py-3 text-sm flex items-center justify-center gap-2">
                      Request a new link
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className={`text-xs font-semibold mb-1.5 block ${textMuted}`}>New password</label>
                      <div className="relative">
                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          required
                          placeholder="Enter new password"
                          value={form.password}
                          autoComplete="new-password"
                          onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                          className="input-field pl-11 pr-11"
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}>
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {strength && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold" style={{ color: strength.color }}>Strength: {strength.label}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <motion.div animate={{ width: strength.width }} transition={{ duration: 0.3 }}
                              className="h-full rounded-full" style={{ background: strength.color }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`text-xs font-semibold mb-1.5 block ${textMuted}`}>Confirm password</label>
                      <div className="relative">
                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          required
                          placeholder="Confirm new password"
                          value={form.confirm}
                          autoComplete="new-password"
                          onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setError(''); }}
                          className={`input-field pl-11 pr-11 ${form.confirm && form.password !== form.confirm ? 'border-red-500/50' : form.confirm && form.password === form.confirm ? 'border-green-500/50' : ''}`}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}>
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {form.confirm && form.password !== form.confirm && (
                        <p className="text-red-400 text-[11px] mt-1.5 font-medium">Passwords don't match</p>
                      )}
                      {form.confirm && form.password === form.confirm && (
                        <p className="text-green-400 text-[11px] mt-1.5 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-400 flex items-start gap-2"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button type="submit"
                      disabled={loading || !form.password || !form.confirm || form.password !== form.confirm}
                      className="btn-primary flex items-center justify-center gap-2 py-3.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><ShieldCheck className="w-4 h-4" /><span>Reset Password</span></>}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
