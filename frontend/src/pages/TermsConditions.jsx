import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using CA Aspire BD, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of the updated terms.`,
  },
  {
    title: '2. Eligibility',
    content: `CA Aspire BD is designed for students preparing for ICAB CA examinations in Bangladesh. You must provide accurate information during registration. One account per person — creating multiple accounts is not permitted.`,
  },
  {
    title: '3. Use of the Platform',
    content: `You agree to use CA Aspire BD only for lawful educational purposes. You must not: share your account credentials with others, attempt to reverse-engineer or copy the platform, upload harmful or inappropriate content, or engage in any activity that disrupts the service for other users.`,
  },
  {
    title: '4. Intellectual Property',
    content: `All content on CA Aspire BD — including MCQ questions, study materials, flashcards, short notes, and exam papers — is the intellectual property of CA Aspire BD or its licensed content providers. You may not reproduce, distribute, or commercially exploit any content without written permission.`,
  },
  {
    title: '5. Account Termination',
    content: `We reserve the right to suspend or terminate accounts that violate these terms, engage in academic dishonesty, attempt to game the leaderboard, or misuse the platform in any way. Terminated accounts may lose access to their progress data.`,
  },
  {
    title: '6. Disclaimer of Warranties',
    content: `CA Aspire BD is provided "as is" without warranties of any kind. While we strive to maintain accuracy in all content, we do not guarantee that all MCQ questions or study materials are free from errors. Content should be used as a supplement to, not a replacement for, official ICAB study materials.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `CA Aspire BD shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform, including exam results or academic outcomes. Our platform is a preparation tool and does not guarantee exam success.`,
  },
  {
    title: '8. Governing Law',
    content: `These Terms and Conditions are governed by the laws of Bangladesh. Any disputes arising from the use of CA Aspire BD shall be subject to the jurisdiction of the courts of Dhaka, Bangladesh.`,
  },
  {
    title: '9. Contact',
    content: `For questions about these Terms and Conditions, please contact us at support@caaspirebd.com.`,
  },
];

export default function TermsConditions() {
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
            <FileText className="w-7 h-7" style={{ color: '#8b5cf6' }} />
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ color: textPrimary }}>Terms & Conditions</h1>
          <p className="text-sm" style={{ color: textMuted }}>Last updated: January 2025</p>
          <p className="mt-4 text-base" style={{ color: textSecondary }}>
            Please read these terms carefully before using CA Aspire BD. By using the platform, you agree to these terms.
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
