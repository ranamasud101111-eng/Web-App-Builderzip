import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, Circle, BookOpen, Play } from 'lucide-react';
import api from '../api';

export default function ChapterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/chapters/${id}`).then(r => {
      setChapter(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const toggleComplete = async () => {
    setSaving(true);
    try {
      const val = !completed;
      await api.put(`/chapters/${id}/progress`, { completed: val });
      setCompleted(val);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
    </div>
  );

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-white/35">Chapter not found</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(`/subject/${chapter.subject_id}`)}
          className="flex items-center gap-2 text-white/35 hover:text-white text-sm mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Subject
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Subject badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold mb-5 border"
            style={{
              background: `${chapter.subject_color || '#7c3aed'}12`,
              color: chapter.subject_color || '#a78bfa',
              borderColor: `${chapter.subject_color || '#7c3aed'}25`
            }}>
            <BookOpen className="w-3 h-3" /> {chapter.subject_name}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{chapter.title}</h1>

          <div className="flex items-center gap-4 text-sm text-white/35 mb-10 flex-wrap">
            {chapter.duration_minutes > 0 && (
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {chapter.duration_minutes} min read</span>
            )}
            {completed && <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle className="w-4 h-4" /> Completed</span>}
          </div>

          {/* Video */}
          {chapter.video_url && (
            <div className="card-premium rounded-2xl overflow-hidden mb-8 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe src={chapter.video_url} className="absolute inset-0 w-full h-full"
                allowFullScreen title={chapter.title} />
            </div>
          )}

          {/* Content */}
          {chapter.content && (
            <div className="card-premium rounded-2xl p-8 mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
              <div className="text-white/65 leading-[1.9] text-[15px] whitespace-pre-wrap font-[Inter]"
                style={{ fontVariantNumeric: 'normal' }}>
                {chapter.content}
              </div>
            </div>
          )}

          {!chapter.content && !chapter.video_url && (
            <div className="card-premium rounded-2xl p-16 text-center mb-10">
              <BookOpen className="w-12 h-12 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Content coming soon</p>
            </div>
          )}

          {/* Complete button */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={toggleComplete} disabled={saving}
              className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                completed
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                  : 'btn-primary glow-purple'
              } disabled:opacity-50`}>
              {saving
                ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : completed
                ? <><CheckCircle className="w-5 h-5" /> Completed — Mark Incomplete</>
                : <><Circle className="w-5 h-5" /> Mark as Complete</>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
