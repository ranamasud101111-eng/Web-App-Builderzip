import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await adminLogin(form.email, form.password);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/admin');
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        toast.error('Access denied. This portal is for administrators only.');
      } else {
        toast.error(err.response?.data?.error || 'Invalid credentials');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden pt-16">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #030a1a 0%, #0a0f2e 50%, #030a1a 100%)' }}>
        <div className="orb w-80 h-80 top-[-8%] left-[-8%] opacity-25" style={{ background: '#4f46e5' }} />
        <div className="orb w-60 h-60 bottom-[8%] right-[-6%] opacity-15" style={{ background: '#7c3aed', animationDelay: '3s' }} />
        <div className="orb w-48 h-48 top-[45%] left-[30%] opacity-10" style={{ background: '#2563eb', animationDelay: '6s' }} />
        <div className="hero-grid absolute inset-0 opacity-30" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">CA Mock</div>
              <div className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#818cf8' }}>Administration</div>
            </div>
          </Link>

          {/* Admin badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 border border-indigo-500/25"
            style={{ background: 'rgba(79,70,229,0.12)' }}>
            <Shield className="w-4 h-4" style={{ color: '#818cf8' }} />
            <span className="text-xs font-semibold tracking-wider" style={{ color: '#818cf8' }}>ADMIN CONTROL CENTER</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            Manage Your<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Learning Platform
            </span>
          </h2>
          <p className="text-white/45 text-base leading-relaxed mb-10">
            Full administrative access to manage students, content, MCQs, and platform analytics.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: '👥', text: 'Manage students and enrollments' },
              { icon: '📚', text: 'Create and edit subjects & chapters' },
              { icon: '❓', text: 'Upload and manage MCQ banks' },
              { icon: '📢', text: 'Send targeted notifications' },
              { icon: '📈', text: 'View platform-wide analytics' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span className="text-white/55 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div className="relative z-10 rounded-2xl p-4 border border-indigo-500/15"
          style={{ background: 'rgba(15,20,60,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full border border-indigo-500/30 flex items-center justify-center"
              style={{ background: 'rgba(79,70,229,0.15)' }}>
              <Shield className="w-4 h-4" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold">Secured Access</p>
              <p className="text-white/30 text-[10px]">256-bit encrypted session</p>
            </div>
          </div>
          <p className="text-white/40 text-xs leading-relaxed">
            This portal is restricted to authorized administrators only. All access is logged and monitored.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: 'linear-gradient(160deg, #020818 0%, #060c24 100%)' }}>
        <div className="orb w-80 h-80 top-[-8%] right-[-5%] opacity-8" style={{ background: '#4f46e5', animationDelay: '2s' }} />
        <div className="orb w-56 h-56 bottom-[-5%] left-[5%] opacity-6" style={{ background: '#7c3aed', animationDelay: '5s' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 border border-indigo-500/25"
              style={{ background: 'rgba(79,70,229,0.1)' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: '#818cf8' }}>Admin Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Administrator Login</h1>
            <p className="text-white/40">Restricted access — authorized personnel only</p>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-3 rounded-xl p-3.5 mb-6 border border-amber-500/15"
            style={{ background: 'rgba(245,158,11,0.06)' }}>
            <AlertCircle className="w-4 h-4 text-amber-400/70 mt-0.5 shrink-0" />
            <p className="text-amber-400/60 text-xs leading-relaxed">
              Student credentials will not work here. Students should use the{' '}
              <Link to="/login" className="text-amber-400/80 hover:text-amber-400 underline underline-offset-2 transition-colors">
                Student Login
              </Link>{' '}
              portal.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-7 border border-indigo-500/15"
            style={{ background: 'rgba(10,15,46,0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

            {/* Logo inside card */}
            <div className="flex items-center gap-2.5 mb-7 pb-6 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">CA Mock</div>
                <div className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#818cf8' }}>Admin Dashboard</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    required
                    placeholder="admin@camock.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-white/20 outline-none transition-all border border-white/[0.07] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all border border-white/[0.07] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end -mt-1">
                <button type="button"
                  onClick={() => toast.info('Please contact your system administrator to reset your password.')}
                  className="text-xs transition-colors"
                  style={{ color: '#818cf8' }}
                  onMouseEnter={e => e.target.style.color = '#a5b4fc'}
                  onMouseLeave={e => e.target.style.color = '#818cf8'}>
                  Forgot password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3.5 mt-1 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(79,70,229,0.35)',
                }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Shield className="w-4 h-4" /><span>Access Admin Panel</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-white/20 mt-6 text-xs">
            Are you a student?{' '}
            <Link to="/login" className="text-white/35 hover:text-white/55 transition-colors underline underline-offset-2">
              Student Login <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
