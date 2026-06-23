import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Check, Trash2, Clock, Tag, AlertCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Card from "../components/Card";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { getTodayKey, generateId, formatDateKey } from "../utils/helpers";
import PageShell from "../components/PageShell";

const CATEGORIES = ["Study", "Project", "Interview", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

const categoryColors = {
  Study: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Project: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Interview: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const priorityColors = {
  High: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export default function CalendarPage() {
  const { currentUserData, addCalendarEvent, toggleCalendarEvent, deleteCalendarEvent, triggerCelebration } = useAppContext();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayKey());
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00");
  const [category, setCategory] = useState("Study");
  const [priority, setPriority] = useState("Medium");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate days in month
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  // Calculate day of the week for day 1
  const startDayOfWeek = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  const daysArray = useMemo(() => {
    const days = [];
    // Placeholders for previous month offset
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Days of active month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month, daysInMonth, startDayOfWeek]);

  const events = currentUserData?.calendarEvents || [];

  // Group events by date string for easy dot rendering
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDateStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCalendarEvent({
      title: title.trim(),
      date: selectedDateStr,
      time,
      category,
      priority,
    });

    setTitle("");
    setShowAddForm(false);
  };

  const handleToggle = (id, completed, isHighPriority) => {
    toggleCalendarEvent(id);
    if (!completed && isHighPriority) {
      triggerCelebration("Important Task Complete!", "Great job pushing career milestones forward!");
    }
  };

  return (
    <PageShell
      title="Calendar Planner"
      description="Schedule review prep, study blocks, and mock interview milestones."
      actions={
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                {monthNames[month]} {year}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekdays header */}
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Days */}
            <div className="mt-2 grid grid-cols-7 gap-1">
              {daysArray.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-16 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10" />;
                }

                const dateStr = formatDateKey(date);
                const isSelected = dateStr === selectedDateStr;
                const isToday = dateStr === getTodayKey();
                const dayEvents = eventsByDate[dateStr] || [];
                const hasUncompleted = dayEvents.some(e => !e.completed);
                const hasCompleted = dayEvents.some(e => e.completed);

                return (
                  <button
                    key={`day-${dateStr}`}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`group relative flex h-16 flex-col items-center justify-between rounded-2xl p-2 transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                      isSelected
                        ? "bg-accent text-white hover:bg-accent/95 shadow-md"
                        : isToday
                        ? "bg-accent-soft/10 border border-accent/20 text-accent font-semibold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-sm">{date.getDate()}</span>
                    
                    {/* Event Dots */}
                    <div className="flex justify-center gap-1">
                      {hasUncompleted && (
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-accent"}`} />
                      )}
                      {hasCompleted && !hasUncompleted && (
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/50" : "bg-emerald-500"}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Date Tasks Pane */}
        <div>
          <Card className="h-full p-6">
            <h3 className="font-display text-lg font-bold text-ink dark:text-white">
              {new Date(selectedDateStr).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Events scheduled for this day</p>

            <div className="mt-6 space-y-3">
              <AnimatePresence mode="popLayout">
                {selectedEvents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center text-slate-400"
                  >
                    <CalendarIcon className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="mt-3 text-sm">No events scheduled.</p>
                  </motion.div>
                ) : (
                  selectedEvents.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-start justify-between gap-3 rounded-2xl border p-4 transition ${
                        event.completed
                          ? "bg-slate-50/50 border-slate-100 opacity-60 dark:bg-slate-900/20 dark:border-white/5"
                          : "bg-white border-slate-200 dark:bg-slate-950/40 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(event.id, event.completed, event.priority === "High")}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                            event.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 hover:border-accent dark:border-white/20"
                          }`}
                        >
                          {event.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                        <div>
                          <p className={`text-sm font-semibold text-ink dark:text-white ${event.completed ? "line-through text-slate-400" : ""}`}>
                            {event.title}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="h-3 w-3" /> {event.time}
                            </span>
                            <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[event.category]}`}>
                              {event.category}
                            </span>
                            <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[event.priority]}`}>
                              {event.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCalendarEvent(event.id)}
                        className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-rose-500 dark:hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Modal/Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              className="glass-panel w-full max-w-md p-6 shadow-xl"
            >
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">Create New Event</h3>
              <p className="text-xs text-slate-400 mt-1">Schedule task on {new Date(selectedDateStr).toLocaleDateString()}</p>

              <form onSubmit={handleAddEvent} className="mt-4 space-y-4">
                <InputField
                  required
                  label="Event Title"
                  placeholder="e.g. Mock SQL interview prep"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    type="time"
                    label="Time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    >
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-xl border py-2 text-xs font-medium transition ${
                          category === cat
                            ? "bg-accent border-accent text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:hover:bg-white/5 dark:text-slate-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Event
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
