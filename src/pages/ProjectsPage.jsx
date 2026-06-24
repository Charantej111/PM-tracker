import { CalendarClock, Grip, StickyNote, Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Card from "../components/Card";
import Button from "../components/Button";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import Slider from "../components/Slider";
import { useAppContext } from "../context/AppContext";
import { formatShortDate } from "../utils/helpers";

const columns = ["To Do", "In Progress", "Completed"];

function ProjectCard({ project, updateProject, deleteProject, onStartEdit }) {
  const [notesText, setNotesText] = useState(project.notes || "");

  useEffect(() => {
    setNotesText(project.notes || "");
  }, [project.notes]);

  const hasChanges = notesText !== (project.notes || "");

  const handleSaveNotes = () => {
    updateProject(project.id, { notes: notesText });
  };

  return (
    <div
      draggable
      onDragStart={(event) => event.dataTransfer.setData("projectId", project.id)}
      className="cursor-grab rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-accent/20 dark:border-white/10 dark:bg-slate-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-lg font-semibold text-ink dark:text-white leading-snug">{project.title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              project.priority === "High"
                ? "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/30"
                : project.priority === "Low"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30"
                : "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/30"
            }`}>
              {project.priority} priority
            </span>
            <span className="inline-flex rounded-full bg-accent-soft/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
              {project.tag || "PM"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onStartEdit(project)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400 hover:text-accent"
            title="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => deleteProject(project.id)}
            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition"
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="text-slate-300 dark:text-slate-700 cursor-grab">
            <Grip className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <CalendarClock className="h-4 w-4 text-accent" />
        {formatShortDate(project.deadline)}
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-900">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
      </div>

      <label className="mt-4 block text-sm text-slate-500 dark:text-slate-400">
        <span className="flex justify-between font-medium">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </span>
        <Slider
          min={0}
          max={100}
          value={project.progress}
          onChange={(val) =>
            updateProject(project.id, {
              progress: val,
              status: val === 100 ? "Completed" : project.status,
            })
          }
          className="mt-3"
        />
      </label>

      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-accent" />
            Notes
          </div>
          {hasChanges && (
            <button
              onClick={handleSaveNotes}
              className="text-xs font-bold text-accent hover:underline bg-accent-soft/10 px-2 py-0.5 rounded-lg"
            >
              Save
            </button>
          )}
        </div>
        <textarea
          value={notesText}
          onChange={(event) => setNotesText(event.target.value)}
          rows={3}
          className="w-full bg-transparent text-sm leading-6 text-slate-600 outline-none dark:text-slate-300 resize-none"
        />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { currentUserData, updateProject, addProject, deleteProject } = useAppContext();

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // Add/Edit states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tag, setTag] = useState("PM");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("To Do");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setDeadline("");
    setPriority("Medium");
    setTag("PM");
    setProgress(0);
    setStatus("To Do");
    setNotes("");
    setShowAddForm(false);
    setEditingProject(null);
  };

  const handleStartEdit = (project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDeadline(project.deadline);
    setPriority(project.priority);
    setTag(project.tag || "PM");
    setProgress(project.progress);
    setStatus(project.status);
    setNotes(project.notes || "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    const payload = {
      title: title.trim(),
      deadline,
      priority,
      tag: tag.trim(),
      progress: Number(progress),
      status,
      notes: notes.trim(),
    };

    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject(payload);
    }
    resetForm();
  };

  const onDragStart = (event, projectId) => {
    event.dataTransfer.setData("projectId", projectId);
  };

  const onDrop = (event, colStatus) => {
    event.preventDefault();
    const projectId = event.dataTransfer.getData("projectId");
    const progressVal = colStatus === "Completed" ? 100 : colStatus === "In Progress" ? 60 : 20;
    updateProject(projectId, { status: colStatus, progress: progressVal });
  };

  return (
    <PageShell
      title="Project Tracker"
      description="Move projects through a clean kanban flow, adjust progress, and keep every portfolio artifact visible."
      actions={
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <Card
            key={column}
            className="min-h-[520px]"
            hover={false}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-white">{column}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {currentUserData.projects.filter((project) => project.status === column).length} items
                </p>
              </div>
              <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                {column}
              </div>
            </div>

            <div
              className="mt-5 space-y-4 rounded-[28px] border border-dashed border-slate-200/80 p-3 dark:border-white/10 min-h-[400px]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, column)}
            >
              {currentUserData.projects
                .filter((project) => project.status === column)
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    updateProject={updateProject}
                    deleteProject={deleteProject}
                    onStartEdit={handleStartEdit}
                  />
                ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Project Form Modal (Add / Edit) */}
      <AnimatePresence>
        {(showAddForm || editingProject) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-ink dark:text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Define title, target deadline, and priority.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <InputField
                  label="Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SQL cohort case study"
                />

                <InputField
                  label="Deadline"
                  required
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <InputField
                    label="Tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Portfolio"
                  />
                </div>

                {editingProject && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Progress (%)"
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Project specs, repository links, or next key steps..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white resize-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProject ? "Save Changes" : "Create Project"}
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
