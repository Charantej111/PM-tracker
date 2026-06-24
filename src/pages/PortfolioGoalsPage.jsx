import { Plus, Edit2, Trash2, X, Target, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import Slider from "../components/Slider";
import { useAppContext } from "../context/AppContext";
import { formatShortDate } from "../utils/helpers";

export default function PortfolioGoalsPage() {
  const { currentUserData, updatePortfolioGoal, addPortfolioGoal, deletePortfolioGoal } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [title, setTitle] = useState("");
  const [milestone, setMilestone] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const goals = currentUserData.portfolioGoals || [];

  const resetForm = () => {
    setTitle("");
    setMilestone("");
    setDeadline("");
    setPriority("Medium");
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleStartEdit = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setMilestone(goal.milestone || goal.description || "");
    setDeadline(goal.deadline || goal.target_date || "");
    setPriority(goal.priority || "Medium");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    const payload = {
      title: title.trim(),
      milestone: milestone.trim(),
      deadline,
      priority,
    };

    if (editingGoal) {
      updatePortfolioGoal(editingGoal.id, payload);
    } else {
      payload.progress = 0;
      payload.completed = false;
      addPortfolioGoal(payload);
    }
    resetForm();
  };

  return (
    <PageShell
      title="Portfolio Goals"
      description="Track the career assets that make your PM story credible: resume, LinkedIn, case studies, mock interviews, and your website."
      actions={
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink dark:text-white">
                {editingGoal ? "Edit Goal" : "New Goal"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Goal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Portfolio Website"
                required
              />
              <InputField
                label="Milestone / Description"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                placeholder="e.g. Publish case studies page"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-ink dark:text-white">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="input-shell w-full py-2.5"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGoal ? "Save Changes" : "Create Goal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">No portfolio goals found.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-ink dark:text-white line-clamp-1">{goal.title}</h3>
                    {goal.priority === "High" && (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Due {formatShortDate(goal.deadline || goal.target_date)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStartEdit(goal)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-accent dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deletePortfolioGoal(goal.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {goal.milestone || goal.description || "No milestone set"}
                </p>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" /> Progress
                  </span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  value={goal.progress}
                  onChange={(val) =>
                    updatePortfolioGoal(goal.id, {
                      progress: val,
                      completed: val === 100,
                    })
                  }
                  className="mt-3"
                />
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${goal.completed ? 'bg-accent border-accent text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={(event) => updatePortfolioGoal(goal.id, { completed: event.target.checked })}
                      className="hidden"
                    />
                    Mark as Done
                  </label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
