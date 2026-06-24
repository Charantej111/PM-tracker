import { useEffect, useState } from "react";
import { Award, BookOpen, Flame, Goal, Sparkles, Target, TrendingUp } from "lucide-react";
import ActivityHeatmap from "../components/ActivityHeatmap";
import Button from "../components/Button";
import Card from "../components/Card";
import MotivationWidget from "../components/MotivationWidget";
import PageShell from "../components/PageShell";
import ProgressRing from "../components/ProgressRing";
import SkeletonCard from "../components/SkeletonCard";
import StatCard from "../components/StatCard";
import { useAppContext } from "../context/AppContext";
import { MonthlyCompletionChart, SkillRadarChart, WeeklyStudyChart } from "../charts/AnalyticsCharts";
import { average, formatShortDate, getTodayKey, percent } from "../utils/helpers";

export default function DashboardPage() {
  const { currentUserData, dashboardMetrics, triggerCelebration, logActivity, ACHIEVEMENTS_LIST } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const quotes = currentUserData?.motivation?.quotes || [];
    if (!quotes.length) return undefined;
    const timer = window.setInterval(() => {
      setQuoteIndex((previous) => (previous + 1) % quotes.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [currentUserData?.motivation?.quotes]);

  const quote = (() => {
    const quotes = currentUserData?.motivation?.quotes || [];
    if (!quotes.length) return "";
    return quotes[quoteIndex % quotes.length];
  })();

  const learningItems = currentUserData?.learning?.items || [];
  const learningCompletion = learningItems.length > 0
    ? average(learningItems.map((item) => item.completion || 0))
    : 0;

  const goalPlan = currentUserData?.goalPlan || {};
  const weeklyGoalHours = currentUserData?.learning?.weeklyGoalHours || 18;

  if (!currentUserData || !dashboardMetrics) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );

  const todayKey = getTodayKey();
  const hasCheckedInToday = (currentUserData.activityLog || []).some(
    (entry) => entry.date === todayKey && entry.count > 0,
  );

  return (
    <PageShell
      title="Dashboard"
      description="A premium command center for your PM growth system, with progress, streaks, projects, and learning signals at a glance."
      actions={
        <Button variant="secondary" onClick={() => triggerCelebration("Momentum unlocked", "Keep stacking visible progress every week.")}>
          Celebrate momentum
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            label="Overall Progress"
            value={`${dashboardMetrics.overallProgress}%`}
            helper="Balanced across roadmap, skills, projects, and portfolio"
          />
          <StatCard
            icon={Goal}
            label="Current Month Goal"
            value={`${dashboardMetrics.currentMonthGoal}%`}
            helper={goalPlan.currentMonth || "Set a monthly goal"}
          />
          <StatCard
            icon={BookOpen}
            label="Hours Studied This Week"
            value={`${dashboardMetrics.hoursStudiedThisWeek}h`}
            helper="Tracked across courses, videos, reading, and practice"
          >
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Goal progress</span>
                <span>{percent(dashboardMetrics.hoursStudiedThisWeek, weeklyGoalHours)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, percent(dashboardMetrics.hoursStudiedThisWeek, weeklyGoalHours))}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {dashboardMetrics.hoursStudiedThisWeek >= weeklyGoalHours
                  ? "🎉 Weekly target met!"
                  : `${Math.max(0, weeklyGoalHours - dashboardMetrics.hoursStudiedThisWeek)}h remaining this week`}
              </div>
            </div>
          </StatCard>
          <StatCard
            icon={Flame}
            label="Learning Streak"
            value={`${dashboardMetrics.currentStreak} days`}
            helper="Consistency is compounding"
            tone="warning"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                {hasCheckedInToday ? "Streak active today" : "Check in to keep streak"}
              </span>
              <button
                type="button"
                disabled={hasCheckedInToday}
                onClick={() => {
                  logActivity(1);
                  triggerCelebration("Check-in successful", "Your streak is safe for today!");
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  hasCheckedInToday
                    ? "bg-emerald-500/10 text-emerald-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent/90"
                }`}
              >
                {hasCheckedInToday ? "✓ Checked" : "Check-in"}
              </button>
            </div>
          </StatCard>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Career readiness</p>
              <div className="mt-5">
                <ProgressRing value={dashboardMetrics.overallProgress} label="overall readiness" helper="updated live" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  Active skill: <span className="font-semibold text-ink dark:text-white">{dashboardMetrics.activeSkill?.name || "None active"}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  Next milestone: <span className="font-semibold text-ink dark:text-white">{dashboardMetrics.nextMilestone?.title || "No upcoming goals"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Sparkles className="h-4 w-4" />
                  Today&apos;s focus
                </div>
                <h3 className="mt-3 text-2xl font-semibold">{goalPlan.currentMonth || "Set a monthly goal"}</h3>
                <p className="mt-3 text-sm leading-6 text-blue-100">
                  Build one proof point today that you can mention in your next interview.
                </p>
                <div className="mt-5 h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-gradient-to-r from-sky-300 to-white" style={{ width: `${dashboardMetrics.todayCompletion}%` }} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Weekly completion</div>
                  <div className="mt-2 text-2xl font-bold text-ink dark:text-white">{dashboardMetrics.todayCompletion}%</div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Completed skills</div>
                  <div className="mt-2 text-2xl font-bold text-ink dark:text-white">{dashboardMetrics.completedSkills}</div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Active projects</div>
                  <div className="mt-2 text-2xl font-bold text-ink dark:text-white">{dashboardMetrics.activeProjects}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <MotivationWidget
          streak={dashboardMetrics.currentStreak}
          countdownDays={dashboardMetrics.countdownDays}
          quote={quote}
          nextMilestone={dashboardMetrics.nextMilestone}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <WeeklyStudyChart values={(currentUserData.metricsSnapshot || {}).weeklyStudyHours || [0,0,0,0,0,0,0]} />
        <SkillRadarChart skills={currentUserData.skills || []} />
        <MonthlyCompletionChart values={(currentUserData.metricsSnapshot || {}).monthlyCompletion || []} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ActivityHeatmap values={currentUserData.activityLog} />
          
          <Card>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-white">Achievements & Badges</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Unlock these badges through study consistency and career focus.</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {ACHIEVEMENTS_LIST.map((ach) => {
                const isUnlocked = currentUserData.achievements?.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`relative flex flex-col items-center rounded-3xl border p-4 text-center transition hover:shadow-sm ${
                      isUnlocked
                        ? "bg-white border-slate-200 dark:bg-slate-950/40 dark:border-white/10"
                        : "bg-slate-50/50 border-slate-200/50 opacity-40 dark:bg-slate-900/10 dark:border-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-sm ${
                        isUnlocked
                          ? "bg-slate-50 dark:bg-slate-800"
                          : "bg-slate-200/50 grayscale dark:bg-slate-900"
                      }`}
                    >
                      {ach.icon}
                    </div>
                    <span className="mt-3 text-sm font-semibold text-ink dark:text-white">{ach.title}</span>
                    <span className="mt-1 text-[11px] leading-relaxed text-slate-400">{ach.desc}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink dark:text-white">Milestone watchlist</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">What deserves attention next.</p>
            </div>
            <Award className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-6 space-y-4">
            {(currentUserData.portfolioGoals || []).slice(0, 4).map((goal) => (
              <div key={goal.id} className="rounded-3xl border border-slate-200/80 p-4 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink dark:text-white">{goal.title || "Untitled goal"}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Due {formatShortDate(goal.deadline || goal.target_date)}
                    </div>
                  </div>
                  <div className="rounded-full bg-accent-soft/15 px-3 py-1 text-xs font-semibold text-accent">
                    {goal.progress || 0}%
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-900">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${goal.progress || 0}%` }} />
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{goal.milestone || goal.description || ""}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              Learning hub completion is currently <span className="font-semibold text-ink dark:text-white">{learningCompletion}%</span>.
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
