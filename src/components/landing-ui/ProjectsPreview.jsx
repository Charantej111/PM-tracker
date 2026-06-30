import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLandingStory } from "./LandingStoryContext";
import { landingTokens } from "./designTokens";
import { Calendar, ChevronRight } from "lucide-react";

export const ProjectsPreview = React.memo(() => {
  const { activePresetData, currentStep } = useLandingStory();
  const isSelectedStep = currentStep === "build";
  const shouldReduceMotion = useReducedMotion();

  const presetProjects = activePresetData.projects || [];
  
  // Distribute projects into columns
  const columns = useMemo(() => {
    const todo = [];
    const inProgress = [];
    const completed = [];

    presetProjects.forEach((proj, idx) => {
      // Find where this card belongs
      if (proj.status === "Completed") {
        completed.push({ ...proj, id: `proj-${idx}` });
      } else if (proj.status === "In Progress") {
        if (isSelectedStep) {
          // Move from In Progress to Completed in active phase
          completed.push({ ...proj, id: `proj-${idx}`, status: "Completed" });
        } else {
          inProgress.push({ ...proj, id: `proj-${idx}` });
        }
      } else {
        todo.push({ ...proj, id: `proj-${idx}` });
      }
    });

    return { todo, inProgress, completed };
  }, [presetProjects, isSelectedStep]);

  return (
    <div className="flex flex-col h-full p-5 text-slate-800 dark:text-white">
      {/* Title block */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold tracking-tight text-slate-400 uppercase font-sans">
          Kanban Board
        </h4>
        <div className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          Build & Ship Artifacts
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Column 1: To Do */}
        <div className="flex flex-col min-h-[140px] bg-slate-50/40 dark:bg-slate-900/25 border border-dashed border-slate-200 dark:border-white/5 p-3 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">To Do</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-bold">
              {columns.todo.length}
            </span>
          </div>

          <div className="space-y-2">
            {columns.todo.map((card) => (
              <ProjectCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col min-h-[140px] bg-slate-50/40 dark:bg-slate-900/25 border border-dashed border-slate-200 dark:border-white/5 p-3 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
              {columns.inProgress.length}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {columns.inProgress.map((card) => (
              <ProjectCard key={card.id} card={card} />
            ))}
            {columns.inProgress.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-600 font-medium py-8">
                Empty
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Shipped / Completed */}
        <div className="flex flex-col min-h-[140px] bg-slate-50/40 dark:bg-slate-900/25 border border-dashed border-slate-200 dark:border-white/5 p-3 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shipped</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
              {columns.completed.length}
            </span>
          </div>

          <div className="space-y-2">
            {columns.completed.map((card) => (
              <ProjectCard key={card.id} card={card} isCompleted={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const ProjectCard = ({ card, isCompleted = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const accent = "#3762eb"; // Can expand presets

  return (
    <motion.div
      layoutId={card.id}
      transition={shouldReduceMotion ? { duration: 0.1 } : landingTokens.spring}
      className={`p-3 bg-white dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/5 ${landingTokens.radiusInner} shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-white/10 transition-colors`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold truncate leading-tight">{card.title}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold shrink-0 ${
          card.priority === "High"
            ? "bg-rose-500/10 text-rose-500"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
        }`}>
          {card.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Jul 30</span>
        </div>

        {isCompleted ? (
          <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            SHIPPED
          </span>
        ) : (
          <span className="text-blue-500 font-extrabold bg-blue-500/10 px-1.5 py-0.5 rounded">
            DEV
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectsPreview;
