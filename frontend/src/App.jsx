import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
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
import VerifyEmail from './pages/VerifyEmail';
import { ModuleSettingsProvider, useModuleSettings } from './context/ModuleSettingsContext';

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

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-animated-navy">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Wrap><Home /></Wrap>} />
          <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Wrap><Login /></Wrap>} />
          <Route path="/admin-login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Wrap><AdminLogin /></Wrap>} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Wrap><Register /></Wrap>} />
          <Route path="/verify-email" element={<Wrap><VerifyEmail /></Wrap>} />

          <Route path="/dashboard" element={<ProtectedRoute><Wrap><Dashboard /></Wrap></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Wrap><Leaderboard /></Wrap></ProtectedRoute>} />
          <Route path="/subject/:id" element={<ProtectedRoute><Wrap><SubjectDetail /></Wrap></ProtectedRoute>} />
          <Route path="/chapter/:id" element={<ProtectedRoute><Wrap><ChapterDetail /></Wrap></ProtectedRoute>} />
          <Route path="/chapter/:id/practice" element={<ProtectedRoute><Wrap><PracticeMode /></Wrap></ProtectedRoute>} />
          <Route path="/chapter/:id/quiz" element={<ProtectedRoute><Wrap><QuizMode /></Wrap></ProtectedRoute>} />
          <Route path="/chapter/:id/exam" element={<ProtectedRoute><Wrap><ExamMode /></Wrap></ProtectedRoute>} />
          <Route path="/chapter/:id/results" element={<ProtectedRoute><Wrap><SessionHistory /></Wrap></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><Wrap><AdminDashboard /></Wrap></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><Wrap><AdminNotifications /></Wrap></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute adminOnly><Wrap><AdminSubjects /></Wrap></ProtectedRoute>} />
          <Route path="/admin/mcqs" element={<ProtectedRoute adminOnly><Wrap><AdminMCQ /></Wrap></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute adminOnly><Wrap><AdminExams /></Wrap></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute adminOnly><Wrap><AdminStudents /></Wrap></ProtectedRoute>} />
          <Route path="/admin/enrollments" element={<ProtectedRoute adminOnly><Wrap><AdminEnrollments /></Wrap></ProtectedRoute>} />
          <Route path="/admin/completions" element={<ProtectedRoute adminOnly><Wrap><AdminCompletions /></Wrap></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute adminOnly><Wrap><AdminClasses /></Wrap></ProtectedRoute>} />
          <Route path="/admin/flashcards" element={<ProtectedRoute adminOnly><Wrap><AdminFlashCards /></Wrap></ProtectedRoute>} />
          <Route path="/admin/shortnotes" element={<ProtectedRoute adminOnly><Wrap><AdminShortNotes /></Wrap></ProtectedRoute>} />
          <Route path="/admin/question-bank" element={<ProtectedRoute adminOnly><Wrap><AdminQuestionBank /></Wrap></ProtectedRoute>} />

          <Route path="/exams" element={<ProtectedRoute><Wrap><StudentExams /></Wrap></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Wrap><StudentProgress /></Wrap></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><Wrap><PracticeHub /></Wrap></ProtectedRoute>} />
          <Route path="/wrong-answers" element={<ProtectedRoute><Wrap><WrongAnswers /></Wrap></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Wrap><Bookmarks /></Wrap></ProtectedRoute>} />
          <Route path="/custom-exam" element={<ProtectedRoute><Wrap><CustomExam /></Wrap></ProtectedRoute>} />

          <Route path="/classes" element={<ProtectedRoute><ModuleRoute moduleKey="classes"><Wrap><Classes /></Wrap></ModuleRoute></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><ModuleRoute moduleKey="flashcards"><Wrap><FlashCards /></Wrap></ModuleRoute></ProtectedRoute>} />
          <Route path="/shortnotes" element={<ProtectedRoute><ModuleRoute moduleKey="shortnotes"><Wrap><ShortNotes /></Wrap></ModuleRoute></ProtectedRoute>} />
          <Route path="/question-bank" element={<ProtectedRoute><ModuleRoute moduleKey="qbank"><Wrap><QuestionBank /></Wrap></ModuleRoute></ProtectedRoute>} />

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
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ModuleSettingsProvider>
          <AppRoutes />
        </ModuleSettingsProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
