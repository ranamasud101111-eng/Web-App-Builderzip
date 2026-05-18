import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Mail, Facebook, MessageCircle, MapPin, Clock, Send, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ContactUs() {
  const { isDark } = useTheme();
  const bg = isDark ? '#050816' : '#faf9ff';
  const textPrimary = isDark ? '#f1f5f9' : '#1e1b4b';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const textMuted = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.1)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Message sent! We\'ll get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  const INFO = [
    { icon: Mail, title: 'Email Us', value: 'support@caaspirebd.com', sub: 'We reply within 24 hours', href: 'mailto:support@caaspirebd.com' },
    { icon: Facebook, title: 'Facebook', value: 'CA Aspire BD', sub: 'Follow us for updates', href: 'https://facebook.com/caaspirebd' },
    { icon: Clock, title: 'Support Hours', value: 'Sat – Thu', sub: '9:00 AM – 9:00 PM BST', href: null },
    { icon: MapPin, title: 'Based In', value: 'Dhaka, Bangladesh', sub: 'Serving students nationwide', href: null },
  ];

  const inputStyle = {
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    color: textPrimary,
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: textPrimary }}>
      <div className="max-w-5xl mx-auto px-4 py-20">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.08)', border: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.2)'}`, color: isDark ? '#a78bfa' : '#7c3aed' }}>
            <MessageCircle className="w-3.5 h-3.5" /> Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4" style={{ color: textPrimary }}>
            Contact{' '}
            <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Us
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: textSecondary }}>
            Have a question or need help? We're here for you. Reach out and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {INFO.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              {item.href ? (
                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="block p-5 rounded-2xl transition-all hover:-translate-y-0.5 group"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <item.icon className="w-5 h-5 mb-3" style={{ color: '#8b5cf6' }} />
                  <p className="font-bold text-sm mb-0.5 group-hover:text-violet-500 transition-colors" style={{ color: textPrimary }}>{item.title}</p>
                  <p className="font-semibold text-xs" style={{ color: '#8b5cf6' }}>{item.value}</p>
                  <p className="text-xs mt-1" style={{ color: textMuted }}>{item.sub}</p>
                </a>
              ) : (
                <div className="p-5 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <item.icon className="w-5 h-5 mb-3" style={{ color: '#8b5cf6' }} />
                  <p className="font-bold text-sm mb-0.5" style={{ color: textPrimary }}>{item.title}</p>
                  <p className="font-semibold text-xs" style={{ color: '#8b5cf6' }}>{item.value}</p>
                  <p className="text-xs mt-1" style={{ color: textMuted }}>{item.sub}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-3xl p-8 sm:p-10" style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
          <h2 className="text-xl font-black mb-6" style={{ color: textPrimary }}>Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: textMuted }}>Your Name</label>
                <input type="text" required placeholder="e.g. Tanvir Ahmed" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = inputBorder} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: textMuted }}>Email Address</label>
                <input type="email" required placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = inputBorder} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: textMuted }}>Subject</label>
              <input type="text" required placeholder="How can we help?" value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = inputBorder} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: textMuted }}>Message</label>
              <textarea required rows={5} placeholder="Write your message here..." value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = inputBorder} />
            </div>
            <button type="submit" disabled={sending}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 30px rgba(124,58,237,0.35)' }}>
              {sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
