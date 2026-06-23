import { ChevronDown, NotebookPen } from "lucide-react";
import { useState } from "react";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { average } from "../utils/helpers";

export default function RoadmapPage() {
  const { currentUserData, updateRoadmapTopic } = useAppContext();
  const [open, setOpen] = useState(Object.keys(currentUserData.roadmap)[0]);

  return (
    <PageShell
      title="Product Manager Roadmap"
      description="Expand each discipline, mark progress, and capture notes as your PM foundation deepens."
    >
      <div className="space-y-4">
        {Object.entries(currentUserData.roadmap).map(([category, topics]) => {
          const categoryProgress = average(topics.map((topic) => topic.progress));
          const isOpen = open === category;

          return (
            <Card key={category} hover={false}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : category)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div>
                  <h3 className="text-xl font-semibold text-ink dark:text-white">{category}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {topics.filter((topic) => topic.completed).length} of {topics.length} topics completed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                    {categoryProgress}%
                  </div>
                  <ChevronDown className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              {isOpen ? (
                <div className="mt-6 grid gap-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="rounded-[28px] border border-slate-200/80 p-5 dark:border-white/10">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-xl">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={topic.completed}
                              onChange={(event) =>
                                updateRoadmapTopic(category, topic.id, {
                                  completed: event.target.checked,
                                  progress: event.target.checked ? 100 : topic.progress,
                                })
                              }
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                            />
                            <div>
                              <div className="text-base font-semibold text-ink dark:text-white">{topic.name}</div>
                              <div className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{topic.notes}</div>
                            </div>
                          </label>
                        </div>
                        <div className="w-full max-w-sm space-y-3">
                          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span>Completion</span>
                            <span>{topic.progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={topic.progress}
                            onChange={(event) =>
                              updateRoadmapTopic(category, topic.id, {
                                progress: Number(event.target.value),
                                completed: Number(event.target.value) === 100,
                              })
                            }
                            className="w-full accent-[rgb(var(--accent))]"
                          />
                          <textarea
                            value={topic.notes}
                            onChange={(event) =>
                              updateRoadmapTopic(category, topic.id, {
                                notes: event.target.value,
                              })
                            }
                            rows={3}
                            className="input-shell"
                            placeholder="Capture notes, examples, or applied exercises"
                          />
                          <div className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            <NotebookPen className="mt-0.5 h-4 w-4 text-accent" />
                            Update notes by editing this topic when you connect it to a real artifact or exercise.
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
