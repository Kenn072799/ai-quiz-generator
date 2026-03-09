import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layout
import Layout from "./components/layout/Layout";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Protected pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import TopicsPage from "./pages/documents/TopicsPage";
import QuizGeneratePage from "./pages/quiz/QuizGeneratePage";
import QuizPage from "./pages/quiz/QuizPage";
import QuizResultsPage from "./pages/quiz/QuizResultsPage";
import QuizzesPage from "./pages/quiz/QuizzesPage";
import FlashcardsIndexPage from "./pages/flashcards/FlashcardsIndexPage";
import FlashcardsPage from "./pages/flashcards/FlashcardsPage";
import ProgressPage from "./pages/progress/ProgressPage";
import SettingsPage from "./pages/settings/SettingsPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

// Wraps page in ProtectedRoute + sidebar Layout
function AppPage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public auth routes ─────────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          }
        />

        {/* ── Protected routes (sidebar Layout) ─────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <AppPage>
              <DashboardPage />
            </AppPage>
          }
        />
        <Route
          path="/documents"
          element={
            <AppPage>
              <DocumentsPage />
            </AppPage>
          }
        />
        <Route
          path="/topics/:documentId"
          element={
            <AppPage>
              <TopicsPage />
            </AppPage>
          }
        />

        {/* Quiz */}
        <Route
          path="/quiz/generate/:topicId"
          element={
            <AppPage>
              <QuizGeneratePage />
            </AppPage>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <AppPage>
              <QuizPage />
            </AppPage>
          }
        />
        <Route
          path="/quiz/:quizId/results"
          element={
            <AppPage>
              <QuizResultsPage />
            </AppPage>
          }
        />
        <Route
          path="/quizzes"
          element={
            <AppPage>
              <QuizzesPage />
            </AppPage>
          }
        />

        {/* Flashcards */}
        <Route
          path="/flashcards"
          element={
            <AppPage>
              <FlashcardsIndexPage />
            </AppPage>
          }
        />
        <Route
          path="/flashcards/:topicId"
          element={
            <AppPage>
              <FlashcardsPage />
            </AppPage>
          }
        />

        {/* Progress */}
        <Route
          path="/progress"
          element={
            <AppPage>
              <ProgressPage />
            </AppPage>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <AppPage>
              <SettingsPage />
            </AppPage>
          }
        />

        {/* ── Defaults ───────────────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
