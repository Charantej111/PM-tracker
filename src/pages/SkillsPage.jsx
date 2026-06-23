import { Sparkles } from "lucide-react";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";

const levels = ["Beginner", "Intermediate", "Advanced"];

export default function SkillsPage() {
  const { currentUserData, updateSkill } = useAppContext();

  return (
    <PageShell
      title="Skills Tracker"
      description="Monitor the capabilities that matter for PM interviews, internships, and portfolio credibility."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {currentUserData.skills.map((skill) => (
          <Card key={skill.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-ink dark:text-white">{skill.name}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Focused time this week: {skill.focusHours}h</p>
              </div>
              <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                {skill.progress}%
              </div>
            </div>
            <div className="mt-5 h-3 rounded-full bg-slate-100 dark:bg-slate-900">
              <div className="h-3 rounded-full bg-accent transition-all" style={{ width: `${skill.progress}%` }} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Level
                <select
                  value={skill.level}
                  onChange={(event) => updateSkill(skill.id, { level: event.target.value })}
                  className="input-shell mt-2"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Progress
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.progress}
                  onChange={(event) => updateSkill(skill.id, { progress: Number(event.target.value) })}
                  className="mt-4 w-full accent-[rgb(var(--accent))]"
                />
              </label>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {skill.level} mastery track
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
