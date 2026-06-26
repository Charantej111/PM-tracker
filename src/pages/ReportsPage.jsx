import { useState, useRef } from "react";
import {
  FileBarChart,
  Download,
  Calendar,
  User,
  Compass,
  Award,
  BookOpen,
  Briefcase,
  Flame,
  CheckCircle,
  HelpCircle,
  FileText
} from "lucide-react";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import StatCard from "../components/StatCard";
import { useAppContext } from "../context/AppContext";
import {
  getWeekRange,
  getMonthRange,
  computeWeeklyReport,
  computeMonthlyReport,
  computePMReadinessScore,
  computeStudyHoursBreakdown,
} from "../utils/reportUtils";
import {
  PMReadinessRadar,
  ProjectStatusPie,
  StudyHoursBar,
  RoadmapCompletionBar,
} from "../charts/ReportCharts";
import { exportReportToPdf } from "../utils/pdfExport";
import { average, formatDate, formatShortDate, formatReviewReflection } from "../utils/helpers";
import ReportPrintView from "../components/ReportPrintView";

export default function ReportsPage() {
  const { currentUser, currentUserData, isDarkMode } = useAppContext();
  const [reportType, setReportType] = useState("weekly"); // "weekly" | "monthly"
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // Live state extraction
  const skills = currentUserData.skills || [];
  const projects = currentUserData.projects || [];
  const roadmap = currentUserData.roadmap || {};
  const learningItems = currentUserData.learning?.items || [];
  const reviews = currentUserData.reviews || [];
  const portfolioGoals = currentUserData.portfolioGoals || [];
  const weeklyGoalHours = currentUserData.learning?.weeklyGoalHours || 18;

  // Derived metrics
  const activeProjects = projects.filter((p) => p.status !== "Completed").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const completedGoals = portfolioGoals.filter((g) => g.completed).length;

  const totalStudyHours = learningItems.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
  const avgLearningCompletion = learningItems.length > 0
    ? average(learningItems.map((item) => item.completion || 0))
    : 0;

  // PM Readiness calculation
  const readiness = computePMReadinessScore(skills);

  // Weekly/Monthly computations
  const weeklyStats = computeWeeklyReport(currentUserData);
  const monthlyStats = computeMonthlyReport(currentUserData);

  const activeStats = reportType === "weekly" ? weeklyStats : monthlyStats;
  const dateRangeLabel = reportType === "weekly" ? getWeekRange() : getMonthRange();

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await exportReportToPdf(reportType, currentUser, currentUserData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Extract latest review
  const latestReview = reviews.length > 0
    ? [...reviews].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))[0]
    : null;

  return (
    <PageShell
      title="Performance Reports"
      description="Generate comprehensive progress reports, analyze PM readiness scores, and download high-resolution PDFs of your career OS."
      actions={
        <div className="flex items-center gap-3">
          <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setReportType("weekly")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                reportType === "weekly"
                  ? "bg-accent text-white"
                  : "text-slate-600 hover:text-ink dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                reportType === "monthly"
                  ? "bg-accent text-white"
                  : "text-slate-600 hover:text-ink dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      }
    >
      <div ref={reportRef} className="space-y-6 p-1 rounded-[32px]">
        {/* Profile/Header Card */}
        <Card hover={false} className="border border-slate-200/80 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-accent text-2xl font-bold text-white shadow-soft">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "PM"}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-ink dark:text-white">
                  {currentUser?.name || "PM Builder"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {currentUser?.targetRole || "Associate Product Manager"} • {currentUser?.careerGoal || "Goal unset"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200/30 dark:bg-slate-900 dark:text-slate-400 dark:border-white/5">
              <Calendar className="h-4 w-4 text-accent" />
              <span>{reportType === "weekly" ? "Weekly Report:" : "Monthly Report:"} {dateRangeLabel}</span>
            </div>
          </div>
        </Card>

        {/* 9 SECTIONS */}

        {/* Section 1: Dashboard Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Award}
            label="Overall Progress"
            value={`${weeklyStats.goalCompletionPercentage}%`}
            helper="Weighted average of all goals"
          />
          <StatCard
            icon={BookOpen}
            label="Hours Studied"
            value={`${totalStudyHours}h`}
            helper={`Target: ${activeStats.studyTarget}h`}
          >
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pace</span>
                <span>{Math.min(100, Math.round((totalStudyHours / activeStats.studyTarget) * 100))}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${Math.min(100, (totalStudyHours / activeStats.studyTarget) * 100)}%` }}
                />
              </div>
            </div>
          </StatCard>
          <StatCard
            icon={Briefcase}
            label="Projects Overview"
            value={`${completedProjects} / ${projects.length}`}
            helper={`${activeProjects} active projects`}
          />
          <StatCard
            icon={Flame}
            label="Streak & Consistency"
            value={`${currentUserData?.activityLog?.length > 0 ? "Active" : "0 Days"}`}
            helper="Consistency tracking enabled"
            tone="warning"
          />
        </div>

        {/* Main Columns Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Section 9: PM Readiness Score (Radar Chart & Score) */}
          <Card hover={false} className="flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 9</span>
                <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">PM Readiness Score</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Directly mapped from your active skills list.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-[28px] border border-slate-200/40 dark:border-white/5">
                  <span className="text-sm text-slate-400 dark:text-slate-500 font-semibold uppercase">Overall</span>
                  <div className="text-5xl font-black text-accent mt-1">{readiness.overall}%</div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Readiness Index</span>
                </div>
                <PMReadinessRadar skills={skills} />
              </div>
            </div>
            {skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Skills Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {skills.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex justify-between items-center rounded-xl bg-slate-50/50 px-3 py-2 border border-slate-200/20 dark:bg-slate-900/50">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{s.name}</span>
                      <span className="text-accent font-bold">{s.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Section 2: Learning Statistics */}
          <Card hover={false}>
            <div className="mb-4">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 2</span>
              <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Learning Statistics</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pace, completions, and volume stats.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Hours Logged</div>
                <div className="mt-2 text-3xl font-extrabold text-ink dark:text-white">{totalStudyHours}h</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-sm text-slate-500 dark:text-slate-400">Avg Progress</div>
                <div className="mt-2 text-3xl font-extrabold text-ink dark:text-white">{Math.round(avgLearningCompletion)}%</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-sm text-slate-500 dark:text-slate-400">Weekly Target</div>
                <div className="mt-2 text-3xl font-extrabold text-ink dark:text-white">{weeklyGoalHours}h</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-sm text-slate-500 dark:text-slate-400">Items Tracked</div>
                <div className="mt-2 text-3xl font-extrabold text-ink dark:text-white">{learningItems.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section 8: Study Hours Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card hover={false}>
            <div className="mb-4">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 8</span>
              <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Study Hours</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Logged hours split across different curriculum types.</p>
            </div>
            <StudyHoursBar learningItems={learningItems} />
          </Card>

          {/* Section 5: Projects Overview */}
          <Card hover={false}>
            <div className="mb-4">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 5</span>
              <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Projects Overview</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status distributions for logged portfolio projects.</p>
            </div>
            <ProjectStatusPie projects={projects} />
          </Card>
        </div>

        {/* Section 6: Roadmap Completion */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card hover={false}>
            <div className="mb-4">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 6</span>
              <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Roadmap Completion</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress rate across categories in the PM roadmap.</p>
            </div>
            <RoadmapCompletionBar roadmap={roadmap} />
          </Card>

          {/* Section 3: Skills Progress */}
          <Card hover={false}>
            <div className="mb-4">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 3</span>
              <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Skills Progress</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Live progress values of active skills in your inventory.</p>
            </div>
            {skills.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-slate-400">
                No skills defined. Add them in the Skills module.
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-700 dark:text-slate-200">{skill.name}</span>
                      <span className="text-accent">{skill.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Section 4: Portfolio Goals */}
        <Card hover={false}>
          <div className="mb-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 4</span>
            <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Portfolio Goals</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tracking high-value milestones.</p>
          </div>
          {portfolioGoals.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-slate-400">
              No portfolio goals defined yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-ink dark:text-white truncate max-w-[150px]">{goal.title}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      goal.completed
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}>
                      {goal.completed ? "Done" : "In Progress"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Milestone: {goal.milestone || "None"}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Progress: {goal.progress}%</span>
                    <span>Due: {formatShortDate(goal.deadline || goal.target_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section 7: Weekly Reviews */}
        <Card hover={false}>
          <div className="mb-4">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Section 7</span>
            <h3 className="text-xl font-bold text-ink dark:text-white mt-0.5">Weekly Reviews</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reflections and logs from your latest check-ins.</p>
          </div>
          {latestReview ? (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-700 dark:text-slate-200">Review date: {formatDate(latestReview.date || latestReview.created_at)}</span>
                <span className="text-accent">Weekly reflection record</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Study Completed</div>
                  <div className="text-xl font-bold text-ink dark:text-white mt-1">{weeklyStats.studyCompleted || 0} hours</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Roadmap Topics Done</div>
                  <div className="text-xl font-bold text-ink dark:text-white mt-1">{weeklyStats.roadmapTopicsCompleted || 0} topics</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Weekly Goal Status</div>
                  <div className="text-xl font-bold text-ink dark:text-white mt-1">
                    {weeklyStats.studyCompleted >= weeklyStats.studyTarget ? "Goals Met ✓" : "In Progress"}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <span className="font-bold text-sm text-ink dark:text-white block mb-1">Reflection Summary:</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {formatReviewReflection(latestReview).map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                      <div className="text-sm mt-1 text-slate-700 dark:text-slate-300 italic leading-relaxed">
                        {item.value || "No entry recorded."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-slate-400 text-sm">
              No weekly reflections recorded yet. Complete a review in the Weekly Review module to see it summarized here.
            </div>
          )}
        </Card>
      </div>
      <ReportPrintView
        userData={currentUserData}
        currentUser={currentUser}
        reportType={reportType}
      />
    </PageShell>
  );
}
