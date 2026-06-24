import { ChevronDown, NotebookPen } from "lucide-react";
import { useState } from "react";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import Slider from "../components/Slider";
import { useAppContext } from "../context/AppContext";
import { average } from "../utils/helpers";

function RoadmapTopicRow({ category, topic, updateRoadmapTopic, deleteRoadmapTopic }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(topic.name);
  const [localNotes, setLocalNotes] = useState(topic.notes || "");
  const [isNotesDirty, setIsNotesDirty] = useState(false);

  const handleNotesChange = (e) => {
    setLocalNotes(e.target.value);
    setIsNotesDirty(true);
  };

  const handleSaveNotes = () => {
    updateRoadmapTopic(category, topic.id, { notes: localNotes });
    setIsNotesDirty(false);
  };

  const handleRename = () => {
    if (editedName.trim()) {
      updateRoadmapTopic(category, topic.id, { name: editedName });
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200/80 p-5 dark:border-white/10 bg-white/50 dark:bg-black/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl flex-1">
          <div className="flex items-start gap-3">
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
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="input-shell py-1 px-3 text-base"
                  />
                  <button
                    onClick={handleRename}
                    className="btn-primary py-1 px-3 text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(topic.name);
                      setIsEditing(false);
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-ink dark:text-white">{topic.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-accent hover:underline"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteRoadmapTopic(category, topic.id)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
              <div className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {topic.notes || "No extra info provided."}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Completion</span>
            <span>{topic.progress}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            value={topic.progress}
            onChange={(val) =>
              updateRoadmapTopic(category, topic.id, {
                progress: val,
                completed: val === 100,
              })
            }
            className="w-full mt-2"
          />

          <div className="space-y-2">
            <textarea
              value={localNotes}
              onChange={handleNotesChange}
              rows={3}
              className="input-shell w-full"
              placeholder="Capture notes, examples, or applied exercises"
            />
            {isNotesDirty && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  className="btn-primary py-1 px-3 text-xs"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <NotebookPen className="mt-0.5 h-4 w-4 text-accent" />
            Update notes by editing this topic when you connect it to a real artifact or exercise.
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTopicForm({ category, addRoadmapTopic }) {
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addRoadmapTopic(category, name.trim());
      setName("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 rounded-[28px] border border-dashed border-slate-300 dark:border-white/10 text-slate-500 hover:text-accent hover:border-accent text-sm font-semibold transition"
      >
        + Add custom topic to {category}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-dashed border-accent rounded-[28px] space-y-3 bg-white/50 dark:bg-black/20">
      <h4 className="text-sm font-semibold text-ink dark:text-white">Add new topic to {category}</h4>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Topic name (e.g. A/B Testing Best Practices)"
          className="input-shell flex-1"
          required
        />
        <button type="submit" className="btn-primary py-2 px-4 text-sm">Add</button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function RoadmapPage() {
  const { currentUserData, updateRoadmapTopic, addRoadmapTopic, deleteRoadmapTopic } = useAppContext();
  const [open, setOpen] = useState(Object.keys(currentUserData?.roadmap || {})[0] || "");

  const roadmapData = currentUserData?.roadmap || {};

  return (
    <PageShell
      title="Product Manager Roadmap"
      description="Expand each discipline, mark progress, and capture notes as your PM foundation deepens."
    >
      <div className="space-y-4">
        {Object.entries(roadmapData).map(([category, topics]) => {
          const categoryProgress = topics.length > 0 ? average(topics.map((topic) => topic.progress)) : 0;
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
                    <RoadmapTopicRow
                      key={topic.id}
                      category={category}
                      topic={topic}
                      updateRoadmapTopic={updateRoadmapTopic}
                      deleteRoadmapTopic={deleteRoadmapTopic}
                    />
                  ))}
                  <AddTopicForm category={category} addRoadmapTopic={addRoadmapTopic} />
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
