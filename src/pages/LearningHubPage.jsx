import { BookOpen, Clock3, Goal, TimerReset, Plus, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import ProgressRing from "../components/ProgressRing";
import Slider from "../components/Slider";
import StatCard from "../components/StatCard";
import { useAppContext } from "../context/AppContext";
import { average } from "../utils/helpers";

export default function LearningHubPage() {
  const { currentUserData, updateLearningItem, addLearningItem, deleteLearningItem, updateWeeklyGoalTarget } = useAppContext();
  
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Course");
  const [weeklyGoal, setWeeklyGoal] = useState(3);

  const learningItems = currentUserData?.learning?.items || [];
  const weeklyGoalHours = currentUserData?.learning?.weeklyGoalHours || 18;
  const totalHours = learningItems.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
  const avgCompletion = learningItems.length > 0 ? average(learningItems.map((item) => item.completion || 0)) : 0;

  const resetForm = () => {
    setTitle("");
    setType("Course");
    setWeeklyGoal(3);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setType(item.type || "Course");
    setWeeklyGoal(item.weeklyGoal || 3);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      type,
      weeklyGoal: Number(weeklyGoal),
    };

    if (editingItem) {
      updateLearningItem(editingItem.id, payload);
    } else {
      addLearningItem(payload);
    }
    resetForm();
  };

  return (
    <PageShell
      title="Learning Hub"
      description="Track courses, videos, reading, practice hours, and weekly learning targets in one calm workflow."
      actions={
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink dark:text-white">
                {editingItem ? "Edit Learning Item" : "New Learning Item"}
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
                label="Course/Item Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI for Product Managers"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-ink dark:text-white">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-shell w-full py-2.5"
                  >
                    <option value="Course">Course</option>
                    <option value="Practice">Practice</option>
                    <option value="Video">Video</option>
                    <option value="Reading">Reading</option>
                  </select>
                </div>
                <InputField
                  label="Target Hours / Week"
                  type="number"
                  min="1"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                  required
                />
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Save Changes" : "Create Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock3} label="Time Spent" value={`${totalHours}h`} helper="This week across all learning types" />
        <StatCard icon={Goal} label="Completion" value={`${avgCompletion}%`} helper="Average progress across learning tracks" />
        <StatCard icon={BookOpen} label="Learning Items" value={learningItems.length} helper="Courses, reading, videos, and practice logs" />
        <StatCard icon={TimerReset} label="Weekly Goal" value={`${weeklyGoalHours}h`} helper="Your target pace for this week" />
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
                    {totalHours}h / {weeklyGoalHours}h
                  </span>
                </div>
                <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                     className="h-full bg-accent rounded-full transition-all duration-500"
                     style={{ width: `${Math.min(100, (totalHours / weeklyGoalHours) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-accent-soft/10 p-4 border border-accent/15">
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {totalHours >= weeklyGoalHours
                    ? "🎉 Weekly target met! Excellent work maintaining your consistency."
                    : `Keep going! You need ${weeklyGoalHours - totalHours} more hours to reach your target.`}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Target Weekly Hours:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={weeklyGoalHours}
                    onChange={(e) => updateWeeklyGoalTarget(Number(e.target.value))}
                    className="input-shell py-1 px-2.5 max-w-[80px] text-sm"
                  />
                  <span className="text-xs text-slate-400">hours</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="grid gap-4">
          {learningItems.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No learning items found. Start building your curriculum!</p>
            </Card>
          ) : (
            learningItems.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="inline-flex rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                      {item.type}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-ink dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.timeSpent}h logged this week • goal {item.weeklyGoal}h
                    </p>
                  </div>
                  
                  <div className="flex gap-1 md:ml-4">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-accent dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteLearningItem(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 w-full space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Completion</span>
                    <span>{item.completion}%</span>
                  </div>
                   <Slider
                    min={0}
                    max={100}
                    value={item.completion}
                    onChange={(val) => updateLearningItem(item.id, { completion: val })}
                    className="mt-3"
                  />
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Practice hours
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={item.timeSpent}
                        onChange={(event) => updateLearningItem(item.id, { timeSpent: Number(event.target.value) })}
                        className="input-shell py-1 px-2.5 max-w-[80px] text-sm"
                      />
                      <span className="text-xs text-slate-400">h</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
