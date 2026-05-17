import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Clock, Trophy, Target, CheckCircle,
  ArrowLeft, Play, BookOpen, FileText, ChevronRight, Loader2
} from 'lucide-react';
import api from '../api';

const DIFF_COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#f43f5e', mixed: '#7c3aed' };

export default function StudentExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/exams')
      .then(r => setExams(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subjects = [...new Set(exams.map(e => e.subject_name).filter(Boolean))];
  const filtered = filter === 'all' ? exams : exams.filter(e => e.subject_name === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Mock Exams</h1>
              <p className="text-white/35 text-sm">Timed practice exams — test your knowledge under real exam conditions</p>
            </div>
          </div>
        </motion.div>

        {/* Filter tabs */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {['all', ...subjects].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === s
                    ? 'bg-gradient-to-r from-purple-700 to-violet-800 text-white shadow-glow-purple'
                    : 'glass-card text-white/50 hover:text-white'
                }`}>
                {s === 'all' ? `All Exams (${exams.length})` : s}
              </button>
            ))}
          </div>
        )}

        {/* Exams grid */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card-premium rounded-3xl text-center py-24">
            <GraduationCap className="w-14 h-14 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No exams available</h3>
            <p className="text-white/35 text-sm">Check back soon — your teachers are preparing exams for you.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((exam, i) => {
              const diffColor = DIFF_COLORS[exam.difficulty] || '#7c3aed';
              const canStart = !!exam.chapter_id;
              return (
                <motion.div key={exam.id}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="card-premium p-6 flex flex-col gap-4 group hover:border-purple-500/30 transition-all duration-200">

                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ background: `${diffColor}15`, color: diffColor, borderColor: `${diffColor}30` }}>
                          {exam.difficulty || 'mixed'}
                        </span>
                        {exam.subject_name && (
                          <span className="flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.05] px-2 py-0.5 rounded-full">
                            <span>{exam.subject_icon}</span> {exam.subject_name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{exam.title}</h3>
                      {exam.description && (
                        <p className="text-white/35 text-xs mt-1 line-clamp-2">{exam.description}</p>
                      )}
                      {exam.chapter_title && (
                        <p className="flex items-center gap-1 text-xs text-white/30 mt-1.5">
                          <FileText className="w-3 h-3" /> {exam.chapter_title}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: `${diffColor}12`, border: `1px solid ${diffColor}25` }}>
                      <GraduationCap className="w-5 h-5" style={{ color: diffColor }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: <Clock className="w-3.5 h-3.5" />, value: `${exam.duration_minutes}m`, label: 'Duration' },
                      { icon: <Target className="w-3.5 h-3.5" />, value: exam.question_count, label: 'Questions' },
                      { icon: <Trophy className="w-3.5 h-3.5" />, value: exam.total_marks, label: 'Marks' },
                      { icon: <CheckCircle className="w-3.5 h-3.5" />, value: exam.passing_marks, label: 'Pass' },
                    ].map((s, j) => (
                      <div key={j} className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center justify-center gap-1 text-white/50 mb-0.5">{s.icon}</div>
                        <div className="text-white font-bold text-sm">{s.value}</div>
                        <div className="text-white/25 text-[10px]">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {canStart ? (
                    <Link to={`/chapter/${exam.chapter_id}/exam`}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                      style={{ background: `linear-gradient(135deg, ${diffColor}cc, ${diffColor}99)` }}>
                      <Play className="w-4 h-4" />
                      Start Exam
                    </Link>
                  ) : exam.subject_id ? (
                    <Link to={`/subject/${exam.subject_id}`}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white transition-all border border-white/10">
                      <BookOpen className="w-4 h-4" />
                      View Subject
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white/25 border border-white/[0.06] cursor-not-allowed">
                      Coming Soon
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
