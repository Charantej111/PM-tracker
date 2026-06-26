import React, { useState, useEffect } from "react";
import { ChevronDown, NotebookPen, GripVertical, Plus } from "lucide-react";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import Slider from "../components/Slider";
import { useAppContext } from "../context/AppContext";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function getStatusBadge(status) {
  switch (status) {
    case "Completed":
      return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>;
    case "Practicing":
      return <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Practicing</span>;
    case "Learning":
      return <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Learning</span>;
    default:
      return <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Not Started</span>;
  }
}

function getPriorityBadge(priority) {
  switch (priority) {
    case "High":
      return <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">High</span>;
    case "Low":
      return <span className="text-slate-500 bg-slate-50 dark:bg-slate-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Low</span>;
    default:
      return <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Med</span>;
  }
}

function SortableSubTopicRow({ category, topic, updateSubTopic, deleteSubTopic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(topic.name);
  const [localNotes, setLocalNotes] = useState(topic.notes || "");
  const [isNotesDirty, setIsNotesDirty] = useState(false);
  
  // Local state for smooth slider dragging
  const [localProgress, setLocalProgress] = useState(topic.progress);

  useEffect(() => {
    setLocalProgress(topic.progress);
  }, [topic.progress]);

  const handleNotesChange = (e) => {
    setLocalNotes(e.target.value);
    setIsNotesDirty(true);
  };

  const handleSaveNotes = () => {
    updateSubTopic(category, topic.id, { notes: localNotes });
    setIsNotesDirty(false);
  };

  const handleRename = () => {
    if (editedName.trim()) {
      updateSubTopic(category, topic.id, { name: editedName });
      setIsEditing(false);
    }
  };

  const handleProgressChange = (val) => {
    setLocalProgress(val);
    updateSubTopic(category, topic.id, {
      progress: val,
      completed: val === 100,
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[28px] border border-slate-200/80 p-5 dark:border-white/10 bg-white/50 dark:bg-black/20 ${
        isDragging ? "opacity-50 ring-2 ring-accent" : ""
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl flex-1">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <input
              type="checkbox"
              checked={topic.completed}
              onChange={(event) =>
                updateSubTopic(category, topic.id, {
                  completed: event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2 flex-wrap">
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
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-base font-semibold text-ink dark:text-white">{topic.name}</span>
                  {getPriorityBadge(topic.priority)}
                  {getStatusBadge(topic.status)}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-accent hover:underline ml-2"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this sub topic?")) {
                        deleteSubTopic(category, topic.id);
                      }
                    }}
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
            <span>{localProgress}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            value={localProgress}
            onChange={handleProgressChange}
            className="w-full mt-2"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium w-24">Est. Hours:</span>
            <input
               type="number"
               min="0"
               step="0.5"
               value={topic.estimatedHours || ""}
               onChange={(e) => updateSubTopic(category, topic.id, { estimatedHours: parseFloat(e.target.value) || null })}
               placeholder="Optional"
               className="input-shell flex-1 py-1 px-2 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium w-24">Priority:</span>
            <select
               value={topic.priority}
               onChange={(e) => updateSubTopic(category, topic.id, { priority: e.target.value })}
               className="input-shell flex-1 py-1 px-2 text-xs bg-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <textarea
              value={localNotes}
              onChange={handleNotesChange}
              rows={2}
              className="input-shell w-full text-sm"
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
        </div>
      </div>
    </div>
  );
}

function AddTopicForm({ category, addSubTopic }) {
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addSubTopic(category, name.trim());
      setName("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 rounded-[28px] border border-dashed border-slate-300 dark:border-white/10 text-slate-500 hover:text-accent hover:border-accent text-sm font-semibold transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Sub Topic
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-dashed border-accent rounded-[28px] space-y-3 bg-white/50 dark:bg-black/20">
      <h4 className="text-sm font-semibold text-ink dark:text-white">Add Sub Topic to {category}</h4>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sub Topic name"
          className="input-shell flex-1 min-w-[200px]"
          required
          autoFocus
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

function SortableMainTopicCard({ 
  mainTopic, 
  topics, 
  isOpen, 
  setOpen, 
  renameMainTopic, 
  deleteMainTopic,
  updateSubTopic,
  deleteSubTopic,
  addSubTopic,
  reorderSubTopics
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mainTopic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(mainTopic.name);
  
  const completedCount = topics.filter(t => t.completed).length;
  const categoryProgress = topics.length > 0 ? Math.round(topics.reduce((acc, t) => acc + t.progress, 0) / topics.length) : 0;

  const handleRename = () => {
    if (editedName.trim() && editedName !== mainTopic.name) {
      renameMainTopic(mainTopic.name, editedName.trim());
    }
    setIsEditing(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = topics.findIndex((t) => t.id === active.id);
      const newIndex = topics.findIndex((t) => t.id === over.id);
      const reorderedList = arrayMove(topics, oldIndex, newIndex);
      reorderSubTopics(mainTopic.name, reorderedList);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`${isDragging ? 'opacity-50' : ''}`}>
      <Card hover={false} className="overflow-hidden">
        <div className="flex items-center gap-2">
           <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <GripVertical className="h-5 w-5" />
           </div>
           
           <div className="flex-1 flex w-full items-center justify-between gap-4">
             {isEditing ? (
               <div className="flex items-center gap-2 w-full max-w-sm flex-wrap">
                 <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="input-shell py-1 px-3 flex-1 min-w-[150px]"
                    autoFocus
                 />
                 <button onClick={handleRename} className="btn-primary py-1 px-3 text-xs">Save</button>
                 <button onClick={() => { setEditedName(mainTopic.name); setIsEditing(false); }} className="text-sm text-slate-500 px-2">Cancel</button>
               </div>
             ) : (
               <div className="flex flex-col text-left flex-1 cursor-pointer" onClick={() => setOpen(isOpen ? "" : mainTopic.name)}>
                 <div className="flex items-center gap-3">
                   <h3 className="text-xl font-semibold text-ink dark:text-white">{mainTopic.name}</h3>
                   <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="text-xs text-accent hover:underline hidden md:block">Rename</button>
                   <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this main topic and all its sub topics?")) deleteMainTopic(mainTopic.name); }} className="text-xs text-rose-500 hover:underline hidden md:block">Delete</button>
                 </div>
                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                   {completedCount} of {topics.length} sub topics completed
                 </p>
               </div>
             )}
             
             <button onClick={() => setOpen(isOpen ? "" : mainTopic.name)} className="flex items-center gap-3">
                <div className="rounded-full bg-accent-soft/10 px-3 py-1 text-xs font-semibold text-accent">
                  {categoryProgress}%
                </div>
                <ChevronDown className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} />
             </button>
           </div>
        </div>

        {isOpen && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="grid gap-4 mb-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  {topics.map((topic) => (
                    <SortableSubTopicRow
                      key={topic.id}
                      category={mainTopic.name}
                      topic={topic}
                      updateSubTopic={updateSubTopic}
                      deleteSubTopic={deleteSubTopic}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {topics.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-500">
                  No sub topics added yet.
                </div>
              )}
            </div>
            <AddTopicForm category={mainTopic.name} addSubTopic={addSubTopic} />
          </div>
        )}
      </Card>
    </div>
  );
}

export default function RoadmapPage() {
  const { 
    currentUserData, 
    addMainTopic, 
    renameMainTopic, 
    deleteMainTopic, 
    reorderMainTopics,
    addSubTopic, 
    updateSubTopic, 
    deleteSubTopic,
    reorderSubTopics
  } = useAppContext();
  
  const [open, setOpen] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const roadmapData = currentUserData?.roadmap || { mainTopics: [], byCategory: {} };
  const mainTopics = roadmapData.mainTopics || [];
  
  // Set default open section if none is open and there are topics
  useEffect(() => {
    if (!open && mainTopics.length > 0) {
      setOpen(mainTopics[0].name);
    }
  }, [mainTopics.length, open]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = mainTopics.findIndex((t) => t.id === active.id);
      const newIndex = mainTopics.findIndex((t) => t.id === over.id);
      const reorderedList = arrayMove(mainTopics, oldIndex, newIndex);
      reorderMainTopics(reorderedList);
    }
  };
  
  const handleAddMainTopic = (e) => {
    e.preventDefault();
    if (newTopicName.trim()) {
      addMainTopic(newTopicName.trim());
      setNewTopicName("");
      setIsAddingTopic(false);
      setOpen(newTopicName.trim());
    }
  };

  return (
    <PageShell
      title="Personal Learning Roadmap"
      description="Build your custom curriculum. Add Main Topics, break them down into Sub Topics, and track your progress."
    >
      <div className="mb-8">
        {!isAddingTopic ? (
           <button onClick={() => setIsAddingTopic(true)} className="btn-primary py-2 px-4 flex items-center gap-2">
             <Plus className="w-4 h-4" /> New Main Topic
           </button>
        ) : (
           <form onSubmit={handleAddMainTopic} className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl">
             <input
               type="text"
               value={newTopicName}
               onChange={(e) => setNewTopicName(e.target.value)}
               placeholder="e.g. Product Strategy, SQL, UX Design"
               className="input-shell flex-1 min-w-[200px]"
               autoFocus
               required
             />
             <button type="submit" className="btn-primary py-2 px-4">Create</button>
             <button type="button" onClick={() => setIsAddingTopic(false)} className="text-sm text-slate-500 hover:text-ink dark:hover:text-white px-2">Cancel</button>
           </form>
        )}
      </div>

      <div className="space-y-4">
        {mainTopics.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-300 dark:border-white/10">
             <div className="text-4xl mb-4">🗺️</div>
             <h3 className="text-lg font-semibold text-ink dark:text-white mb-2">Your roadmap is empty</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first Main Topic to start building your personal curriculum.</p>
             <button onClick={() => setIsAddingTopic(true)} className="btn-primary py-2 px-6">Create Main Topic</button>
           </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={mainTopics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {mainTopics.map((mainTopic) => {
                const topics = roadmapData.byCategory[mainTopic.name] || [];
                return (
                  <SortableMainTopicCard
                    key={mainTopic.id}
                    mainTopic={mainTopic}
                    topics={topics}
                    isOpen={open === mainTopic.name}
                    setOpen={setOpen}
                    renameMainTopic={renameMainTopic}
                    deleteMainTopic={deleteMainTopic}
                    updateSubTopic={updateSubTopic}
                    deleteSubTopic={deleteSubTopic}
                    addSubTopic={addSubTopic}
                    reorderSubTopics={reorderSubTopics}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </PageShell>
  );
}
