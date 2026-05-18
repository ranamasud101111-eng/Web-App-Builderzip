import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HelpCircle, ChevronDown, BookOpen, Brain, BarChart3, CreditCard, User, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    icon: User,
    title: 'Account & Registration',
    color: '#8b5cf6',
    faqs: [
      { q: 'How do I create an account?', a: 'Click "Start Free" on the homepage and fill in your name, email, and password. No payment required for the free plan.' },
      { q: 'I forgot my password. What do I do?', a: 'Go to the Login page and click "Forgot password?". Enter your email and we\'ll send you a reset link.' },
      { q: 'Can I change my email address?', a: 'Currently, email changes must be requested through our support team at support@caaspirebd.com.' },
      { q: 'How do I delete my account?', a: 'Contact us at support@caaspirebd.com with your request. We will process account deletion within 7 business days.' },
    ],
  },
  {
    icon: BookOpen,
    title: 'Subjects & Enrollment',
    color: '#10b981',
    faqs: [
      { q: 'How do I enroll in a subject?', a: 'From your Dashboard, scroll to "Enroll in More Subjects" or visit the Subjects section. Click "Enroll" on any subject to add it to your dashboard.' },
      { q: 'Which ICAB subjects are available?', a: 'We cover all major ICAB Certificate and Professional Level subjects including Financial Accounting, Auditing, Taxation, Law, and more.' },
      { q: 'Can I unenroll from a subject?', a: 'Yes, you can unenroll from subjects you no longer need from the subject detail page.' },
    ],
  },
  {
    icon: Brain,
    title: 'MCQ Practice & Exams',
    color: '#f59e0b',
    faqs: [
      { q: 'How does MCQ practice work?', a: 'Go to MCQ Practice, select your level and subject, then choose a chapter. You\'ll get instant feedback with explanations for every question.' },
      { q: 'What is the difference between Practice and Quiz mode?', a: 'Practice mode has no time limit and shows explanations immediately. Quiz mode is timed (10 questions in 10 minutes) and simulates exam conditions.' },
      { q: 'Where can I see my wrong answers?', a: 'All incorrectly answered questions are automatically saved to "Wrong Answers" in the sidebar. Review them anytime.' },
      { q: 'How do mock exams work?', a: 'Mock Tests are full timed exams that simulate ICAB exam conditions. Your results, score, and time are saved for analytics.' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Progress & Analytics',
    color: '#ec4899',
    faqs: [
      { q: 'How is my progress calculated?', a: 'Progress is calculated based on chapters you\'ve completed at least one practice session in. The dashboard shows your completion rate per subject.' },
      { q: 'What is the Leaderboard?', a: 'The Leaderboard ranks all students in Bangladesh by the number of chapters they\'ve completed. It updates in real time.' },
      { q: 'Can I see my historical exam results?', a: 'Yes, go to Analytics in the sidebar to see detailed performance history, accuracy trends, and subject breakdowns.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Pricing & Plans',
    color: '#06b6d4',
    faqs: [
      { q: 'Is CA Aspire BD free?', a: 'Yes! The platform is currently free for all students. You get full access to all features including MCQs, mock tests, analytics, and more.' },
      { q: 'Will there be a paid plan in the future?', a: 'We may introduce a premium plan in the future with advanced features. All current users will be notified well in advance before any pricing changes.' },
      { q: 'Is there a student discount?', a: 'The platform is already free, so no discount is needed. If a paid plan is introduced, student pricing will be a priority.' },
    ],
  },
];

function FAQItem({ q, a, isDark, textPrimary, textSecondary, dividerColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0 transition-colors" style={{ borderColor: dividerColor }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-semibold" style={{ color: textPrimary }}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <p className="pb-4 text-sm leading-relaxed" style={{ color: textSecondary }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenter() {
  const { isDark } = useTheme();
  const bg = isDark ? '#050816' : '#faf9ff';
  const textPrimary = isDark ? '#f1f5f9' : '#1e1b4b';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.1)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.08)';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: textPrimary }}>
      <div className="max-w-4xl mx-auto px-4 py-20">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <HelpCircle className="w-7 h-7" style={{ color: '#8b5cf6' }} />
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ color: textPrimary }}>Help Center</h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: textSecondary }}>
            Find answers to common questions about CA Aspire BD. Can't find what you need?{' '}
            <Link to="/contact" className="font-semibold hover:underline" style={{ color: '#8b5cf6' }}>Contact us</Link>.
          </p>
        </motion.div>

        <div className="space-y-5">
          {CATEGORIES.map((cat, ci) => (
            <motion.div key={ci} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08 }}
              className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `1px solid ${dividerColor}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                  <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <h2 className="font-bold text-base" style={{ color: textPrimary }}>{cat.title}</h2>
              </div>
              <div className="px-6">
                {cat.faqs.map((faq, fi) => (
                  <FAQItem key={fi} {...faq} isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary} dividerColor={dividerColor} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-10 text-center rounded-2xl p-8"
          style={{ background: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)', border: `1px solid ${cardBorder}` }}>
          <Mail className="w-10 h-10 mx-auto mb-3" style={{ color: '#8b5cf6' }} />
          <h3 className="font-bold text-lg mb-2" style={{ color: textPrimary }}>Still need help?</h3>
          <p className="text-sm mb-4" style={{ color: textSecondary }}>Our team is happy to assist you with any questions or issues.</p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
            Contact Support
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
