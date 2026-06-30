import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLandingStory } from "./LandingStoryContext";
import { ProgressRing } from "./ProgressRing";
import { landingTokens } from "./designTokens";
import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";

export const RoadmapPreview = React.memo(() => {
  const { activePresetData, currentStep } = useLandingStory();
  const isSelectedStep = currentStep === "learn";

  // Simulate progress values
  const currentProgress = isSelectedStep ? 75 : 45;
  const milestones = activePresetData.milestones || [];

  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 h-full text-slate-800 dark:text-white">
      {/* Left Column: Roadmap list */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-tight text-slate-400 uppercase font-sans">
            Learning Curriculum
          </h4>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/35 text-blue-600 dark:text-blue-300 font-semibold">
            Active
          </span>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const isCompleted = idx === 0 || (idx === 1 && isSelectedStep);
            const isActive = idx === 1 && !isSelectedStep;
            
            return (
              <motion.div
                key={idx}
                layoutId={`roadmap-node-${idx}`}
                className={`p-3.5 ${landingTokens.radiusInner} transition-all duration-300 border ${
                  isActive
                    ? "border-blue-500 bg-blue-50/45 dark:bg-blue-950/20"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-slate-200/50 dark:border-white/5 bg-white/20 dark:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : isActive ? (
                    <PlayCircle className="w-5 h-5 text-blue-500 animate-pulse shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  
                  <span className={`text-sm font-semibold truncate ${
                    isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
                  }`}>
                    {m}
                  </span>

                  <ChevronRight className="w-4 h-4 ml-auto text-slate-400 shrink-0" />
                </div>

                {/* Simulated inner content expand */}
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 pl-8 border-l border-blue-500/30 space-y-1.5 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <div>• Core modules (4.5h video)</div>
                    <div>• 2 practical assignments</div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Mini analytics progress */}
      <div className="w-full md:w-44 flex flex-row md:flex-col items-center justify-around md:justify-center gap-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-white/5 p-4 rounded-2xl shrink-0">
        <ProgressRing
          size={96}
          strokeWidth={8}
          progress={currentProgress}
          color={activePresetData.accent}
        />
        
        <div className="text-center md:text-left space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Goal Pace
          </div>
          <div className="text-lg font-extrabold font-display">
            {currentProgress === 75 ? "+8.5 hrs" : "+4.0 hrs"}
          </div>
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Ahead of schedule
          </div>
        </div>
      </div>
    </div>
  );
});
export default RoadmapPreview;
