import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubjectDetail from './pages/SubjectDetail';
import ChapterDetail from './pages/ChapterDetail';
import PracticeMode from './pages/PracticeMode';
import QuizMode from './pages/QuizMode';
import ExamMode from './pages/ExamMode';
import SessionHistory from './pages/SessionHistory';
import AdminDashboard from './pages/AdminDashboard';
import AdminNotifications from './pages/AdminNotifications';
import AdminSubjects from './pages/AdminSubjects';
import AdminMCQ from './pages/AdminMCQ';
import AdminLogin from './pages/AdminLogin';
import AdminExams from './pages/AdminExams';
import StudentExams from './pages/StudentExams';
import AdminStudents from './pages/AdminStudents';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminCompletions from './pages/AdminCompletions';
import StudentProgress from './pages/StudentProgress';
import Leaderboard from './pages/Leaderboard';

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#020818' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-gold-500 border-l-transparent border-b-transparent animate-spin" />
      </div>
      <span className="text-sm text-white/40 font-medium tracking-widest uppercase">Loading</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to={adminOnly ? '/admin-login' : '/login'} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <div className="min-h-screen bg-animated-navy">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Login />} />
        <Route path="/admin-login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <AdminLogin />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Student routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/subject/:id" element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
        <Route path="/chapter/:id" element={<ProtectedRoute><ChapterDetail /></ProtectedRoute>} />
        <Route path="/chapter/:id/practice" element={<ProtectedRoute><PracticeMode /></ProtectedRoute>} />
        <Route path="/chapter/:id/quiz" element={<ProtectedRoute><QuizMode /></ProtectedRoute>} />
        <Route path="/chapter/:id/exam" element={<ProtectedRoute><ExamMode /></ProtectedRoute>} />
        <Route path="/chapter/:id/results" element={<ProtectedRoute><SessionHistory /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute adminOnly><AdminSubjects /></ProtectedRoute>} />
        <Route path="/admin/mcqs" element={<ProtectedRoute adminOnly><AdminMCQ /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute adminOnly><AdminExams /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute adminOnly><AdminStudents /></ProtectedRoute>} />
        <Route path="/admin/enrollments" element={<ProtectedRoute adminOnly><AdminEnrollments /></ProtectedRoute>} />
        <Route path="/admin/completions" element={<ProtectedRoute adminOnly><AdminCompletions /></ProtectedRoute>} />

        {/* Student exam routes */}
        <Route path="/exams" element={<ProtectedRoute><StudentExams /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><StudentProgress /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" theme="dark" toastStyle={{ fontFamily: 'Inter, sans-serif' }} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
