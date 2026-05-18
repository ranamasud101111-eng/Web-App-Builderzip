import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Activity, Layers, BookOpen, Brain, Target, Zap,
  CheckCircle2, Save, RefreshCw, Lock, Eye, EyeOff, KeyRound
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { useModuleSettings } from '../context/ModuleSettingsContext';
import { toast } from 'react-toastify';

function Card({ children, className = '' }) {
  const { isDark } = useTheme();
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.1)'}`,
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ background: checked ? '#7c3aed' : 'rgba(255,255,255,0.12)' }}
    >
      <motion.span
        animate={{ x: checked ? 22 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="inline-block w-4.5 h-4.5 bg-white rounded-full shadow-md"
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, sub, checked, onChange, color = '#7c3aed', disabled, indent }) {
  const { isDark } = useTheme();
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${indent ? 'pl-8' : ''}`}
      style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.07)'}` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <p className={`text-[13px] font-semibold ${isDark ? 'text-white/85' : 'text-slate-700'}`}>{label}</p>
          {sub && <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/35' : 'text-slate-400'}`}>{sub}</p>}
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function AdminSettings() {
  const { isDark } = useTheme();
  const { refresh } = useModuleSettings();

  const [settings, setSettings] = useState({
    progress_tracker_visible: true,
    show_level_progress: true,
    show_subject_progress: true,
    show_chapter_progress: true,
    show_mcq_progress: true,
    show_exam_progress: true,
    show_quiz_progress: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  useEffect(() => {
    api.get('/settings/modules')
      .then(r => {
        const d = r.data;
        setSettings({
          progress_tracker_visible: d.progressTracker ?? true,
          show_level_progress: d.progressSections?.levelProgress ?? true,
          show_subject_progress: d.progressSections?.subjectProgress ?? true,
          show_chapter_progress: d.progressSections?.chapterProgress ?? true,
          show_mcq_progress: d.progressSections?.mcqProgress ?? true,
          show_exam_progress: d.progressSections?.examProgress ?? true,
          show_quiz_progress: d.progressSections?.quizProgress ?? true,
        });
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All fields are required');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New password and confirmation do not match');
    }
    setPwSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword });
      toast.success('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/progress-tracker', settings);
      await refresh();
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const textMuted = isDark ? 'text-white/40' : 'text-slate-400';
  const trackerEnabled = settings.progress_tracker_visible;

  if (loading) {
    return (
      <div className="px-5 md:px-8 max-w-3xl mx-auto space-y-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl h-64 animate-pulse"
            style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }} />
        ))}
      </div>
    );
  }

  const inputBase = `w-full px-4 py-3 rounded-xl text-[13px] font-medium outline-none transition-all pr-11 ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-violet-500/60'
      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-400'
  }`;

  return (
    <div className="px-5 md:px-8 max-w-3xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className={`text-[12px] font-semibold ${textMuted}`}>Control what students can see</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <KeyRound className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className={`text-[15px] font-bold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>Change Password</h2>
              <p className={`text-[11px] ${textMuted}`}>Update your admin account password</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
              { key: 'newPassword',     label: 'New Password',     showKey: 'newPw'   },
              { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' },
            ].map(({ key, label, showKey }) => (
              <div key={key}>
                <label className={`block text-[11px] font-semibold mb-1.5 ${textMuted}`}>{label}</label>
                <div className="relative">
                  <input
                    type={showPw[showKey] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:text-violet-400 transition-colors`}
                  >
                    {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
          >
            {pwSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </Card>
      </motion.div>

      {/* Progress Tracker Module */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Activity className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className={`text-[15px] font-bold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>Progress Tracker</h2>
              <p className={`text-[11px] ${textMuted}`}>Full learning analytics for students</p>
            </div>
          </div>

          <SettingRow
            icon={Activity}
            label="Show Progress Tracker"
            sub="Enable or disable the Progress Tracker menu for all students"
            checked={trackerEnabled}
            onChange={v => set('progress_tracker_visible', v)}
            color="#7c3aed"
          />

          <div className="mt-1">
            <p className={`text-[11px] font-bold uppercase tracking-widest px-1 py-3 ${textMuted}`}>Section Visibility</p>

            <SettingRow
              icon={Layers}
              label="Level Progress"
              sub="Certificate / Professional / Advanced completion"
              checked={settings.show_level_progress}
              onChange={v => set('show_level_progress', v)}
              color="#8b5cf6"
              disabled={!trackerEnabled}
              indent
            />
            <SettingRow
              icon={BookOpen}
              label="Subject Progress"
              sub="Enrolled and completed subjects"
              checked={settings.show_subject_progress}
              onChange={v => set('show_subject_progress', v)}
              color="#06b6d4"
              disabled={!trackerEnabled}
              indent
            />
            <SettingRow
              icon={BookOpen}
              label="Chapter Progress"
              sub="Chapter-wise completion with progress bars"
              checked={settings.show_chapter_progress}
              onChange={v => set('show_chapter_progress', v)}
              color="#22c55e"
              disabled={!trackerEnabled}
              indent
            />
            <SettingRow
              icon={Brain}
              label="MCQ Progress"
              sub="Accuracy, correct/wrong counts, time spent"
              checked={settings.show_mcq_progress}
              onChange={v => set('show_mcq_progress', v)}
              color="#8b5cf6"
              disabled={!trackerEnabled}
              indent
            />
            <SettingRow
              icon={Target}
              label="Exam Progress"
              sub="Mock & custom exam scores and best results"
              checked={settings.show_exam_progress}
              onChange={v => set('show_exam_progress', v)}
              color="#f59e0b"
              disabled={!trackerEnabled}
              indent
            />
            <SettingRow
              icon={Zap}
              label="Quiz Progress"
              sub="Quiz attempts, scores, and performance chart"
              checked={settings.show_quiz_progress}
              onChange={v => set('show_quiz_progress', v)}
              color="#06b6d4"
              disabled={!trackerEnabled}
              indent
            />
          </div>
        </Card>
      </motion.div>

      {/* Status summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h3 className={`text-[13px] font-bold mb-4 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Current Status Summary</h3>
          <div className="space-y-2">
            {[
              { label: 'Progress Tracker', val: trackerEnabled },
              { label: 'Level Progress section', val: settings.show_level_progress && trackerEnabled },
              { label: 'Subject Progress section', val: settings.show_subject_progress && trackerEnabled },
              { label: 'Chapter Progress section', val: settings.show_chapter_progress && trackerEnabled },
              { label: 'MCQ Progress section', val: settings.show_mcq_progress && trackerEnabled },
              { label: 'Exam Progress section', val: settings.show_exam_progress && trackerEnabled },
              { label: 'Quiz Progress section', val: settings.show_quiz_progress && trackerEnabled },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <p className={`text-[12px] font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{item.label}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.val ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {item.val ? 'Visible' : 'Hidden'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
