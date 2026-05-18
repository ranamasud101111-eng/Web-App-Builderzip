import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Eye, EyeOff, Plus, Trash2, Save, ChevronRight,
  CheckCircle, Loader2, Link as LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const DEFAULT_FEATURES = [
  'All ICAB subjects unlocked',
  'Unlimited MCQ practice',
  'Full mock exam access',
  'Deep analytics & insights',
  'Wrong answer review',
  'Flash cards & short notes',
  'Priority support',
];

export default function AdminSubscription() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const [price, setPrice] = useState('499');
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    api.get('/settings/pricing')
      .then(r => {
        setPremiumVisible(r.data.premium_visible ?? false);
        setPrice(String(r.data.premium_price ?? 499));
        setFeatures(r.data.premium_features ?? DEFAULT_FEATURES);
      })
      .catch(() => toast.error('Failed to load pricing settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/pricing', {
        premium_visible: premiumVisible,
        premium_price: parseInt(price) || 499,
        premium_features: features,
      });
      toast.success('Pricing settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const f = newFeature.trim();
    if (f && !features.includes(f)) {
      setFeatures(prev => [...prev, f]);
      setNewFeature('');
    }
  };

  const removeFeature = (i) => setFeatures(prev => prev.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  );

  return (
    <div className="px-6 lg:px-8 pb-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/admin" className="text-white/35 hover:text-white text-sm transition-colors">Admin</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/20" />
          <span className="text-white text-sm font-semibold">Subscription Management</span>
        </div>
        <h1 className="text-3xl font-black text-white">Subscription Management</h1>
        <p className="text-white/35 text-sm mt-1">Control the premium plan visibility and pricing on the homepage.</p>
      </motion.div>

      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card-premium p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <h2 className="font-bold text-white">Premium Plan Visibility</h2>
              </div>
              <p className="text-white/40 text-sm">When hidden, only the Free Plan is shown on the pricing section of the homepage. All platform features remain accessible to students.</p>
            </div>
            <button
              onClick={() => setPremiumVisible(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 border ${
                premiumVisible
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-white/[0.05] text-white/50 border-white/[0.08] hover:bg-white/[0.08]'
              }`}>
              {premiumVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {premiumVisible ? 'Visible' : 'Hidden'}
            </button>
          </div>

          <div className="mt-5 p-4 rounded-xl border" style={{
            background: premiumVisible ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
            borderColor: premiumVisible ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
          }}>
            <div className="flex items-center gap-2 text-sm">
              {premiumVisible
                ? <><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 font-medium">Premium plan card is showing on the homepage</span></>
                : <><EyeOff className="w-4 h-4 text-white/30" /><span className="text-white/40">Premium plan card is hidden — only Free plan shows</span></>
              }
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-premium p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">৳</span> Premium Price
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">৳</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="input-field pl-9 w-full"
                placeholder="499"
              />
            </div>
            <span className="text-white/40 text-sm">/month</span>
          </div>
          <p className="text-white/30 text-xs mt-2">This price is displayed on the homepage premium plan card.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-premium p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-400" /> Premium Features
          </h2>
          <div className="space-y-2 mb-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="flex-1 text-white/80 text-sm">{f}</span>
                <button onClick={() => removeFeature(i)}
                  className="text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a feature..."
              value={newFeature}
              onChange={e => setNewFeature(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFeature()}
              className="input-field flex-1"
            />
            <button onClick={addFeature}
              className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/25 hover:bg-purple-600/30 transition-colors flex items-center gap-1.5 text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center justify-between p-5 card-premium">
          <div className="text-sm text-white/40">
            Changes will be reflected on the homepage immediately after saving.
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-lg shadow-purple-900/40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card-premium p-5">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4 text-white/40" />
            <h3 className="font-semibold text-white/70 text-sm">Preview</h3>
          </div>
          <p className="text-white/40 text-sm mb-3">View how the pricing section looks on the homepage.</p>
          <a href="/" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Open Homepage → Pricing Section
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
