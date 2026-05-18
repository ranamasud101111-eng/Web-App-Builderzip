import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import {
  GraduationCap, LayoutDashboard, BookOpen, Brain, FileText, Zap,
  Trophy, BarChart3, Bookmark, XCircle, Shuffle, HelpCircle, Layers,
  LogOut, Shield, Video, TrendingUp, Award, Settings, User,
  HeadphonesIcon, Target, Flame, ClipboardList, Activity, CreditCard
} from 'lucide-react';

const STUDENT_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/practice', icon: Brain, label: 'MCQ Practice' },
      { to: '/quiz', icon: Zap, label: 'Quick Quiz' },
      { to: '/exams', icon: Target, label: 'Mock Tests' },
      { to: '/custom-exam', icon: Shuffle, label: 'Custom Exam' },
    ],
  },
  {
    label: 'Subjects',
    items: [
      { to: '/dashboard', icon: BookOpen, label: 'My Subjects' },
    ],
  },
  {
    label: 'Learning',
    moduleItems: [
      { to: '/classes', icon: Video, label: 'Study Materials', moduleKey: 'classes' },
      { to: '/shortnotes', icon: FileText, label: 'Notes', moduleKey: 'shortnotes' },
      { to: '/flashcards', icon: ClipboardList, label: 'Flashcards', moduleKey: 'flashcards' },
      { to: '/question-bank', icon: HelpCircle, label: 'Question Bank', moduleKey: 'qbank' },
    ],
  },
  {
    label: 'Performance',
    items: [
      { to: '/progress', icon: TrendingUp, label: 'Analytics' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
      { to: '/wrong-answers', icon: XCircle, label: 'Wrong Answers' },
    ],
    moduleItems: [
      { to: '/progress-tracker', icon: Activity, label: 'Progress Tracker', moduleKey: 'progressTracker' },
    ],
  },
];

const ADMIN_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/admin/mcqs', icon: Brain, label: 'MCQs' },
      { to: '/admin/exams', icon: Target, label: 'Exams' },
      { to: '/admin/classes', icon: Video, label: 'Classes' },
      { to: '/admin/flashcards', icon: Zap, label: 'Flash Cards' },
      { to: '/admin/shortnotes', icon: FileText, label: 'Short Notes' },
      { to: '/admin/question-bank', icon: HelpCircle, label: 'Question Bank' },
    ],
  },
  {
    label: 'Students',
    items: [
      { to: '/admin/students', icon: User, label: 'Students' },
      { to: '/admin/enrollments', icon: Layers, label: 'Enrollments' },
      { to: '/admin/completions', icon: Award, label: 'Completions' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/notifications', icon: Flame, label: 'Notifications' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
      { to: '/admin/subscription', icon: CreditCard, label: 'Subscription' },
    ],
  },
];

function NavItem({ to, icon: Icon, label, onClick, isDark }) {
  const location = useLocation();
  const isActive = location.pathname === to ||
    (to !== '/dashboard' && to !== '/progress' && !to.includes('?') && location.pathname.startsWith(to));

  return (
    <Link to={to} onClick={onClick} className={`sidebar-item group relative ${isActive ? 'active' : ''}`}>
      <Icon className={`w-[16px] h-[16px] flex-shrink-0 transition-colors duration-200 ${
        isActive
          ? isDark ? 'text-violet-400' : 'text-white'
          : isDark
            ? 'text-white/30 group-hover:text-white/60'
            : 'text-slate-400 group-hover:text-violet-600'
      }`} />
      <span className={`text-[13px] font-semibold truncate transition-colors duration-200 ${
        isActive
          ? isDark ? 'text-violet-300' : 'text-white'
          : isDark
            ? 'text-white/45 group-hover:text-white/80'
            : 'text-slate-500 group-hover:text-violet-700'
      }`}>
        {label}
      </span>
      {isActive && isDark && (
        <motion.span layoutId="nav-pill"
          className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-gradient-to-b from-violet-400 to-purple-600" />
      )}
    </Link>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const { modules, loading: modulesLoading } = useModuleSettings();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const showModule = (key) => isAdmin || (!modulesLoading && modules[key]);

  const handleLogout = () => { logout(); navigate('/'); onMobileClose?.(); };

  const sections = isAdmin ? ADMIN_SECTIONS : STUDENT_SECTIONS;

  const brandTextColor = isDark ? 'text-white' : 'text-slate-800';
  const userNameColor = isDark ? 'text-white/90' : 'text-slate-700';
  const userRoleColor = isDark ? 'text-white/30' : 'text-slate-400';
  const sectionLabelColor = isDark ? 'rgba(255,255,255,0.18)' : '#94a3b8';
  const userCardBg = isDark ? 'rgba(124,58,237,0.07)' : 'rgba(124,58,237,0.05)';
  const userCardBorder = isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.12)';
  const signOutBorderColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.08)';

  const content = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand */}
      <div className="px-5 py-5 flex-shrink-0">
        <Link to="/" onClick={onMobileClose} className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/40 group-hover:shadow-violet-500/50 transition-all duration-300">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border-2"
              style={{ borderColor: isDark ? '#030a1a' : '#ffffff' }} />
          </div>
          <div>
            <p className={`text-[14px] font-bold leading-none tracking-tight ${brandTextColor}`}>CA Aspire BD</p>
            <p className="text-[9px] text-amber-500 font-bold tracking-[0.15em] uppercase mt-0.5">ICAB Prep Platform</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="px-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors duration-300"
          style={{ background: userCardBg, border: `1px solid ${userCardBorder}` }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0 shadow-md shadow-violet-900/40">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[12px] font-bold truncate leading-none ${userNameColor}`}>{user?.name?.split(' ')[0]}</p>
            <p className={`text-[10px] capitalize mt-0.5 leading-none font-medium ${userRoleColor}`}>{user?.role}</p>
          </div>
          {isAdmin && (
            <span className="text-[8px] font-black text-violet-400 bg-violet-500/15 border border-violet-500/25 rounded-full px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0">Admin</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4"
        style={{ scrollbarWidth: 'none' }}>
        {sections.map((section) => {
          const items = section.items || [];
          const moduleItems = (section.moduleItems || []).filter(m => showModule(m.moduleKey));
          const all = [...items, ...moduleItems];
          if (all.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="text-[9.5px] font-black uppercase tracking-[0.18em] px-3 mb-2 select-none"
                style={{ color: sectionLabelColor }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {all.map(item => <NavItem key={item.to} {...item} onClick={onMobileClose} isDark={isDark} />)}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 flex-shrink-0 transition-colors duration-300"
        style={{ borderTop: `1px solid ${signOutBorderColor}` }}>
        <button onClick={handleLogout}
          className="sidebar-item w-full text-left group"
          style={{ color: isDark ? 'rgba(248,113,113,0.6)' : 'rgba(220,38,38,0.7)' }}>
          <LogOut className="w-[15px] h-[15px] flex-shrink-0 transition-colors group-hover:text-red-500" style={{ color: 'inherit' }} />
          <span className="text-[13px] font-medium transition-colors group-hover:text-red-500" style={{ color: 'inherit' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar fixed left-0 top-0 bottom-0 w-[220px] z-40 hidden lg:flex flex-col">
        {content}
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose} />
            <motion.aside initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="sidebar fixed left-0 top-0 bottom-0 w-[220px] z-50 flex flex-col lg:hidden">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
