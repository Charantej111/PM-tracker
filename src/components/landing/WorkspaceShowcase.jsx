import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLandingStory, STORY_STEPS } from "../landing-ui/LandingStoryContext";
import { RoadmapPreview }   from "../landing-ui/RoadmapPreview";
import { PlannerPreview }   from "../landing-ui/PlannerPreview";
import { ProjectsPreview }  from "../landing-ui/ProjectsPreview";
import { ReportsPreview }   from "../landing-ui/ReportsPreview";
import { PortfolioPreview } from "../landing-ui/PortfolioPreview";
import { landingTokens }    from "../landing-ui/designTokens";
import { Calendar, Compass, ListTodo, Presentation, LineChart } from "lucide-react";

import SectionBg from "./SectionBg";

const TABS = [
  { key: "plan",    label: "Plan",    icon: ListTodo,     subtitle: "Daily Planner"    },
  { key: "learn",   label: "Learn",   icon: Compass,      subtitle: "Learning Roadmap" },
  { key: "build",   label: "Build",   icon: Calendar,     subtitle: "Projects Kanban"  },
  { key: "measure", label: "Measure", icon: LineChart,    subtitle: "Weekly Reviews"   },
  { key: "grow",    label: "Grow",    icon: Presentation, subtitle: "Portfolio Goals"  },
];

const renderPreview = (step) => {
  switch (step) {
    case "plan":    return <PlannerPreview />;
    case "learn":   return <RoadmapPreview />;
    case "build":   return <ProjectsPreview />;
    case "measure": return <ReportsPreview />;
    case "grow":    return <PortfolioPreview />;
    default:        return <PlannerPreview />;
  }
};

export const WorkspaceShowcase = () => {
  const { currentStep, selectStep, isPlaying, startAutoplay } = useLandingStory();
  const shouldReduceMotion = useReducedMotion();
  const activeIdx = TABS.findIndex(t => t.key === currentStep);

  return (
    <section
      id="chapter-showcase"
      className="py-28 relative overflow-hidden bg-slate-50 dark:bg-[#080c14] border-y border-slate-100 dark:border-white/5 transition-colors duration-300"
    >
      <SectionBg variant="gray" />
      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span>02</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Build Your System</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            One Platform. Five Workflows.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Click any tab to explore each module. Click to pause the simulation and interact freely.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex justify-center">
          <div className="flex items-center p-1.5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/8 rounded-2xl w-full max-w-2xl overflow-x-auto scrollbar-none gap-1 shadow-sm">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentStep === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => selectStep(tab.key)}
                  className={`relative flex items-center justify-center gap-2 flex-1 min-w-[90px] py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 focus:outline-none ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-showcase-tab"
                      className="absolute inset-0 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/8 rounded-xl shadow-sm z-0"
                      transition={shouldReduceMotion ? { duration: 0.1 } : landingTokens.spring}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10 shrink-0" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress dots (mobile context) */}
        <div className="flex justify-center gap-1.5 sm:hidden">
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => selectStep(tab.key)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                i === activeIdx ? "w-6 bg-blue-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"
              }`}
              aria-label={tab.label}
            />
          ))}
        </div>

        {/* Simulator window */}
        <div className="max-w-4xl mx-auto">
          <div className={`${landingTokens.glassSolid} ${landingTokens.radius} ${landingTokens.shadowSoft} overflow-hidden flex flex-col border border-slate-200/60 dark:border-white/8`}>
            {/* Window chrome */}
            <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/40 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                {isPlaying ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    <span>Autoplay Active — {TABS.find(t => t.key === currentStep)?.subtitle}</span>
                  </>
                ) : (
                  <button onClick={startAutoplay} className="hover:text-blue-500 transition-colors">
                    ↺ Resume Loop
                  </button>
                )}
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 bg-white/30 dark:bg-slate-950/30 backdrop-blur-sm min-h-[360px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.28, ease: "easeInOut" }}
                  className="h-full"
                >
                  {renderPreview(currentStep)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
export default WorkspaceShowcase;
