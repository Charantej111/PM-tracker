import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "./layouts/AppLayout";
import ToastViewport from "./components/ToastViewport";
import { useAppContext } from "./context/AppContext";
import { useAuth } from "./context/AuthContext";
import { lazy, Suspense } from "react";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DailyPlannerPage = lazy(() => import("./pages/DailyPlannerPage"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage"));
const SkillsPage = lazy(() => import("./pages/SkillsPage"));
const LearningHubPage = lazy(() => import("./pages/LearningHubPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const WeeklyReviewPage = lazy(() => import("./pages/WeeklyReviewPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const PortfolioGoalsPage = lazy(() => import("./pages/PortfolioGoalsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    }
  >
    {children}
  </Suspense>
);


const ProtectedRoute = ({ children }) => {
  const { user, loading, isRecoverySession } = useAuth();
  console.log("ProtectedRoute", {
    user,
    loading,
    isRecoverySession,
    pathname: window.location.pathname,
  });

  if (window.location.pathname === "/reset-password") {
    return children;
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" /></div>;
  // Recovery sessions are not real logins — send the user to reset their password.
  if (isRecoverySession) return <Navigate to="/reset-password" replace />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading, isRecoverySession } = useAuth();
  console.log("PublicOnlyRoute", {
    user,
    loading,
    isRecoverySession,
    pathname: window.location.pathname,
  });

  if (window.location.pathname === "/reset-password") {
    return children;
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" /></div>;
  // During password recovery the user has a session but must NOT be redirected
  // to the dashboard — they need to complete the reset flow first.
  if (isRecoverySession) return children;
  return user ? <Navigate to="/app/dashboard" replace /> : children;
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const { activeAchievementCelebration, dismissCelebration } = useAppContext();

  console.log("PATH:", window.location.pathname);
  console.log("HASH:", window.location.hash);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <SuspenseWrapper>
                  <LoginPage />
                </SuspenseWrapper>
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <SuspenseWrapper>
                  <RegisterPage />
                </SuspenseWrapper>
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <SuspenseWrapper>
                  <ForgotPasswordPage />
                </SuspenseWrapper>
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuspenseWrapper><DashboardPage /></SuspenseWrapper>} />
            <Route path="planner" element={<SuspenseWrapper><DailyPlannerPage /></SuspenseWrapper>} />
            <Route path="roadmap" element={<SuspenseWrapper><RoadmapPage /></SuspenseWrapper>} />
            <Route path="skills" element={<SuspenseWrapper><SkillsPage /></SuspenseWrapper>} />
            <Route path="learning" element={<SuspenseWrapper><LearningHubPage /></SuspenseWrapper>} />
            <Route path="projects" element={<SuspenseWrapper><ProjectsPage /></SuspenseWrapper>} />
            <Route path="weekly-review" element={<SuspenseWrapper><WeeklyReviewPage /></SuspenseWrapper>} />
            <Route path="notes" element={<SuspenseWrapper><NotesPage /></SuspenseWrapper>} />
            <Route path="resources" element={<SuspenseWrapper><ResourcesPage /></SuspenseWrapper>} />
            <Route path="portfolio-goals" element={<SuspenseWrapper><PortfolioGoalsPage /></SuspenseWrapper>} />
            <Route path="profile" element={<SuspenseWrapper><ProfilePage /></SuspenseWrapper>} />
            <Route path="settings" element={<SuspenseWrapper><SettingsPage /></SuspenseWrapper>} />
            <Route path="calendar" element={<SuspenseWrapper><CalendarPage /></SuspenseWrapper>} />
            <Route path="reports" element={<SuspenseWrapper><ReportsPage /></SuspenseWrapper>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <ToastViewport />

      <AnimatePresence>
        {activeAchievementCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-md overflow-hidden p-8 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-5xl shadow-lg">
                {activeAchievementCelebration.icon}
              </div>
              <h3 className="mt-6 text-2xl font-bold text-ink dark:text-white">
                Achievement Unlocked!
              </h3>
              <p className="mt-2 text-lg font-semibold text-accent">
                {activeAchievementCelebration.title}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {activeAchievementCelebration.desc}
              </p>
              <button
                type="button"
                onClick={dismissCelebration}
                className="mt-8 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent/95 shadow-md"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
