import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import {
  GraduationCap, LayoutDashboard, LogOut, Menu, X, ChevronDown,
  Trophy, Shield, Layers, Zap, FileText, HelpCircle, Sun, Moon
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { modules, loading: modulesLoading } = useModuleSettings();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isAdmin = user?.role === 'admin';
  const showModule = (key) => isAdmin || (!modulesLoading && modules[key]);

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    ...(showModule('classes')    ? [{ to: '/classes',       label: 'Classes'       }] : []),
    ...(showModule('flashcards') ? [{ to: '/flashcards',    label: 'Flash Cards'   }] : []),
    ...(showModule('shortnotes') ? [{ to: '/shortnotes',    label: 'Short Notes'   }] : []),
    ...(showModule('qbank')      ? [{ to: '/question-bank', label: 'Question Bank' }] : []),
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ] : [];

  const navBg = isDark
    ? scrolled ? 'bg-[#06112e]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl' : 'bg-transparent'
    : scrolled ? 'bg-white/90 backdrop-blur-2xl border-b border-violet-100/80 shadow-sm' : 'bg-transparent';

  const logoAccentBg = isDark ? 'border-[#06112e]' : 'border-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="w-[18px] h-[18px] text-white" />
              </div>
              <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 ${logoAccentBg}`} />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-[17px] font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-violet-950'}`}>CA Aspire BD</span>
              <span className="text-[9px] font-semibold text-amber-500 tracking-[0.12em] uppercase">ICAB Prep Platform</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? isDark
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/25'
                      : 'bg-violet-100 text-violet-700 border border-violet-200'
                    : isDark
                      ? 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                      : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`relative w-[52px] h-7 rounded-full transition-all duration-500 flex items-center px-1 ${
                isDark
                  ? 'bg-violet-900/60 border border-violet-500/30'
                  : 'bg-violet-100 border border-violet-200'
              }`}
              aria-label="Toggle theme">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                isDark
                  ? 'translate-x-[24px] bg-gradient-to-br from-violet-400 to-purple-600'
                  : 'translate-x-0 bg-white shadow-violet-200/60'
              }`}>
                {isDark
                  ? <Moon className="w-2.5 h-2.5 text-white" />
                  : <Sun className="w-2.5 h-2.5 text-amber-500" />}
              </div>
            </button>

            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2.5 border rounded-xl px-3 py-2 transition-all duration-200 ${
                      isDark
                        ? 'bg-white/[0.05] hover:bg-white/[0.09] border-white/[0.08]'
                        : 'bg-white hover:bg-violet-50 border-violet-100 shadow-sm'
                    }`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-semibold leading-tight max-w-[80px] truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name?.split(' ')[0]}</p>
                      <p className={`text-[10px] leading-tight capitalize ${isDark ? 'text-white/35' : 'text-slate-400'}`}>{user.role}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-white/35' : 'text-slate-400'} ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border py-2 z-50 overflow-hidden ${isDark ? 'glass-navy border-violet-500/15' : 'bg-white border-violet-100'}`}>
                      <div className={`px-4 py-3 mb-1 ${isDark ? 'border-b border-white/[0.06]' : 'border-b border-slate-100'}`}>
                        <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                        <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-white/35' : 'text-slate-400'}`}>{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-violet-500/10' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                          <Shield className="w-4 h-4 text-violet-400" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/dashboard" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {showModule('classes') && (
                        <Link to="/classes" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                          <Layers className="w-4 h-4 text-violet-400" /> Classes
                        </Link>
                      )}
                      {showModule('flashcards') && (
                        <Link to="/flashcards" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                          <Zap className="w-4 h-4 text-amber-400" /> Flash Cards
                        </Link>
                      )}
                      {showModule('shortnotes') && (
                        <Link to="/shortnotes" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                          <FileText className="w-4 h-4 text-emerald-400" /> Short Notes
                        </Link>
                      )}
                      {showModule('qbank') && (
                        <Link to="/question-bank" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                          <HelpCircle className="w-4 h-4 text-indigo-400" /> Question Bank
                        </Link>
                      )}
                      <Link to="/leaderboard" className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-white/55 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'}`}>
                        <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
                      </Link>
                      <div className={`mt-1 pt-1 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-100'}`}>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500/70 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className={`text-sm py-2.5 px-5 rounded-xl font-semibold transition-all duration-200 ${
                    isDark
                      ? 'text-white/70 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 border border-slate-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50'
                  }`}>Sign In</Link>
                <Link to="/register"
                  className="text-sm py-2.5 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-900/30 hover:shadow-violet-500/40 transition-all duration-300">
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-violet-100 border border-violet-200'}`}>
              {isDark ? <Moon className="w-4 h-4 text-violet-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-violet-100 border border-violet-200'}`}>
              {mobileOpen
                ? <X className={`w-5 h-5 ${isDark ? 'text-white/70' : 'text-slate-700'}`} />
                : <Menu className={`w-5 h-5 ${isDark ? 'text-white/70' : 'text-slate-700'}`} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={`md:hidden rounded-2xl mb-4 p-4 border shadow-xl ${isDark ? 'glass-navy border-violet-500/15' : 'bg-white border-violet-100'}`}>
            <div className="flex flex-col gap-1">
              <Link to="/" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-white/70 hover:bg-violet-500/10 hover:text-white' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}>Home</Link>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? isDark ? 'bg-violet-600/20 text-violet-300' : 'bg-violet-100 text-violet-700'
                      : isDark ? 'text-white/70 hover:bg-violet-500/10 hover:text-white' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className={`pt-2 mt-1 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-100'}`}>
                {user ? (
                  <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-50 text-left text-sm transition-colors">Sign Out</button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className={`flex-1 text-center px-4 py-2.5 rounded-xl text-sm transition-colors ${isDark ? 'text-white/70 hover:bg-white/[0.05]' : 'text-slate-700 hover:bg-slate-50 border border-slate-200'}`}>Sign In</Link>
                    <Link to="/register" className="flex-1 text-center text-sm py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600">Start Free</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
