import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, Circle, BookOpen } from 'lucide-react';
import api from '../api';

export default function ChapterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/chapters/${id}`).then(res => {
      setChapter(res.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const toggleComplete = async () => {
    setSaving(true);
    try {
      const newVal = !completed;
      await api.put(`/chapters/${id}/progress`, { completed: newVal });
      setCompleted(newVal);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-white/50">Chapter not found</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(`/subject/${chapter.subject_id}`)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Subject
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Subject badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
            style={{ background: `${chapter.subject_color}15`, color: chapter.subject_color, borderColor: `${chapter.subject_color}30` }}>
            <BookOpen className="w-3 h-3" /> {chapter.subject_name}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{chapter.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-white/40 mb-8">
            {chapter.duration_minutes > 0 && (
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{chapter.duration_minutes} min read</span>
            )}
          </div>

          {/* Video */}
          {chapter.video_url && (
            <div className="glass rounded-2xl overflow-hidden mb-8 aspect-video border border-white/10">
              <iframe src={chapter.video_url} className="w-full h-full" allowFullScreen title={chapter.title} />
            </div>
          )}

          {/* Content */}
          {chapter.content && (
            <div className="glass rounded-2xl p-8 mb-8 border border-white/10">
              <div className="prose prose-invert max-w-none">
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-base" style={{ lineHeight: '1.8' }}>
                  {chapter.content}
                </div>
              </div>
            </div>
          )}

          {/* Mark complete button */}
          <div className="flex justify-center">
            <button onClick={toggleComplete} disabled={saving}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                completed
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                  : 'btn-primary glow-blue'
              }`}>
              {saving ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : completed ? (
                <><CheckCircle className="w-5 h-5" /> Completed!</>
              ) : (
                <><Circle className="w-5 h-5" /> Mark as Complete</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
