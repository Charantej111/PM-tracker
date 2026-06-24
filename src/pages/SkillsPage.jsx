import { Sparkles, Trash2, Edit2, Check, X, Plus } from "lucide-react";
import { useState } from "react";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import Slider from "../components/Slider";
import { useAppContext } from "../context/AppContext";

const levels = ["Beginner", "Intermediate", "Advanced"];

function SkillCard({ skill, updateSkill, deleteSkill }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(skill.name);
  const [focusHours, setFocusHours] = useState(skill.focusHours || 0);

  const handleSave = () => {
    if (name.trim()) {
      updateSkill(skill.id, { name: name.trim(), focus_hours: Number(focusHours) });
      setIsEditing(false);
    }
  };

  return (
    <Card>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-slate-500">Edit Skill</h4>
            <div className="flex gap-2">
              <button onClick={handleSave} className="p-1 text-accent hover:bg-accent-soft/10 rounded-lg">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => { setName(skill.name); setFocusHours(skill.focusHours || 0); setIsEditing(false); }} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500">
              Skill Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-shell mt-1 py-1.5"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-500">
              Weekly Focus Hours
              <input
                type="number"
                value={focusHours}
                onChange={(e) => setFocusHours(e.target.value)}
                className="input-shell mt-1 py-1.5"
              />
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-ink dark:text-white leading-tight">{skill.name}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-accent rounded-lg"
                  title="Edit Skill Name & Hours"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Focused time this week: {skill.focusHours || 0}h
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                {skill.progress}%
              </div>
              <button
                onClick={() => deleteSkill(skill.id)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                title="Delete Skill"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
            <label className="text-sm text-slate-500 dark:text-slate-400 w-full block">
              Progress
              <Slider
                min={0}
                max={100}
                value={skill.progress}
                onChange={(val) => updateSkill(skill.id, { progress: val })}
                className="mt-4"
              />
            </label>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {skill.level} mastery track
          </div>
        </>
      )}
    </Card>
  );
}

function AddSkillCard({ addSkill }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addSkill({ name: name.trim(), progress: 0, level, focus_hours: 0 });
      setName("");
      setLevel("Beginner");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex flex-col items-center justify-center p-8 rounded-[32px] border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-500 hover:text-accent hover:border-accent hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition h-full min-h-[220px]"
      >
        <Plus className="h-8 w-8 mb-2 text-slate-400 dark:text-slate-600" />
        <span className="font-semibold text-sm">Add custom capability</span>
      </button>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-ink dark:text-white">Add capability</h3>
          <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm text-slate-500">
            Capability / Skill Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Analytics, SQL"
              className="input-shell mt-1"
              required
            />
          </label>
          <label className="block text-sm text-slate-500">
            Initial Level
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="input-shell mt-1"
            >
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="w-full btn-primary py-2.5">
          Create Skill Card
        </button>
      </form>
    </Card>
  );
}

export default function SkillsPage() {
  const { currentUserData, updateSkill, addSkill, deleteSkill } = useAppContext();

  const skillsList = currentUserData?.skills || [];

  return (
    <PageShell
      title="Skills Tracker"
      description="Monitor the capabilities that matter for PM interviews, internships, and portfolio credibility."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillsList.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            updateSkill={updateSkill}
            deleteSkill={deleteSkill}
          />
        ))}
        <AddSkillCard addSkill={addSkill} />
      </div>
    </PageShell>
  );
}
