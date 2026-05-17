import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Lock, Play, ChevronRight } from 'lucide-react';
import api from '../api';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/subjects/${id}`),
      api.get(`/users/enrolled/${id}`).catch(() => ({ data: { enrolled: false } })),
    ]).then(([subRes, enrollRes]) => {
      setSubject(subRes.data);
      setEnrolled(enrollRes.data.enrolled);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/users/enroll/${id}`);
      setEnrolled(true);
    } finally { setEnrolling(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!subject) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-white/50">Subject not found</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 mb-8 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top right, ${subject.color}, transparent 60%)` }} />
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-start gap-5">
              <div className="text-5xl">{subject.icon}</div>
              <div>
                <h1 className="text-3xl font-black text-white mb-2">{subject.name}</h1>
                <p className="text-white/60 text-base max-w-xl">{subject.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{subject.chapters?.length || 0} chapters</span>
                  {subject.class_level && <span>Class {subject.class_level}</span>}
                </div>
              </div>
            </div>
            {!enrolled && (
              <button onClick={handleEnroll} disabled={enrolling} className="btn-primary py-3 px-6 glow-blue">
                {enrolling ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Enroll Now'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Chapters */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
          {(subject.chapters || []).map((ch, i) => (
            <motion.div key={ch.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              {enrolled || ch.is_preview ? (
                <Link to={`/chapter/${ch.id}`} className="flex items-center gap-4 glass rounded-2xl p-5 hover:bg-white/10 transition-all duration-200 group border border-white/5 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold group-hover:text-indigo-300 transition-colors truncate">{ch.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                      {ch.duration_minutes > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ch.duration_minutes} min</span>}
                      {ch.is_preview && <span className="text-green-400">Free Preview</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                </Link>
              ) : (
                <div className="flex items-center gap-4 glass rounded-2xl p-5 opacity-60 border border-white/5 cursor-not-allowed">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white/60 font-semibold truncate">{ch.title}</h3>
                    <p className="text-xs text-white/30 mt-1">Enroll to unlock</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {(!subject.chapters || subject.chapters.length === 0) && (
            <div className="text-center py-12 text-white/30">No chapters available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
