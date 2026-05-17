import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Medal, Users, Crown, TrendingUp, BookOpen } from 'lucide-react';
import api from '../api';

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
    if (rank === 1) return { bg: 'from-gold-600 to-gold-400', text: 'text-navy-950', icon: <Crown className="w-4 h-4" /> };
    if (rank === 2) return { bg: 'from-slate-500 to-slate-400', text: 'text-white', icon: <Medal className="w-4 h-4" /> };
    if (rank === 3) return { bg: 'from-orange-700 to-orange-500', text: 'text-white', icon: <Medal className="w-4 h-4" /> };
    return { bg: 'from-purple-900 to-purple-800', text: 'text-white/60', icon: null };
  };

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);
  const myRank = users.findIndex(u => u.id === user?.id) + 1;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-navy border border-gold-500/20 mb-6">
            <Trophy className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 text-sm font-semibold">National Rankings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            CA Mock <span className="gradient-text-gold">Leaderboard</span>
          </h1>
          <p className="text-white/40">Rankings based on chapters completed. Keep studying to climb higher!</p>

          {myRank > 0 && (
            <div className="inline-flex items-center gap-3 glass-navy rounded-2xl px-6 py-3 border border-purple-500/20 mt-6">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-sm">Your rank: <span className="text-white font-bold">#{myRank}</span> of {users.length} students</span>
            </div>
          )}
        </motion.div>

        {/* Top 3 Podium */}
        {top3.length >= 1 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8 items-end">
            {/* 2nd */}
            {top3[1] ? (
              <div className="text-center order-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-card">
                  {top3[1].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-semibold text-sm truncate px-2">{top3[1].name}</p>
                <p className="text-white/35 text-xs">{top3[1].completed_chapters || 0} chapters</p>
                <div className="glass-navy rounded-2xl py-6 mt-3 border border-white/[0.06]">
                  <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-slate-300 font-bold text-lg mt-1">#2</p>
                </div>
              </div>
            ) : <div className="order-1" />}

            {/* 1st */}
            <div className="text-center order-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-navy-950 font-black text-2xl mx-auto mb-3 shadow-glow-gold">
                  {top3[0].name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Crown className="w-6 h-6 text-gold-400 fill-gold-400" />
                </div>
              </div>
              <p className="text-white font-bold text-base truncate px-2">{top3[0].name}</p>
              <p className="text-gold-400 text-xs font-medium">{top3[0].completed_chapters || 0} chapters</p>
              <div className="glass-gold rounded-2xl py-8 mt-3 border border-gold-500/20">
                <Trophy className="w-6 h-6 text-gold-400 mx-auto" />
                <p className="text-gold-400 font-black text-xl mt-1">#1</p>
              </div>
            </div>

            {/* 3rd */}
            {top3[2] ? (
              <div className="text-center order-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-700 to-orange-500 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-card">
                  {top3[2].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-semibold text-sm truncate px-2">{top3[2].name}</p>
                <p className="text-white/35 text-xs">{top3[2].completed_chapters || 0} chapters</p>
                <div className="glass-navy rounded-2xl py-6 mt-3 border border-white/[0.06]">
                  <Medal className="w-5 h-5 text-orange-500 mx-auto" />
                  <p className="text-orange-400 font-bold text-lg mt-1">#3</p>
                </div>
              </div>
            ) : <div className="order-3" />}
          </motion.div>
        )}

        {/* Full table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="card-premium rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">All Students</h3>
            <span className="badge-purple ml-auto">{users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="w-16">Rank</th>
                  <th>Student</th>
                  <th className="hidden md:table-cell">Class</th>
                  <th className="hidden md:table-cell">Subjects</th>
                  <th>Chapters</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rank = i + 1;
                  const isMe = u.id === user?.id;
                  const rStyle = getRankStyle(rank);
                  return (
                    <tr key={u.id} className={isMe ? 'bg-purple-500/[0.06]' : ''}>
                      <td>
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${rStyle.bg} flex items-center justify-center ${rStyle.text} font-bold text-xs`}>
                          {rank <= 3 && rStyle.icon ? rStyle.icon : rank}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${isMe ? 'text-purple-300' : 'text-white/85'}`}>
                              {u.name} {isMe && <span className="badge-purple ml-1">You</span>}
                            </p>
                            <p className="text-white/30 text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-white/40 text-sm">{u.class_level ? (isNaN(u.class_level) ? u.class_level : `Class ${u.class_level}`) : '—'}</span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-white/40 text-sm">{u.enrolled_count || 0}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-semibold text-white text-sm">{u.completed_chapters || 0}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-14 text-white/25">No students yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
