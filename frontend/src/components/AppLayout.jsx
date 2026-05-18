import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Your learning overview' },
  '/practice': { title: 'MCQ Practice', sub: 'Level → Subject → Chapter' },
  '/exams': { title: 'Mock Tests', sub: 'Timed exam sessions' },
  '/progress': { title: 'Analytics', sub: 'Detailed performance report' },
  '/leaderboard': { title: 'Leaderboard', sub: 'Bangladesh ranking' },
  '/bookmarks': { title: 'Bookmarks', sub: 'Saved questions' },
  '/wrong-answers': { title: 'Wrong Answers', sub: 'Review your mistakes' },
  '/custom-exam': { title: 'Custom Exam', sub: 'Build your own exam' },
  '/classes': { title: 'Video Classes', sub: 'Watch lecture videos' },
  '/flashcards': { title: 'Flash Cards', sub: 'Smart study cards' },
  '/shortnotes': { title: 'Short Notes', sub: 'Quick reference PDFs' },
  '/question-bank': { title: 'Question Bank', sub: 'Curated MCQ library' },
  '/admin': { title: 'Admin Dashboard', sub: 'System overview' },
  '/admin/subjects': { title: 'Manage Subjects', sub: 'Add, edit, delete subjects' },
  '/admin/mcqs': { title: 'Manage MCQs', sub: 'Question management' },
  '/admin/exams': { title: 'Manage Exams', sub: 'Exam management' },
  '/admin/students': { title: 'Students', sub: 'User management' },
  '/admin/classes': { title: 'Video Classes', sub: 'Class management' },
  '/admin/flashcards': { title: 'Flash Cards', sub: 'Card management' },
  '/admin/shortnotes': { title: 'Short Notes', sub: 'Notes management' },
  '/admin/question-bank': { title: 'Question Bank', sub: 'Bank management' },
  '/admin/notifications': { title: 'Notifications', sub: 'Broadcast messages' },
  '/admin/enrollments': { title: 'Enrollments', sub: 'Student enrollments' },
  '/admin/completions': { title: 'Completions', sub: 'Chapter completions' },
};

function getPageMeta(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/subject/')) return { title: 'Subject', sub: 'Chapter overview' };
  if (pathname.startsWith('/chapter/') && pathname.endsWith('/practice')) return { title: 'Practice Mode', sub: 'MCQ practice session' };
  if (pathname.startsWith('/chapter/') && pathname.endsWith('/quiz')) return { title: 'Quiz Mode', sub: 'Timed quiz session' };
  if (pathname.startsWith('/chapter/') && pathname.endsWith('/exam')) return { title: 'Exam Mode', sub: 'Full exam session' };
  if (pathname.startsWith('/chapter/')) return { title: 'Chapter', sub: 'Study content' };
  return { title: 'CA Aspire BD', sub: 'ICAB Prep Platform' };
}

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { title, sub } = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen bg-animated-navy">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <div className="lg:ml-60 min-h-screen flex flex-col">

        {/* Top utility bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/[0.05]"
          style={{ background: 'rgba(2,8,24,0.85)', backdropFilter: 'blur(20px)' }}>

          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] transition-colors">
              <Menu className="w-4 h-4 text-white/60" />
            </button>

            {/* Page title */}
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-white leading-none">{title}</h2>
              <p className="text-[11px] text-white/35 mt-0.5 leading-none">{sub}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.07]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-white/30 capitalize leading-none mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
