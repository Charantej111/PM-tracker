import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLandingStory } from "./LandingStoryContext";
import { landingTokens } from "./designTokens";
import { Check, Flame } from "lucide-react";

export const PlannerPreview = React.memo(() => {
  const { activePresetData, currentStep } = useLandingStory();
  const isSelectedStep = currentStep === "plan";
  const shouldReduceMotion = useReducedMotion();

  const plannerItems = activePresetData.planner || {};

  const blocks = [
    { time: "08:00", label: "Morning Routine", task: plannerItems.morning, status: "completed" },
    { time: "13:00", label: "Afternoon Block", task: plannerItems.afternoon, status: isSelectedStep ? "completed" : "pending" },
    { time: "18:00", label: "Evening Review", task: plannerItems.evening, status: "pending" },
    { time: "22:00", label: "Night Summary", task: plannerItems.night, status: "pending" }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 h-full text-slate-800 dark:text-white">
      {/* Daily schedule block list */}
      <div className="flex-1 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-tight text-slate-400 uppercase font-sans">
            Daily Planner
          </h4>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Today's Schedule
          </span>
        </div>

        <div className="space-y-2.5">
          {blocks.map((block, idx) => {
            const isCompleted = block.status === "completed";
            
            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 p-3 ${landingTokens.radiusInner} border ${
                  isCompleted
                    ? "border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5"
                    : "border-slate-200/50 dark:border-white/5 bg-white/20 dark:bg-white/5"
                }`}
              >
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 w-10">
                  {block.time}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    {block.label}
                  </div>
                  <div className={`text-xs font-semibold truncate ${
                    isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
                  }`}>
                    {block.task}
                  </div>
                </div>

                {/* Checkbox box animation */}
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={shouldReduceMotion ? { duration: 0.1 } : landingTokens.spring}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap / Daily consistency streak */}
      <div className="w-full md:w-44 flex flex-row md:flex-col items-center justify-around md:justify-center gap-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-white/5 p-4 rounded-2xl shrink-0">
        <div className="text-center space-y-1">
          <div className="relative inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className={`w-8 h-8 ${isSelectedStep ? "animate-bounce" : ""}`} />
            {isSelectedStep && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-2xl font-extrabold font-display mt-1">
            {isSelectedStep ? "18 Days" : "17 Days"}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Current Streak
          </div>
        </div>

        {/* Mini consistency grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 14 }).map((_, i) => {
            // Fill past days, animate active one
            const isToday = i === 12;
            const isActive = isToday && isSelectedStep;
            const isFilled = i < 12 || isActive;
            
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500 scale-110 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : isFilled
                    ? "bg-amber-400/70 dark:bg-amber-600/60"
                    : "bg-slate-200/50 dark:bg-slate-800"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
export default PlannerPreview;
