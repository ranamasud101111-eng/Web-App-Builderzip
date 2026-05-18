import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Lock, ChevronRight, CheckCircle, Play, FileText, Users } from 'lucide-react';
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
    ]).then(([sRes, eRes]) => {
      setSubject(sRes.data);
      setEnrolled(eRes.data.enrolled);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try { await api.post(`/users/enroll/${id}`); setEnrolled(true); }
    finally { setEnrolling(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  if (!subject) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-white/35">Subject not found</p>
    </div>
  );

  return (
    <div className="pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ background: `radial-gradient(circle at top right, ${subject.color || '#7c3aed'}, transparent 60%)` }} />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-gold-500 opacity-70" />
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-start gap-5">
              <div className="text-5xl">{subject.icon}</div>
              <div>
                <h1 className="text-3xl font-black text-white mb-2">{subject.name}</h1>
                <p className="text-white/45 mb-4 max-w-xl">{subject.description}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-white/35">
                    <FileText className="w-4 h-4" /> {subject.chapters?.length || 0} chapters
                  </span>
                  {subject.class_level && (
                    <span className="badge-gold">{isNaN(subject.class_level) ? subject.class_level : `Class ${subject.class_level}`}</span>
                  )}
                  {enrolled && <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Enrolled</span>}
                </div>
              </div>
            </div>
            {!enrolled && (
              <button onClick={handleEnroll} disabled={enrolling}
                className="btn-gold flex items-center gap-2 py-3 px-7 font-bold disabled:opacity-50 flex-shrink-0">
                {enrolling ? <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> : 'Enroll Now'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Chapter list */}
        <div>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Course Content
          </h2>
          <div className="flex flex-col gap-3">
            {(subject.chapters || []).map((ch, i) => (
              <motion.div key={ch.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                {(enrolled || ch.is_preview) ? (
                  <Link to={`/chapter/${ch.id}`}
                    className="flex items-center gap-4 card-premium p-5 group hover:border-purple-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-700 to-violet-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors truncate">{ch.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {ch.duration_minutes > 0 && (
                          <span className="flex items-center gap-1 text-xs text-white/30">
                            <Clock className="w-3 h-3" /> {ch.duration_minutes} min
                          </span>
                        )}
                        {ch.is_preview && <span className="text-xs text-emerald-400 font-medium">Free Preview</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 card-premium p-5 opacity-50 cursor-not-allowed">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white/50 font-semibold text-sm truncate">{ch.title}</h3>
                      <p className="text-xs text-white/25 mt-0.5">Enroll to access this chapter</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {(!subject.chapters || subject.chapters.length === 0) && (
              <div className="text-center py-14 text-white/25 text-sm">No chapters available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
