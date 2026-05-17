import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Medal, Users, Crown, TrendingUp, BookOpen, Star, Zap } from 'lucide-react';
import api from '../api';

const SkeletonRow = () => (
  <tr>
    <td><div className="shimmer w-8 h-8 rounded-xl" /></td>
    <td>
      <div className="flex items-center gap-3">
        <div className="shimmer w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="shimmer h-3 w-28 rounded" />
          <div className="shimmer h-2.5 w-20 rounded" />
        </div>
      </div>
    </td>
    <td className="hidden md:table-cell"><div className="shimmer h-3 w-16 rounded" /></td>
    <td className="hidden md:table-cell"><div className="shimmer h-3 w-8 rounded" /></td>
    <td><div className="shimmer h-3 w-10 rounded" /></td>
  </tr>
);

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(r => {
      setUsers(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-900', icon: <Crown className="w-3.5 h-3.5" />, glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' };
    if (rank === 2) return { bg: 'from-slate-400 to-slate-500', text: 'text-white', icon: <Medal className="w-3.5 h-3.5" />, glow: '' };
    if (rank === 3) return { bg: 'from-orange-500 to-orange-700', text: 'text-white', icon: <Medal className="w-3.5 h-3.5" />, glow: '' };
    return { bg: 'from-purple-900/80 to-purple-950', text: 'text-white/50', icon: null, glow: '' };
  };

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);
  const myRank = users.findIndex(u => u.id === user?.id) + 1;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-navy border border-gold-500/25 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
            <Trophy className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 text-sm font-bold tracking-wide">National Rankings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            CA Mock <span className="gradient-text-gold">Leaderboard</span>
          </h1>
          <p className="text-white/40 text-base">Rankings based on chapters completed. Keep studying to climb higher!</p>

          {myRank > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 glass-navy rounded-2xl px-6 py-3.5 border border-purple-500/20 mt-7 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-white/55 text-sm">Your rank: <span className="text-white font-black text-base">#{myRank}</span> of <span className="text-white/80 font-semibold">{users.length}</span> students</span>
            </motion.div>
          )}
        </motion.div>

        {/* Podium */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-10 items-end">
            {[1,0,2].map(i => (
              <div key={i} className={`text-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}>
                <div className={`shimmer ${i === 0 ? 'w-20 h-20' : 'w-16 h-16'} rounded-2xl mx-auto mb-3`} />
                <div className="shimmer h-3 w-24 mx-auto rounded mb-1.5" />
                <div className="shimmer h-2.5 w-16 mx-auto rounded mb-3" />
                <div className={`shimmer rounded-2xl w-full ${i === 0 ? 'h-28' : 'h-20'}`} />
              </div>
            ))}
          </div>
        ) : top3.length >= 1 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-10 items-end">

            {/* 2nd Place */}
            {top3[1] ? (
              <div className="text-center order-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg">
                  {top3[1].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-white/85 font-semibold text-sm truncate px-2">{top3[1].name}</p>
                <p className="text-white/35 text-xs mb-3">{top3[1].completed_chapters || 0} ch.</p>
                <div className="glass-navy rounded-2xl py-7 border border-white/[0.07] relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
                  <Medal className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                  <p className="text-slate-300 font-black text-xl">#2</p>
                </div>
              </div>
            ) : <div className="order-1" />}

            {/* 1st Place */}
            <div className="text-center order-2">
              <div className="relative inline-block mb-3">
                <div className="w-22 h-22 w-[88px] h-[88px] rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-amber-950 font-black text-2xl shadow-[0_0_32px_rgba(245,158,11,0.45)]">
                  {top3[0].name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
                  <Crown className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </div>
              </div>
              <p className="text-white font-bold text-sm truncate px-2">{top3[0].name}</p>
              <p className="text-amber-400 text-xs font-semibold mb-3">{top3[0].completed_chapters || 0} chapters</p>
              <div className="rounded-2xl py-9 border border-amber-500/20 relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))' }}>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <p className="gradient-text-gold font-black text-2xl">#1</p>
              </div>
            </div>

            {/* 3rd Place */}
            {top3[2] ? (
              <div className="text-center order-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg">
                  {top3[2].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-white/85 font-semibold text-sm truncate px-2">{top3[2].name}</p>
                <p className="text-white/35 text-xs mb-3">{top3[2].completed_chapters || 0} ch.</p>
                <div className="glass-navy rounded-2xl py-7 border border-white/[0.07] relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                  <Medal className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-orange-400 font-black text-xl">#3</p>
                </div>
              </div>
            ) : <div className="order-3" />}
          </motion.div>
        )}

        {/* Full ranking table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="card-premium rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white text-sm">All Students</h3>
            {!loading && <span className="badge-purple ml-auto">{users.length} students</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="w-16">Rank</th>
                  <th>Student</th>
                  <th className="hidden md:table-cell">Level</th>
                  <th className="hidden md:table-cell">Subjects</th>
                  <th>Chapters</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <Trophy className="w-10 h-10 text-white/10 mx-auto mb-3" />
                      <p className="text-white/25 text-sm">No students yet</p>
                    </td>
                  </tr>
                ) : users.map((u, i) => {
                  const rank = i + 1;
                  const isMe = u.id === user?.id;
                  const rStyle = getRankStyle(rank);
                  return (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className={isMe ? 'bg-purple-500/[0.07]' : ''}>
                      <td>
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${rStyle.bg} flex items-center justify-center ${rStyle.text} font-bold text-xs ${rStyle.glow}`}>
                          {rank <= 3 && rStyle.icon ? rStyle.icon : rank}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${isMe ? 'text-purple-300' : 'text-white/85'}`}>
                              {u.name}
                              {isMe && <span className="badge-purple ml-2 text-[10px]">You</span>}
                            </p>
                            <p className="text-white/28 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-white/38 text-sm">{u.class_level ? (isNaN(u.class_level) ? u.class_level : `Class ${u.class_level}`) : '—'}</span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-white/38 text-sm">{u.enrolled_count || 0}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400/70" />
                          <span className="font-bold text-white text-sm">{u.completed_chapters || 0}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
