import { BookOpen, Clock3, Goal, TimerReset } from "lucide-react";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import ProgressRing from "../components/ProgressRing";
import StatCard from "../components/StatCard";
import { useAppContext } from "../context/AppContext";
import { average } from "../utils/helpers";

export default function LearningHubPage() {
  const { currentUserData, updateLearningItem } = useAppContext();
  const totalHours = currentUserData.learning.items.reduce((sum, item) => sum + item.timeSpent, 0);
  const avgCompletion = average(currentUserData.learning.items.map((item) => item.completion));

  return (
    <PageShell
      title="Learning Hub"
      description="Track courses, videos, reading, practice hours, and weekly learning targets in one calm workflow."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock3} label="Time Spent" value={`${totalHours}h`} helper="This week across all learning types" />
        <StatCard icon={Goal} label="Completion" value={`${avgCompletion}%`} helper="Average progress across learning tracks" />
        <StatCard icon={BookOpen} label="Learning Items" value={currentUserData.learning.items.length} helper="Courses, reading, videos, and practice logs" />
        <StatCard icon={TimerReset} label="Weekly Goal" value={`${currentUserData.learning.weeklyGoalHours}h`} helper="Your target pace for this week" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-center justify-center py-8">
            <ProgressRing value={avgCompletion} label="Learning completion" helper="Weighted average across courses" />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-ink dark:text-white">Weekly Pace Tracker</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Study hours logged against your weekly target.</p>
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Weekly Goal Progress</span>
                  <span className="font-semibold text-ink dark:text-white">
                    {totalHours}h / {currentUserData.learning.weeklyGoalHours}h
                  </span>
                </div>
                <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalHours / currentUserData.learning.weeklyGoalHours) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-accent-soft/10 p-4 border border-accent/15">
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {totalHours >= currentUserData.learning.weeklyGoalHours
                    ? "🎉 Weekly target met! Excellent work maintaining your consistency."
                    : `Keep going! You need ${currentUserData.learning.weeklyGoalHours - totalHours} more hours to reach your target.`}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div className="grid gap-4">
          {currentUserData.learning.items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                    {item.type}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ink dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {item.timeSpent}h logged this week • goal {item.weeklyGoal}h
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Completion</span>
                    <span>{item.completion}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.completion}
                    onChange={(event) => updateLearningItem(item.id, { completion: Number(event.target.value) })}
                    className="w-full accent-[rgb(var(--accent))]"
                  />
                  <label className="text-sm text-slate-500 dark:text-slate-400">
                    Practice hours
                    <input
                      type="number"
                      min="0"
                      value={item.timeSpent}
                      onChange={(event) => updateLearningItem(item.id, { timeSpent: Number(event.target.value) })}
                      className="input-shell mt-2"
                    />
                  </label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
