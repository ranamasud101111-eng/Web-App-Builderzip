import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Trophy, Zap, Star, Lock, ChevronRight, Play, BarChart3, Shield, Globe } from 'lucide-react';
import api from '../api';

const StatCounter = ({ end, label, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, started]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{prefix}{count.toLocaleString()}{suffix}</div>
      <div className="text-white/60 text-sm font-medium">{label}</div>
    </div>
  );
};

const FloatingShape = ({ size, color, top, left, delay = 0 }) => (
  <div
    className="shape"
    style={{
      width: size, height: size, top, left,
      background: color, animationDelay: `${delay}s`,
      opacity: 0.15
    }}
  />
);

const SubjectCard = ({ subject, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    viewport={{ once: true }}
    className="card-hover glass rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at top left, ${subject.color}20, transparent 70%)` }} />
    <div className="relative z-10">
      <div className="text-4xl mb-4">{subject.icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{subject.name}</h3>
      <p className="text-white/50 text-sm mb-4 line-clamp-2">{subject.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{subject.chapter_count || 0} chapters</span>
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: `${subject.color}20`, color: subject.color }}>
          {subject.class_level && `Class ${subject.class_level}`}
        </div>
      </div>
    </div>
  </motion.div>
);

const features = [
  { icon: <BookOpen className="w-6 h-6" />, title: 'Rich Content', desc: 'Chapter-based learning with detailed notes and video lessons', color: '#6366f1' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Track Progress', desc: 'Monitor your learning journey with detailed progress analytics', color: '#8b5cf6' },
  { icon: <Trophy className="w-6 h-6" />, title: 'Achievements', desc: 'Earn badges and certificates as you complete courses', color: '#f59e0b' },
  { icon: <Shield className="w-6 h-6" />, title: 'Admin Controls', desc: 'Powerful tools for educators to manage content and students', color: '#06b6d4' },
  { icon: <Zap className="w-6 h-6" />, title: 'Instant Notifications', desc: 'Stay updated with real-time announcements from your teachers', color: '#10b981' },
  { icon: <Globe className="w-6 h-6" />, title: 'Learn Anywhere', desc: 'Access your courses from any device, anytime, anywhere', color: '#f43f5e' },
];

export default function Home() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/subjects').then(res => setSubjects(res.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background shapes */}
        <FloatingShape size="500px" color="#6366f1" top="-10%" left="-5%" delay={0} />
        <FloatingShape size="400px" color="#8b5cf6" top="20%" left="70%" delay={2} />
        <FloatingShape size="300px" color="#06b6d4" top="60%" left="10%" delay={4} />
        <FloatingShape size="250px" color="#f59e0b" top="70%" left="80%" delay={1} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center py-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-8 border border-indigo-500/20">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Premium Online Learning Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6"
          >
            Learn Without
            <span className="block gradient-text">Limits</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Access world-class education with our premium learning platform. Master any subject with structured courses, expert content, and real-time progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base py-4 px-8">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 text-base py-4 px-8 glow-blue">
                  Start Learning Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="glass px-8 py-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" /> Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Hero decorative cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-md mx-auto"
          >
            {[
              { label: 'Students', value: '10K+', icon: '👩‍🎓' },
              { label: 'Subjects', value: '50+', icon: '📚' },
              { label: 'Lessons', value: '500+', icon: '🎯' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center border border-white/10">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-lg font-bold text-white">{item.value}</div>
                <div className="text-xs text-white/40">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCounter end={10000} label="Active Students" suffix="+" />
              <StatCounter end={50} label="Subjects" suffix="+" />
              <StatCounter end={500} label="Video Lessons" suffix="+" />
              <StatCounter end={98} label="Success Rate" suffix="%" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Our platform is packed with powerful features designed to accelerate your learning journey.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 card-hover group border border-white/5"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${f.color}20`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Subjects */}
      {subjects.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Featured <span className="gradient-text">Subjects</span></h2>
                <p className="text-white/50">Explore our most popular courses</p>
              </div>
              {user && (
                <Link to="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((s, i) => <SubjectCard key={s.id} subject={s} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Guest preview / CTA */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-3xl p-10 text-center border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
              <div className="relative z-10">
                <Lock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Unlock Full Access</h2>
                <p className="text-white/60 mb-8 text-lg">Sign up to access all subjects, chapters, video lessons, and track your learning progress.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn-primary text-base py-4 px-8 glow-purple flex items-center justify-center gap-2">
                    Create Free Account <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/login" className="glass px-8 py-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium">
                    Already have an account?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials placeholder */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-2">Loved by <span className="gradient-text">Students</span></h2>
            <p className="text-white/50">Thousands of students trust LearnHub for their education</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Ahmed', class: 'Class 10', text: 'LearnHub transformed how I study. The structured chapters make complex topics so easy to understand!', rating: 5 },
              { name: 'Rahul Sharma', class: 'Class 12', text: 'The notification system keeps me updated with all assignments. Best learning platform I\'ve used!', rating: 5 },
              { name: 'Fatima Khan', class: 'Class 9', text: 'The premium UI makes studying enjoyable. I actually look forward to opening my lessons every day.', rating: 5 },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="glass rounded-2xl p-6 border border-white/5">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-white/70 text-sm mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.class}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text text-lg">LearnHub</span>
            </div>
            <p className="text-white/30 text-sm">© 2024 LearnHub. Premium Online Learning Platform.</p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
