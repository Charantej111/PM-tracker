import { Plus, Sparkles, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState, useRef } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { getTodayKey, formatDateKey, percent } from "../utils/helpers";

const periods = [
  { key: "morning", title: "Morning", icon: "☀️" },
  { key: "afternoon", title: "Afternoon", icon: "🌤️" },
  { key: "evening", title: "Evening", icon: "🌆" },
  { key: "night", title: "Night", icon: "🌙" },
];

function PlannerTaskRow({ task, selectedDate, periodKey, updatePlannerTask, deletePlannerTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      updatePlannerTask(selectedDate, periodKey, task.id, { title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 transition hover:border-accent/25 dark:border-white/10 bg-white/40 dark:bg-black/10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => updatePlannerTask(selectedDate, periodKey, task.id, { completed: !task.completed })}
          className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent shrink-0"
        />
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="input-shell py-1 px-3 text-sm flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && editedTitle.trim()) handleSave();
              if (e.key === "Escape") {
                setEditedTitle(task.title);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`text-sm truncate ${task.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>
              {task.title}
            </span>
            {!task.completedOnSchedule && task.completed && task.completedDate && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md shrink-0">
                Late ({task.completedDate})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-1 text-accent hover:bg-accent-soft/10 rounded"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditedTitle(task.title);
                setIsEditing(false);
              }}
              className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-accent rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Edit Task"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => deletePlannerTask(task.id)}
              className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Delete Task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DailyPlannerPage() {
  const { currentUserData, updatePlannerTask, addPlannerTask, deletePlannerTask } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(() => getTodayKey());

  const morningRef = useRef(null);
  const afternoonRef = useRef(null);
  const eveningRef = useRef(null);
  const nightRef = useRef(null);

  const inputRefs = {
    morning: morningRef,
    afternoon: afternoonRef,
    evening: eveningRef,
    night: nightRef,
  };

  const handleFocusInput = (periodKey) => {
    if (inputRefs[periodKey]?.current) {
      inputRefs[periodKey].current.focus();
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateKey(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateKey(d));
  };

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const plan = currentUserData?.planner?.[selectedDate] || { morning: [], afternoon: [], evening: [], night: [] };
  const [drafts, setDrafts] = useState({ morning: "", afternoon: "", evening: "", night: "" });
  
  // Extract block tasks properly filtering out any metadata fields
  const allTasks = Object.values(plan)
    .flat()
    .filter(Boolean)
    .filter(t => t && t.id);

  const completed = allTasks.filter((task) => task.completed).length;
  const completion = percent(completed, allTasks.length);

  const getStatusBadge = () => {
    if (allTasks.length === 0) {
      return {
        text: "Clean Slate",
        classes: "bg-slate-100 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400 border border-slate-200 dark:border-slate-800",
        dotClass: "bg-slate-400"
      };
    }
    const isFullyCompleted = allTasks.every(t => t.completed);
    if (!isFullyCompleted) {
      return {
        text: "Incomplete",
        classes: "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30",
        dotClass: "bg-rose-500"
      };
    }
    const allOnSchedule = allTasks.every(t => t.completedOnSchedule);
    if (allOnSchedule) {
      return {
        text: "Completed On Time",
        classes: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
        dotClass: "bg-emerald-500"
      };
    } else {
      return {
        text: "Completed Late",
        classes: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
        dotClass: "bg-amber-500"
      };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <PageShell
      title="Daily Planner"
      description="A focused four-block rhythm for PM learning, analytics, communication, and portfolio building."
      actions={
        <div className="rounded-2xl bg-accent-soft/10 px-4 py-3 text-sm font-semibold text-accent">
          Day completion: {completion}%
        </div>
      }
    >
      {/* Date Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            className="p-2 h-9 w-9 rounded-xl flex items-center justify-center border-slate-200 dark:border-white/10"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <div className="relative flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:border-accent transition duration-200">
            <Calendar className="h-4 w-4 text-accent" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none border-none cursor-pointer focus:ring-0 p-0 w-32"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="p-2 h-9 w-9 rounded-xl flex items-center justify-center border-slate-200 dark:border-white/10"
          >
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          {selectedDate !== getTodayKey() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(getTodayKey())}
              className="text-xs text-accent hover:underline px-2.5 py-1.5"
            >
              Back to Today
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Day Status:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.classes}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`} />
            {statusBadge.text}
          </span>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Sparkles className="h-4 w-4 text-accent" />
              Auto-saved to Supabase Cloud
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl select-none">{period.icon}</span>
                <h3 className="text-lg font-bold text-ink dark:text-white leading-none">{period.title}</h3>
              </div>
              <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                {percent((plan[period.key] || []).filter((task) => task.completed).length, (plan[period.key] || []).length || 1)}%
              </div>
            </div>

            {(plan[period.key] || []).length === 0 ? (
              <div
                onClick={() => handleFocusInput(period.key)}
                className="group mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 p-6 text-center cursor-pointer hover:bg-slate-50/50 hover:border-accent/40 dark:border-white/10 dark:hover:bg-slate-900/30 transition duration-200"
              >
                <span className="text-2xl select-none group-hover:scale-110 transition-transform duration-200">{period.icon}</span>
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-350">Clean slate!</p>
                <p className="text-xs text-slate-400 mt-0.5">Add tasks below to plan this day.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {(plan[period.key] || []).map((task) => (
                  <PlannerTaskRow
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                    periodKey={period.key}
                    updatePlannerTask={updatePlannerTask}
                    deletePlannerTask={deletePlannerTask}
                  />
                ))}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <input
                ref={inputRefs[period.key]}
                value={drafts[period.key]}
                onChange={(event) => setDrafts((previous) => ({ ...previous, [period.key]: event.target.value }))}
                placeholder={`Add a ${period.title.toLowerCase()} task`}
                className="input-shell"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && drafts[period.key].trim()) {
                    addPlannerTask(selectedDate, period.key, drafts[period.key].trim());
                    setDrafts((previous) => ({ ...previous, [period.key]: "" }));
                  }
                }}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  if (!drafts[period.key].trim()) return;
                  addPlannerTask(selectedDate, period.key, drafts[period.key].trim());
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
