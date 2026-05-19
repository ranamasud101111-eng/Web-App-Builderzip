import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Save, RefreshCw,
  KeyRound, UserCircle, Shield, ArrowLeft, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const LEVELS = ['Certificate', 'Professional', 'Advanced'];

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: '', email: '', class_level: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        class_level: user.class_level || '',
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    if (!profile.name.trim()) return toast.error('Name is required');
    if (!profile.email.trim()) return toast.error('Email is required');
    setProfileSaving(true);
    try {
      const res = await api.put('/users/me/profile', {
        name: profile.name.trim(),
        email: profile.email.trim(),
        class_level: profile.class_level || null,
      });
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error('All fields are required');
    if (newPassword.length < 6)
      return toast.error('New password must be at least 6 characters');
    if (newPassword !== confirmPassword)
      return toast.error('Passwords do not match');
    setPwSaving(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const card = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-violet-100 shadow-sm';
  const inputBase = `w-full px-4 py-3 rounded-xl text-[13px] font-medium outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-violet-500/60'
      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-400'
  }`;
  const label = `block text-[11px] font-semibold mb-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`;
  const textPrimary = isDark ? 'text-white/90' : 'text-slate-800';
  const textMuted = isDark ? 'text-white/40' : 'text-slate-400';

  const tabs = [
    { key: 'profile', label: 'Profile Info', icon: UserCircle },
    { key: 'password', label: 'Change Password', icon: Shield },
  ];

  return (
    <div className="px-4 pb-16 max-w-2xl mx-auto">
      <button onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 mb-8 text-sm group transition-colors"
        style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.15)' }}>
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-black ${textPrimary}`}>Account Settings</h1>
            <p className={`text-sm ${textMuted}`}>Manage your profile and security</p>
          </div>
        </div>
      </motion.div>

      {/* Avatar display */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`${card} rounded-2xl p-5 mb-6 flex items-center gap-4`}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-md shadow-violet-900/40">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={`font-bold text-base ${textPrimary}`}>{user?.name}</p>
          <p className={`text-sm ${textMuted}`}>{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-violet-400 bg-violet-500/15 border border-violet-500/25 rounded-full px-2 py-0.5 uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" /> {user?.role}
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-violet-600 text-white shadow-md'
                : isDark
                  ? 'bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.07]'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`${card} rounded-2xl p-6 space-y-4`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)' }}>
              <UserCircle className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className={`text-[15px] font-bold ${textPrimary}`}>Profile Information</h2>
              <p className={`text-[11px] ${textMuted}`}>Update your name, email and level</p>
            </div>
          </div>

          <div>
            <label className={label}>Full Name</label>
            <div className="relative">
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/25' : 'text-slate-400'}`} />
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className={inputBase + ' pl-10'}
              />
            </div>
          </div>

          <div>
            <label className={label}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/25' : 'text-slate-400'}`} />
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                className={inputBase + ' pl-10'}
              />
            </div>
          </div>

          <div>
            <label className={label}>CA Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['', ...LEVELS].map(l => (
                <button key={l} onClick={() => setProfile(p => ({ ...p, class_level: l }))}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                    profile.class_level === l
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}>
                  {l || 'Not Set'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleProfileSave} disabled={profileSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            {profileSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </motion.div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`${card} rounded-2xl p-6 space-y-4`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)' }}>
              <KeyRound className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className={`text-[15px] font-bold ${textPrimary}`}>Change Password</h2>
              <p className={`text-[11px] ${textMuted}`}>Must be at least 6 characters</p>
            </div>
          </div>

          {[
            { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
            { key: 'newPassword', label: 'New Password', showKey: 'newPw' },
            { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' },
          ].map(({ key, label: lbl, showKey }) => (
            <div key={key}>
              <label className={label}>{lbl}</label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/25' : 'text-slate-400'}`} />
                <input
                  type={showPw[showKey] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={`Enter ${lbl.toLowerCase()}`}
                  className={inputBase + ' pl-10 pr-11'}
                />
                <button type="button"
                  onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30 hover:text-violet-400' : 'text-slate-400 hover:text-violet-500'} transition-colors`}>
                  {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <button onClick={handlePasswordChange} disabled={pwSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            {pwSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
