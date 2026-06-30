import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { landingTokens } from "../landing-ui/designTokens";
import { CheckSquare, Compass, BarChart, GraduationCap, ArrowRight } from "lucide-react";
import SectionBg from "./SectionBg";

const STEPS = [
  { icon: CheckSquare,  label: "Check Planner Task",  desc: "Completes afternoon study session.", color: "text-blue-500", colorBg: "bg-blue-500/10" },
  { icon: Compass,      label: "Skills Recalculate",   desc: "Roadmap progress fills +8%.",        color: "text-indigo-500", colorBg: "bg-indigo-500/10" },
  { icon: GraduationCap, label: "Readiness Increases",  desc: "Dashboard indices rebuild.",          color: "text-emerald-500", colorBg: "bg-emerald-500/10" },
  { icon: BarChart,     label: "Report Regenerated",   desc: "Analytical PDF ready to export.",     color: "text-amber-500", colorBg: "bg-amber-500/10" },
];

export const EverythingConnected = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const id = setInterval(() => setActive(p => (p + 1) % 4), 3500);
    return () => clearInterval(id);
  }, [isInView]);

  return (
    <section
      ref={containerRef}
      id="chapter-connected"
      className="py-28 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300"
    >
      <SectionBg />
      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Connected System
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            A Single Linked Database
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Every action propagates. Completing a study session updates your roadmap, recalculates readiness, and refreshes your weekly report — automatically.
          </p>
        </div>

        {/* Chain */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 max-w-4xl mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = active === idx;
            return (
              <React.Fragment key={idx}>
                <motion.div
                  animate={isActive ? { scale: 1.03 } : { scale: 1 }}
                  transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 200, damping: 20 }}
                  className={`p-4 rounded-xl border transition-all duration-200 w-full md:w-48 text-left ${
                    isActive
                      ? "border-slate-200 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm"
                      : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded-lg ${isActive ? step.colorBg : "bg-slate-100 dark:bg-slate-800"}`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? step.color : "text-slate-400"}`} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Step {idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{step.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{step.desc}</div>
                </motion.div>

                {/* Connector between steps */}
                {idx < 3 && (
                  <>
                    <div className="hidden md:flex items-center">
                      <motion.div
                        animate={active === idx ? { scaleX: 1, opacity: 1 } : { scaleX: 0.3, opacity: 0.3 }}
                        className="w-8 h-0.5 bg-blue-500 rounded-full origin-left"
                        transition={{ duration: 0.3 }}
                      />
                      <ArrowRight className={`w-3 h-3 -ml-0.5 transition-colors ${active === idx ? "text-blue-500" : "text-slate-300 dark:text-slate-700"}`} />
                    </div>
                    <motion.div
                      animate={active === idx ? { scaleY: 1, opacity: 1 } : { scaleY: 0.3, opacity: 0.3 }}
                      className="md:hidden w-0.5 h-4 bg-blue-500 rounded-full origin-top"
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default EverythingConnected;
