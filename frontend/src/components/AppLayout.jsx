import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Your learning overview' },
  '/practice': { title: 'MCQ Practice', sub: 'Level → Subject → Chapter' },
  '/exams': { title: 'Mock Tests', sub: 'Timed exam sessions' },
  '/progress': { title: 'Analytics', sub: 'Detailed performance report' },
  '/leaderboard': { title: 'Leaderboard', sub: 'Bangladesh ranking' },
  '/bookmarks': { title: 'Bookmarks', sub: 'Saved questions' },
  '/wrong-answers': { title: 'Wrong Answers', sub: 'Review your mistakes' },
  '/custom-exam': { title: 'Custom Exam', sub: 'Build your own exam' },
  '/quiz': { title: 'Quick Quiz', sub: '10 questions · 10 minutes' },
  '/classes': { title: 'Study Materials', sub: 'Watch lecture videos' },
  '/flashcards': { title: 'Flash Cards', sub: 'Smart study cards' },
  '/shortnotes': { title: 'Notes', sub: 'Quick reference PDFs' },
  '/question-bank': { title: 'Question Bank', sub: 'Curated MCQ library' },
  '/admin': { title: 'Admin Dashboard', sub: 'System overview' },
  '/admin/subjects': { title: 'Manage Subjects', sub: 'Add, edit, delete subjects' },
  '/admin/mcqs': { title: 'Manage MCQs', sub: 'Question management' },
  '/admin/exams': { title: 'Manage Exams', sub: 'Exam management' },
  '/admin/students': { title: 'Students', sub: 'User management' },
  '/admin/classes': { title: 'Classes', sub: 'Class management' },
  '/admin/flashcards': { title: 'Flash Cards', sub: 'Card management' },
  '/admin/shortnotes': { title: 'Short Notes', sub: 'Notes management' },
  '/admin/question-bank': { title: 'Question Bank', sub: 'Bank management' },
  '/admin/notifications': { title: 'Notifications', sub: 'Broadcast messages' },
  '/admin/enrollments': { title: 'Enrollments', sub: 'Student enrollments' },
  '/admin/completions': { title: 'Completions', sub: 'Chapter completions' },
  '/admin/settings': { title: 'Settings', sub: 'Feature visibility controls' },
  '/admin/quiz-manager': { title: 'Quiz Manager', sub: 'Build chapter quizzes' },
  '/progress-tracker': { title: 'Progress Tracker', sub: 'Full learning analytics' },
  '/daily-progress': { title: 'Daily Progress', sub: 'Your performance history' },
  '/settings': { title: 'Account Settings', sub: 'Profile & security' },
};

function getPageMeta(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/subject/')) return { title: 'Subject', sub: 'Chapter overview' };
  if (pathname.startsWith('/chapter/') && pathname.endsWith('/practice')) return { title: 'Practice Mode', sub: 'MCQ practice session' };
  if (pathname.startsWith('/chapter/') && pathname.endsWith('/quiz')) return { title: 'Quiz Mode', sub: 'Timed quiz' };
  if (pathname.startsWith('/chapter/') && pathname.endsWith('/exam')) return { title: 'Exam Mode', sub: 'Full exam session' };
  if (pathname.startsWith('/chapter/')) return { title: 'Chapter', sub: 'Study content' };
  return { title: 'CA Aspire BD', sub: 'ICAB Prep Platform' };
}

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const { title, sub } = getPageMeta(location.pathname);

  const headerBg = isDark
    ? 'rgba(3,10,26,0.82)'
    : 'rgba(255,255,255,0.88)';

  const headerBorder = isDark
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(124,58,237,0.08)';

  const headerShadow = isDark
    ? 'none'
    : '0 1px 0 rgba(124,58,237,0.06), 0 4px 16px rgba(0,0,0,0.04)';

  const titleColor = isDark ? 'text-white/90' : 'text-slate-800';
  const subColor = isDark ? 'text-white/30' : 'text-slate-500';
  const userNameColor = isDark ? 'text-white/85' : 'text-slate-700';
  const userRoleColor = isDark ? 'text-white/30' : 'text-slate-500';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.1)';

  return (
    <div className="min-h-screen bg-animated-navy transition-colors duration-300">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="lg:ml-[220px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 h-[56px] flex-shrink-0 transition-all duration-300"
          style={{
            background: headerBg,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: `1px solid ${headerBorder}`,
            boxShadow: headerShadow,
          }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.06)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.12)'}`,
              }}>
              <Menu className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-slate-500'}`} />
            </button>
            <div className="hidden sm:block">
              <h2 className={`text-[13px] font-bold leading-none ${titleColor}`}>{title}</h2>
              <p className={`text-[10px] mt-0.5 leading-none font-medium ${subColor}`}>{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <div className="flex items-center gap-2 pl-2.5"
              style={{ borderLeft: `1px solid ${dividerColor}` }}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-[12px]">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className={`text-[11px] font-bold leading-none ${userNameColor}`}>{user?.name?.split(' ')[0]}</p>
                <p className={`text-[9px] capitalize leading-none mt-0.5 ${userRoleColor}`}>{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
