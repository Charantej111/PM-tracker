import { Bell, Flame, LogOut, Menu, Moon, Sun, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Header({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { currentUser, currentUserData, dashboardMetrics, getInitials, markAllNotificationsRead, isDarkMode, toggleTheme } =
    useAppContext();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const avatarUrl = profile?.avatar_url?.trim() 
    ? profile.avatar_url 
    : currentUser?.avatar?.trim() 
      ? currentUser.avatar 
      : null;

  return (
    <header className="glass-panel sticky top-4 z-30 mb-6 flex items-center justify-between gap-4 rounded-[28px] px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden dark:border-white/10 dark:text-slate-300"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {currentUser?.name}</p>
          <h1 className="mt-1 text-lg font-semibold text-ink dark:text-white">
            {currentUserData?.goalPlan?.currentMonth}
          </h1>
        </div>
      </div>
      <div className="hidden items-center gap-3 xl:flex">
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Target className="h-4 w-4 text-accent" />
            Today's goal
          </div>
          <div className="mt-1 font-semibold text-ink dark:text-white">{dashboardMetrics?.todayCompletion}% done</div>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Flame className="h-4 w-4 text-warning" />
            Current streak
          </div>
          <div className="mt-1 font-semibold text-ink dark:text-white">{dashboardMetrics?.currentStreak} days</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:border-accent/30 hover:text-accent dark:border-white/10 dark:text-slate-300"
          title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="relative rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:border-accent/30 hover:text-accent dark:border-white/10 dark:text-slate-300"
        >
          <Bell className="h-5 w-5" />
          {currentUserData?.notifications?.some((item) => !item.read) ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning" />
          ) : null}
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-slate-950/70">
          {avatarUrl ? (
            <img src={avatarUrl} alt={currentUser?.name} className="h-10 w-10 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-white">
              {getInitials(currentUser?.name)}
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-ink dark:text-white">{currentUser?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.targetRole}</div>
          </div>
        </div>
        <Button variant="ghost" className="hidden lg:inline-flex" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
