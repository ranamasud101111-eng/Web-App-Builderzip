import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import NotificationBell from './NotificationBell';
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu, X, ChevronDown, Trophy, Shield, Layers, Zap, FileText, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { modules, loading: modulesLoading } = useModuleSettings();
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
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-navy-900/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                <BookOpen className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gold-500 border-2 border-navy-900"></div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[17px] font-bold tracking-tight text-white">CA Mock</span>
              <span className="text-[9px] font-semibold text-gold-500 tracking-[0.12em] uppercase">Premium Platform</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? 'bg-purple-600/20 text-purple-300 border border-purple-500/25' : 'text-white/55 hover:text-white hover:bg-white/[0.06]'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-xl px-3 py-2 transition-all duration-200">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white leading-tight max-w-[80px] truncate">{user.name?.split(' ')[0]}</p>
                      <p className="text-[10px] text-white/35 leading-tight capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/35 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-navy rounded-2xl shadow-premium border border-purple-500/15 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-white/35 text-xs truncate mt-0.5">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-purple-500/10 transition-colors">
                          <Shield className="w-4 h-4 text-purple-400" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {showModule('classes') && (
                        <Link to="/classes" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                          <Layers className="w-4 h-4 text-purple-400" /> Classes
                        </Link>
                      )}
                      {showModule('flashcards') && (
                        <Link to="/flashcards" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                          <Zap className="w-4 h-4 text-yellow-400" /> Flash Cards
                        </Link>
                      )}
                      {showModule('shortnotes') && (
                        <Link to="/shortnotes" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                          <FileText className="w-4 h-4 text-emerald-400" /> Short Notes
                        </Link>
                      )}
                      {showModule('qbank') && (
                        <Link to="/question-bank" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                          <HelpCircle className="w-4 h-4 text-indigo-400" /> Question Bank
                        </Link>
                      )}
                      <Link to="/leaderboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                        <Trophy className="w-4 h-4 text-gold-400" /> Leaderboard
                      </Link>
                      <div className="border-t border-white/[0.06] mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2.5 px-5">Sign In</Link>
                <Link to="/register" className="btn-gold text-sm py-2.5 px-5 font-semibold">Start Free</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden glass p-2.5 rounded-xl">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden glass-navy rounded-2xl mb-4 p-4 border border-purple-500/15 shadow-premium">
            <div className="flex flex-col gap-1">
              <Link to="/" className="px-4 py-2.5 rounded-xl text-white/70 hover:bg-purple-500/10 hover:text-white text-sm font-medium transition-colors">Home</Link>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-purple-600/20 text-purple-300' : 'text-white/70 hover:bg-purple-500/10 hover:text-white'}`}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.06] pt-2 mt-1">
                {user ? (
                  <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 text-left text-sm transition-colors">Sign Out</button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 text-center px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/[0.05] text-sm transition-colors">Sign In</Link>
                    <Link to="/register" className="flex-1 btn-gold text-center text-sm py-2.5">Start Free</Link>
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
