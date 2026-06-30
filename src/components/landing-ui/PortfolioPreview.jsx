import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLandingStory } from "./LandingStoryContext";
import { landingTokens } from "./designTokens";
import { CheckCircle2, Circle, GraduationCap } from "lucide-react";

export const PortfolioPreview = React.memo(() => {
  const { activePresetData, currentStep } = useLandingStory();
  const isSelectedStep = currentStep === "grow";
  const shouldReduceMotion = useReducedMotion();

  const portfolioGoals = activePresetData.portfolioGoals || [];

  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 h-full text-slate-800 dark:text-white">
      {/* Left Column: Goals checklist */}
      <div className="flex-1 space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-tight text-slate-400 uppercase font-sans">
            Portfolio Milestones
          </h4>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400">
            Career Readiness
          </span>
        </div>

        <div className="space-y-2.5">
          {portfolioGoals.map((goal, idx) => {
            // Let's make the 2nd goal complete when "grow" is active
            const isTargetGoal = idx === 1;
            const isCompleted = goal.completed || (isTargetGoal && isSelectedStep);
            const currentGoalProgress = isCompleted ? 100 : isTargetGoal ? 45 : goal.progress;
            
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border ${
                  isCompleted
                    ? "border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5"
                    : "border-slate-200/50 dark:border-white/5 bg-white/20 dark:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <span className={`text-xs font-bold truncate leading-tight ${
                      isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
                    }`}>
                      {goal.title}
                    </span>
                  </div>

                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold shrink-0 ${
                    isCompleted
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {goal.deadline}
                  </span>
                </div>

                {/* Progress bar slider */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: `${goal.progress}%` }}
                      animate={{ width: `${currentGoalProgress}%` }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.1 }
                          : { ...landingTokens.spring, delay: 0.1 }
                      }
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: isCompleted ? "#10b981" : activePresetData.accent
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                    <span>{goal.milestone}</span>
                    <span>{currentGoalProgress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Readiness and badge metrics */}
      <div className="w-full md:w-44 flex flex-row md:flex-col items-center justify-around md:justify-center gap-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-white/5 p-4 rounded-2xl shrink-0">
        <div className="text-center space-y-1">
          <div className="relative inline-flex items-center justify-center p-3 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <GraduationCap className={`w-8 h-8 ${isSelectedStep ? "animate-bounce" : ""}`} />
          </div>
          <div className="text-2xl font-extrabold font-display mt-1">
            {isSelectedStep ? "92%" : "85%"}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Job Match Score
          </div>
        </div>

        <div className="text-center">
          <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
            Completed:
          </div>
          <div className="text-sm font-extrabold text-emerald-500 mt-0.5">
            {isSelectedStep ? "2 of 3 goals" : "1 of 3 goals"}
          </div>
        </div>
      </div>
    </div>
  );
});
export default PortfolioPreview;
