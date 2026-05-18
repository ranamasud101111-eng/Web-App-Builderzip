import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, Loader, RefreshCw, BookOpen } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

export default function VerifyEmail() {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus]   = useState('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail]     = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending]     = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found in the link.'); return; }
    setStatus('loading');
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
        setEmail(res.data.email || '');
      })
      .catch(err => {
        const data = err.response?.data || {};
        if (data.code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setEmail(data.email || '');
        } else {
          setStatus('error');
        }
        setMessage(data.error || 'Verification failed. The link may be invalid or already used.');
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    const targetEmail = email || resendEmail;
    if (!targetEmail) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: targetEmail });
      toast.success('Verification email sent! Check your inbox.');
      setResendEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend email');
    } finally { setResending(false); }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/50' : 'text-slate-500';
  const textMuted = isDark ? 'text-white/25' : 'text-slate-400';

  const pageBg = isDark
    ? { background: 'linear-gradient(160deg, #020818 0%, #060c24 100%)' }
    : { background: 'radial-gradient(ellipse 70% 50% at 20% 10%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 80% 90%, rgba(236,72,153,0.08) 0%, transparent 50%), #f7f5ff' };

  const cardStyle = isDark
    ? { background: 'rgba(10,15,46,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.07)' }
    : { background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderColor: 'rgba(124,58,237,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' };

  const inputClass = isDark
    ? 'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none border border-white/[0.07] focus:border-indigo-500/50 transition-all'
    : 'w-full rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white transition-all';

  const inputBg = isDark ? { background: 'rgba(255,255,255,0.04)' } : { background: '#ffffff' };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 transition-colors duration-300" style={pageBg}>
      {isDark ? (
        <>
          <div className="orb w-96 h-96 top-[-10%] right-[-10%] opacity-10" style={{ background: '#4f46e5' }} />
          <div className="orb w-72 h-72 bottom-[-5%] left-[-5%] opacity-8" style={{ background: '#7c3aed', animationDelay: '4s' }} />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] right-[-8%] w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-[-6%] left-[-5%] w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </>
      )}

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className={`font-bold text-lg ${textPrimary}`}>CA Aspire BD</div>
        </Link>

        <div className="rounded-3xl p-8 border transition-all duration-300" style={cardStyle}>

          {status === 'loading' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                <Loader className="w-7 h-7 text-indigo-500 animate-spin" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>Verifying your email…</h2>
              <p className={`text-sm ${textSecondary}`}>Please wait a moment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Email Verified!</h2>
              <p className={`text-sm mb-7 leading-relaxed ${textSecondary}`}>{message}</p>
              <Link to="/login"
                className="block w-full py-3.5 rounded-xl font-semibold text-sm text-white text-center transition-all"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)' }}>
                Sign In to Your Account
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                <RefreshCw className="w-7 h-7 text-amber-500" />
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Link Expired</h2>
              <p className={`text-sm mb-6 leading-relaxed ${textSecondary}`}>Your verification link has expired. Request a new one below.</p>
              <form onSubmit={handleResend} className="flex flex-col gap-3">
                {!email && (
                  <input type="email" required placeholder="Enter your email address"
                    value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                    className={inputClass} style={inputBg} />
                )}
                <button type="submit" disabled={resending}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  {resending ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Resend Verification Email
                </button>
              </form>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>Verification Failed</h2>
              <p className={`text-sm mb-6 leading-relaxed ${textSecondary}`}>{message}</p>
              <form onSubmit={handleResend} className="flex flex-col gap-3">
                <input type="email" required placeholder="Enter your email to resend"
                  value={resendEmail} onChange={e => setResendEmail(e.target.value)}
                  className={inputClass} style={inputBg} />
                <button type="submit" disabled={resending}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  {resending ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Resend Verification Email
                </button>
              </form>
            </div>
          )}

          {status === 'idle' && (
            <div className="text-center py-6">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className={`text-sm ${textSecondary}`}>Invalid verification link.</p>
            </div>
          )}
        </div>

        <p className={`text-center mt-6 text-xs ${textMuted}`}>
          <Link to="/login" className={`transition-colors ${isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}>Back to Login</Link>
          {' · '}
          <Link to="/register" className={`transition-colors ${isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}>Create new account</Link>
        </p>
      </motion.div>
    </div>
  );
}
