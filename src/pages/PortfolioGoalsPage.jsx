import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { formatShortDate } from "../utils/helpers";

export default function PortfolioGoalsPage() {
  const { currentUserData, updatePortfolioGoal } = useAppContext();

  return (
    <PageShell
      title="Portfolio Goals"
      description="Track the career assets that make your PM story credible: resume, LinkedIn, case studies, mock interviews, and your website."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {currentUserData.portfolioGoals.map((goal) => (
          <Card key={goal.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-ink dark:text-white">{goal.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Due {formatShortDate(goal.deadline)}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={(event) => updatePortfolioGoal(goal.id, { completed: event.target.checked, progress: event.target.checked ? 100 : goal.progress })}
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                />
                Done
              </label>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{goal.milestone}</p>
            <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Completion</span>
              <span>{goal.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={goal.progress}
              onChange={(event) =>
                updatePortfolioGoal(goal.id, {
                  progress: Number(event.target.value),
                  completed: Number(event.target.value) === 100,
                })
              }
              className="mt-4 w-full accent-[rgb(var(--accent))]"
            />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
