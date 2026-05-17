import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { BookOpen, LayoutDashboard, LogOut, Settings, Menu, X, ChevronDown, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/10 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LearnHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors duration-200 ${location.pathname === '/' ? 'text-indigo-400' : 'text-white/70 hover:text-white'}`}>Home</Link>
            {user && (
              <Link to="/dashboard" className={`text-sm font-medium transition-colors duration-200 ${location.pathname === '/dashboard' ? 'text-indigo-400' : 'text-white/70 hover:text-white'}`}>Dashboard</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`text-sm font-medium transition-colors duration-200 ${location.pathname.startsWith('/admin') ? 'text-indigo-400' : 'text-white/70 hover:text-white'}`}>Admin</Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 glass rounded-xl px-3 py-2 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white/90 font-medium max-w-24 truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-white/50 text-xs truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white font-medium transition-colors px-4 py-2 rounded-xl hover:bg-white/5">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden glass p-2 rounded-xl">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass rounded-2xl mb-4 p-4 border border-white/10">
            <div className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">Home</Link>
              {user && <Link to="/dashboard" className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">Dashboard</Link>}
              {user?.role === 'admin' && <Link to="/admin" className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">Admin</Link>}
              {user ? (
                <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-red-400 hover:bg-white/5 text-left transition-colors">Sign Out</button>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors">Sign In</Link>
                  <Link to="/register" className="btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
