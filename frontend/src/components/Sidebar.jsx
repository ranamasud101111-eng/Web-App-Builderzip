import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import {
  GraduationCap, LayoutDashboard, BookOpen, Brain, FileText, Zap,
  Trophy, BarChart3, Bookmark, XCircle, Shuffle, HelpCircle, Layers,
  Settings, HelpCircle as Help, LogOut, Shield, ChevronLeft, Menu,
  Flame, Star, Video
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Learning',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/practice', icon: Brain, label: 'MCQ Practice' },
      { to: '/exams', icon: FileText, label: 'Mock Tests' },
      { to: '/progress', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Study Tools',
    items: [
      { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
      { to: '/wrong-answers', icon: XCircle, label: 'Wrong Answers' },
      { to: '/custom-exam', icon: Shuffle, label: 'Custom Exam' },
    ],
  },
  {
    label: 'Modules',
    moduleItems: [
      { to: '/classes', icon: Video, label: 'Video Classes', moduleKey: 'classes' },
      { to: '/shortnotes', icon: FileText, label: 'Short Notes', moduleKey: 'shortnotes' },
      { to: '/flashcards', icon: Zap, label: 'Flash Cards', moduleKey: 'flashcards' },
      { to: '/question-bank', icon: HelpCircle, label: 'Question Bank', moduleKey: 'qbank' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
  },
];

const ADMIN_GROUP = {
  label: 'Admin Panel',
  items: [
    { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { to: '/admin/subjects', icon: BookOpen, label: 'Manage Subjects' },
    { to: '/admin/mcqs', icon: Brain, label: 'Manage MCQs' },
    { to: '/admin/exams', icon: FileText, label: 'Manage Exams' },
    { to: '/admin/students', icon: Layers, label: 'Students' },
    { to: '/admin/classes', icon: Video, label: 'Classes' },
    { to: '/admin/flashcards', icon: Zap, label: 'Flash Cards' },
    { to: '/admin/shortnotes', icon: FileText, label: 'Short Notes' },
    { to: '/admin/question-bank', icon: HelpCircle, label: 'Question Bank' },
  ],
};

function NavItem({ to, icon: Icon, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <Link to={to} onClick={onClick}
      className={`sidebar-item group ${isActive ? 'active' : ''}`}>
      <Icon className={`w-[17px] h-[17px] flex-shrink-0 sidebar-icon transition-colors ${isActive ? 'text-purple-400' : 'text-white/35 group-hover:text-white/70'}`} />
      <span className="text-sm font-medium truncate">{label}</span>
      {isActive && (
        <motion.div layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-purple-400 to-violet-600 rounded-r-full" />
      )}
    </Link>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const { modules, loading: modulesLoading } = useModuleSettings();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
    onMobileClose?.();
  };

  const showModule = (key) => isAdmin || (!modulesLoading && modules[key]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.05]">
        <Link to="/" className="flex items-center gap-3 group" onClick={onMobileClose}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/40 transition-all duration-300">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#04081c]"></div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-white">CA Aspire BD</span>
            <span className="text-[9px] font-bold text-amber-400 tracking-[0.14em] uppercase mt-0.5">ICAB Prep Platform</span>
          </div>
        </Link>
      </div>

      {/* User quick-info */}
      <div className="px-4 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{user?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-white/35 capitalize font-medium">{user?.role}</p>
          </div>
          {isAdmin && (
            <span className="flex-shrink-0 text-[9px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/25 rounded-full px-2 py-0.5 uppercase tracking-wide">Admin</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Student nav groups */}
        {!isAdmin && NAV_GROUPS.map((group) => {
          const items = group.items || [];
          const moduleItems = (group.moduleItems || []).filter(m => showModule(m.moduleKey));
          const allItems = [...items, ...moduleItems];
          if (allItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.14em] px-3 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {allItems.map(item => (
                  <NavItem key={item.to} {...item} onClick={onMobileClose} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Admin nav */}
        {isAdmin && (
          <>
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.14em] px-3 mb-1.5">Learning</p>
              <div className="space-y-0.5">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onMobileClose} />
                <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" onClick={onMobileClose} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.14em] px-3 mb-1.5">Admin Panel</p>
              <div className="space-y-0.5">
                {ADMIN_GROUP.items.map(item => (
                  <NavItem key={item.to} {...item} onClick={onMobileClose} />
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/[0.05] space-y-0.5">
        <button onClick={handleLogout}
          className="sidebar-item w-full text-left text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.07] group">
          <LogOut className="w-[17px] h-[17px] flex-shrink-0 text-red-400/50 group-hover:text-red-400 transition-colors" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar fixed left-0 top-0 bottom-0 w-60 z-40 hidden lg:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="sidebar fixed left-0 top-0 bottom-0 w-60 z-50 flex flex-col lg:hidden">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
