import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials';
      if (err.response?.status === 403) {
        toast.error('Admin accounts must use the Admin Login portal');
      } else {
        toast.error(msg);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden pt-16">
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
              <div className="text-white font-bold text-lg">CA Mock</div>
              <div className="text-gold-500 text-[9px] font-semibold tracking-widest uppercase">Premium Platform</div>
            </div>
          </Link>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            India's Most Trusted<br />
            <span className="gradient-text-gold">CA Exam Platform</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Join 50,000+ CA aspirants who trust CA Mock for their exam preparation.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: '🎯', text: '5,000+ MCQs across all CA subjects' },
              { icon: '📊', text: 'Detailed performance analytics' },
              { icon: '🏆', text: 'National leaderboard rankings' },
              { icon: '📝', text: 'Expertly curated mock tests' },
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
            {['👨‍💼','👩‍💼','👨‍🎓','👩‍🎓','👨‍💻'].map((e,i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-sm border-2 border-navy-900">{e}</div>
            ))}
            <span className="text-white/60 text-xs ml-1">+50k students</span>
          </div>
          <p className="text-white/70 text-xs leading-relaxed italic">"CA Mock helped me clear my CA Final on the first attempt. The mock tests are exactly like the real exam!"</p>
          <p className="text-gold-400 text-xs font-semibold mt-1">— Priya Sharma, CA Final 2024</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="orb w-96 h-96 top-[-10%] right-[-5%] opacity-10" style={{ background: '#7c3aed', animationDelay: '2s' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10">

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border border-gold-500/20"
              style={{ background: 'rgba(245,158,11,0.08)' }}>
              <BookOpen className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-gold-400 text-xs font-semibold tracking-wide">Student Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-white/45">Sign in to continue your preparation</p>
          </div>

          <div className="glass-navy rounded-3xl p-7 border border-purple-500/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="email" required placeholder="Email address" value={form.email} autoComplete="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field pl-11" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type={showPwd ? 'text' : 'password'} required placeholder="Password" value={form.password} autoComplete="current-password"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <span className="text-white/30 text-xs cursor-default">Forgot password? Contact your administrator</span>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-white/35 mt-6 text-sm">
            New to CA Mock?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Create free account <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </p>

          <p className="text-center text-white/20 mt-4 text-xs">
            Are you an administrator?{' '}
            <Link to="/admin-login" className="text-white/40 hover:text-white/60 transition-colors underline underline-offset-2">
              Admin Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
