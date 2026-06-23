import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "./layouts/AppLayout";
import ToastViewport from "./components/ToastViewport";
import { useAppContext } from "./context/AppContext";
import DashboardPage from "./pages/DashboardPage";
import DailyPlannerPage from "./pages/DailyPlannerPage";
import LandingPage from "./pages/LandingPage";
import LearningHubPage from "./pages/LearningHubPage";
import LoginPage from "./pages/LoginPage";
import NotesPage from "./pages/NotesPage";
import PortfolioGoalsPage from "./pages/PortfolioGoalsPage";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import RegisterPage from "./pages/RegisterPage";
import ResourcesPage from "./pages/ResourcesPage";
import RoadmapPage from "./pages/RoadmapPage";
import SettingsPage from "./pages/SettingsPage";
import SkillsPage from "./pages/SkillsPage";
import WeeklyReviewPage from "./pages/WeeklyReviewPage";
import CalendarPage from "./pages/CalendarPage";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAppContext();
  return currentUser ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { currentUser } = useAppContext();
  return currentUser ? <Navigate to="/app/dashboard" replace /> : children;
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

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
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
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="planner" element={<DailyPlannerPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="learning" element={<LearningHubPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="weekly-review" element={<WeeklyReviewPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="portfolio-goals" element={<PortfolioGoalsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
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
