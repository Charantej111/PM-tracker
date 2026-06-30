import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLandingStory } from "./LandingStoryContext";
import { AnimatedChart } from "./AnimatedChart";
import { AnimatedCounter } from "./AnimatedCounter";
import { landingTokens } from "./designTokens";
import { FileText, Download, Loader2, Award, TrendingUp } from "lucide-react";

export const ReportsPreview = React.memo(() => {
  const { activePresetData, currentStep } = useLandingStory();
  const isSelectedStep = currentStep === "measure";
  const shouldReduceMotion = useReducedMotion();

  // Local state for the report generation sequence
  const [phase, setPhase] = useState("idle"); // "idle", "generating", "drawing", "ready"

  useEffect(() => {
    if (!isSelectedStep) {
      setPhase("idle");
      return;
    }

    setPhase("generating");

    const timer1 = setTimeout(() => {
      setPhase("drawing");
    }, 1200);

    const timer2 = setTimeout(() => {
      setPhase("ready");
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isSelectedStep]);

  const readinessScore = activePresetData.readiness || 80;

  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 h-full text-slate-800 dark:text-white relative overflow-hidden">
      {/* Left Column: Weekly study charts */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-tight text-slate-400 uppercase font-sans">
            Weekly Performance
          </h4>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.5% Efficiency</span>
          </div>
        </div>

        {/* Dynamic Chart Box */}
        <div className="bg-slate-50/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 p-3.5 rounded-2xl">
          {phase === "generating" ? (
            <div className="h-[140px] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
                Compiling study hours...
              </span>
            </div>
          ) : (
            <AnimatedChart
              type="line"
              data={isSelectedStep ? [25, 40, 30, 65, 55, 90] : [25, 30, 28, 45, 38, 50]}
              color={activePresetData.accent}
              height={140}
            />
          )}
        </div>
      </div>

      {/* Right Column: PDF Export & Readiness metrics */}
      <div className="w-full md:w-48 flex flex-col justify-between gap-4 shrink-0">
        {/* Readiness Index */}
        <div className="p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/45 dark:border-white/5 rounded-2xl relative">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Career Readiness
          </div>
          <div className="flex items-baseline gap-1.5">
            <AnimatedCounter
              value={phase === "idle" ? readinessScore - 12 : readinessScore}
              className="text-3xl font-extrabold font-display"
              suffix="%"
            />
            <span className="text-[10px] text-emerald-500 font-extrabold">+4.2%</span>
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Adapting to target role requirements
          </div>
        </div>

        {/* Export to PDF Card */}
        <div className="relative overflow-hidden bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/45 dark:border-white/5 p-3 rounded-2xl flex flex-col gap-2.5 h-[90px] justify-center">
          <AnimatePresence mode="wait">
            {phase === "ready" ? (
              <motion.div
                key="pdf-ready"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={shouldReduceMotion ? { duration: 0.1 } : landingTokens.spring}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">Report_Weekly.pdf</div>
                    <div className="text-[9px] text-slate-400 font-bold">2.4 MB • Complete</div>
                  </div>
                </div>

                <button className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : phase === "generating" || phase === "drawing" ? (
              <motion.div
                key="pdf-generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5"
              >
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Generating PDF...
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="pdf-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-400">Export PDF Report</div>
                    <div className="text-[9px] text-slate-500 font-medium">Ready to compile</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
export default ReportsPreview;
