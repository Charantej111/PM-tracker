import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { getTodayKey, percent } from "../utils/helpers";

const periods = [
  { key: "morning", title: "Morning", subtitle: "Product Management" },
  { key: "afternoon", title: "Afternoon", subtitle: "SQL / Data Analytics" },
  { key: "evening", title: "Evening", subtitle: "Communication Skills" },
  { key: "night", title: "Night", subtitle: "Projects / Case Studies" },
];

export default function DailyPlannerPage() {
  const { currentUserData, updatePlannerTask, addPlannerTask } = useAppContext();
  const today = getTodayKey();
  const plan = currentUserData.planner[today] || { morning: [], afternoon: [], evening: [], night: [] };
  const [drafts, setDrafts] = useState({ morning: "", afternoon: "", evening: "", night: "" });
  const allTasks = Object.values(plan).flat();
  const completed = allTasks.filter((task) => task.completed).length;
  const completion = percent(completed, allTasks.length);

  return (
    <PageShell
      title="Daily Planner"
      description="A focused four-block rhythm for PM learning, analytics, communication, and portfolio building."
      actions={
        <div className="rounded-2xl bg-accent-soft/10 px-4 py-3 text-sm font-semibold text-accent">
          Today&apos;s completion: {completion}%
        </div>
      }
    >
      <Card>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Sparkles className="h-4 w-4 text-accent" />
              Auto-saved to LocalStorage
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-ink dark:text-white">Daily completion rhythm</h2>
          </div>
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{completed} of {allTasks.length} tasks complete</span>
              <span>{completion}%</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-100 dark:bg-slate-900">
              <div className="h-3 rounded-full bg-accent transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {periods.map((period) => (
          <Card key={period.key}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-accent">{period.title}</div>
                <h3 className="mt-2 text-xl font-semibold text-ink dark:text-white">{period.subtitle}</h3>
              </div>
              <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                {percent(plan[period.key].filter((task) => task.completed).length, plan[period.key].length || 1)}%
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {plan[period.key].map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 transition hover:border-accent/25 dark:border-white/10"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => updatePlannerTask(today, period.key, task.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  <span className={`text-sm ${task.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>
                    {task.title}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <input
                value={drafts[period.key]}
                onChange={(event) => setDrafts((previous) => ({ ...previous, [period.key]: event.target.value }))}
                placeholder={`Add a ${period.title.toLowerCase()} task`}
                className="input-shell"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  if (!drafts[period.key].trim()) return;
                  addPlannerTask(today, period.key, drafts[period.key].trim());
                  setDrafts((previous) => ({ ...previous, [period.key]: "" }));
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
