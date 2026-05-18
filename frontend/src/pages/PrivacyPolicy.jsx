import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `When you register on CA Aspire BD, we collect your name, email address, and optionally your ICAB class level. We also collect usage data such as MCQ responses, exam scores, chapter progress, and session activity to power your analytics dashboard.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to provide and improve the platform, personalize your learning experience, calculate your leaderboard ranking, and send important notifications about the platform. We do not use your data for advertising purposes.`,
  },
  {
    title: '3. Data Storage & Security',
    content: `All data is stored securely on encrypted servers. Passwords are hashed using industry-standard bcrypt algorithms and are never stored in plain text. We implement appropriate technical and organizational measures to protect your personal data.`,
  },
  {
    title: '4. Third-Party Services',
    content: `CA Aspire BD does not sell or share your personal information with third parties for marketing purposes. We may use trusted service providers for infrastructure (e.g., cloud hosting) who are bound by strict data processing agreements.`,
  },
  {
    title: '5. Cookies',
    content: `We use cookies and local storage tokens to maintain your login session. These are essential for the platform to function. You can clear cookies through your browser settings, which will log you out of the platform.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to access, correct, or delete your personal data at any time. To request data deletion or export, please contact us at support@caaspirebd.com. We will process your request within 30 days.`,
  },
  {
    title: '7. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date. Continued use of the platform after changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: '8. Contact',
    content: `For any privacy-related concerns or requests, please email us at support@caaspirebd.com. We are committed to resolving your concerns promptly and transparently.`,
  },
];

export default function PrivacyPolicy() {
  const { isDark } = useTheme();
  const bg = isDark ? '#050816' : '#faf9ff';
  const textPrimary = isDark ? '#f1f5f9' : '#1e1b4b';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const textMuted = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.1)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.08)';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: textPrimary }}>
      <div className="max-w-3xl mx-auto px-4 py-20">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Shield className="w-7 h-7" style={{ color: '#8b5cf6' }} />
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ color: textPrimary }}>Privacy Policy</h1>
          <p className="text-sm" style={{ color: textMuted }}>Last updated: January 2025</p>
          <p className="mt-4 text-base" style={{ color: textSecondary }}>
            CA Aspire BD is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
          {SECTIONS.map((s, i) => (
            <div key={i} className="px-8 py-6" style={{ borderBottom: i < SECTIONS.length - 1 ? `1px solid ${dividerColor}` : 'none' }}>
              <h2 className="font-bold text-base mb-3" style={{ color: textPrimary }}>{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>{s.content}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
