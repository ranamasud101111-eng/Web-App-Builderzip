import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppLayout from './components/AppLayout';
import PageTransition from './components/PageTransition';
import { PageLoader } from './components/Skeleton';
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
import AdminClasses from './pages/AdminClasses';
import Classes from './pages/Classes';
import AdminFlashCards from './pages/AdminFlashCards';
import FlashCards from './pages/FlashCards';
import AdminShortNotes from './pages/AdminShortNotes';
import ShortNotes from './pages/ShortNotes';
import AdminQuestionBank from './pages/AdminQuestionBank';
import QuestionBank from './pages/QuestionBank';
import StudentProgress from './pages/StudentProgress';
import Leaderboard from './pages/Leaderboard';
import PracticeHub from './pages/PracticeHub';
import WrongAnswers from './pages/WrongAnswers';
import Bookmarks from './pages/Bookmarks';
import CustomExam from './pages/CustomExam';
import QuizHub from './pages/QuizHub';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProgressTracker from './pages/ProgressTracker';
import AdminSettings from './pages/AdminSettings';
import { ModuleSettingsProvider, useModuleSettings } from './context/ModuleSettingsContext';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={adminOnly ? '/admin-login' : '/login'} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const ModuleRoute = ({ moduleKey, children }) => {
  const { modules, loading } = useModuleSettings();
  const { user } = useAuth();
  if (loading) return <PageLoader />;
  if (user?.role === 'admin') return children;
  if (!modules[moduleKey]) return <Navigate to="/dashboard" replace />;
  return children;
};

const Wrap = ({ children }) => (
  <PageTransition>{children}</PageTransition>
);

const AuthWrap = ({ children }) => (
  <AppLayout><PageTransition>{children}</PageTransition></AppLayout>
);

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public pages — keep top navbar */}
          <Route path="/" element={<div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><Home /></Wrap></div>} />
          <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><Login /></Wrap></div>} />
          <Route path="/admin-login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><AdminLogin /></Wrap></div>} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><Register /></Wrap></div>} />
          <Route path="/verify-email" element={<div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><VerifyEmail /></Wrap></div>} />
          <Route path="/forgot-password" element={<div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><ForgotPassword /></Wrap></div>} />
          <Route path="/reset-password" element={<div className="min-h-screen bg-animated-navy"><Navbar /><Wrap><ResetPassword /></Wrap></div>} />

          {/* Authenticated pages — sidebar layout */}
          <Route path="/dashboard" element={<ProtectedRoute><AuthWrap><Dashboard /></AuthWrap></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><AuthWrap><Leaderboard /></AuthWrap></ProtectedRoute>} />
          <Route path="/subject/:id" element={<ProtectedRoute><AuthWrap><SubjectDetail /></AuthWrap></ProtectedRoute>} />
          <Route path="/chapter/:id" element={<ProtectedRoute><AuthWrap><ChapterDetail /></AuthWrap></ProtectedRoute>} />
          <Route path="/chapter/:id/practice" element={<ProtectedRoute><AuthWrap><PracticeMode /></AuthWrap></ProtectedRoute>} />
          <Route path="/chapter/:id/quiz" element={<ProtectedRoute><AuthWrap><QuizMode /></AuthWrap></ProtectedRoute>} />
          <Route path="/chapter/:id/exam" element={<ProtectedRoute><AuthWrap><ExamMode /></AuthWrap></ProtectedRoute>} />
          <Route path="/chapter/:id/results" element={<ProtectedRoute><AuthWrap><SessionHistory /></AuthWrap></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AuthWrap><AdminDashboard /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AuthWrap><AdminNotifications /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute adminOnly><AuthWrap><AdminSubjects /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/mcqs" element={<ProtectedRoute adminOnly><AuthWrap><AdminMCQ /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute adminOnly><AuthWrap><AdminExams /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute adminOnly><AuthWrap><AdminStudents /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/enrollments" element={<ProtectedRoute adminOnly><AuthWrap><AdminEnrollments /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/completions" element={<ProtectedRoute adminOnly><AuthWrap><AdminCompletions /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute adminOnly><AuthWrap><AdminClasses /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/flashcards" element={<ProtectedRoute adminOnly><AuthWrap><AdminFlashCards /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/shortnotes" element={<ProtectedRoute adminOnly><AuthWrap><AdminShortNotes /></AuthWrap></ProtectedRoute>} />
          <Route path="/admin/question-bank" element={<ProtectedRoute adminOnly><AuthWrap><AdminQuestionBank /></AuthWrap></ProtectedRoute>} />

          <Route path="/exams" element={<ProtectedRoute><AuthWrap><StudentExams /></AuthWrap></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><AuthWrap><StudentProgress /></AuthWrap></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><AuthWrap><PracticeHub /></AuthWrap></ProtectedRoute>} />
          <Route path="/wrong-answers" element={<ProtectedRoute><AuthWrap><WrongAnswers /></AuthWrap></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><AuthWrap><Bookmarks /></AuthWrap></ProtectedRoute>} />
          <Route path="/custom-exam" element={<ProtectedRoute><AuthWrap><CustomExam /></AuthWrap></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><AuthWrap><QuizHub /></AuthWrap></ProtectedRoute>} />
          <Route path="/progress-tracker" element={<ProtectedRoute><ModuleRoute moduleKey="progressTracker"><AuthWrap><ProgressTracker /></AuthWrap></ModuleRoute></ProtectedRoute>} />

          <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AuthWrap><AdminSettings /></AuthWrap></ProtectedRoute>} />

          <Route path="/classes" element={<ProtectedRoute><ModuleRoute moduleKey="classes"><AuthWrap><Classes /></AuthWrap></ModuleRoute></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><ModuleRoute moduleKey="flashcards"><AuthWrap><FlashCards /></AuthWrap></ModuleRoute></ProtectedRoute>} />
          <Route path="/shortnotes" element={<ProtectedRoute><ModuleRoute moduleKey="shortnotes"><AuthWrap><ShortNotes /></AuthWrap></ModuleRoute></ProtectedRoute>} />
          <Route path="/question-bank" element={<ProtectedRoute><ModuleRoute moduleKey="qbank"><AuthWrap><QuestionBank /></AuthWrap></ModuleRoute></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <ToastContainer
        position="top-right"
        theme="dark"
        toastStyle={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ModuleSettingsProvider>
            <AppRoutes />
          </ModuleSettingsProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
