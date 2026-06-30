import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { landingTokens } from "../landing-ui/designTokens";
import { Brain, Cpu, MessageSquare, Briefcase } from "lucide-react";

const PHASES = [
  {
    quarter:  "2026 Q3",
    title:    "AI Career Coach",
    icon:     MessageSquare,
    progress: 100,
    status:   "Complete",
    accent:   "text-emerald-500",
    badge:    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    bar:      "bg-emerald-500",
  },
  {
    quarter:  "2026 Q4",
    title:    "Skill Gap Analysis",
    icon:     Brain,
    progress: 60,
    status:   "Training…",
    accent:   "text-blue-500",
    badge:    "bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse",
    bar:      "bg-blue-500",
  },
  {
    quarter:  "2027 Q1",
    title:    "Resume Review AI",
    icon:     Briefcase,
    progress: 40,
    status:   "Coming Soon",
    accent:   "text-amber-500",
    badge:    "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    bar:      "bg-amber-500",
  },
  {
    quarter:  "2027 Q2",
    title:    "Interview Simulator",
    icon:     Cpu,
    progress: 15,
    status:   "Research Phase",
    accent:   "text-slate-400",
    badge:    "bg-white/5 text-slate-400 border border-white/8",
    bar:      "bg-slate-600",
  },
];

export const FutureRoadmap = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      id="chapter-ai"
      className="py-28 relative overflow-hidden bg-[#030712] border-y border-white/5 transition-colors duration-300"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-blue-700/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>07</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Future Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            AI Labs Development Roadmap
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Unveiling our intelligence roadmap. Follow our engineering milestones as we train and deploy AI career modules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto pt-4">
          {PHASES.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={idx}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...landingTokens.spring, delay: idx * 0.08 }}
                className="bg-white/5 border border-white/8 rounded-2xl p-5 flex flex-col justify-between h-52 hover:bg-white/8 transition-colors duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      {phase.quarter}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${phase.badge}`}>
                      {phase.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/8 shrink-0">
                      <Icon className={`w-5 h-5 ${phase.accent}`} />
                    </div>
                    <span className="text-sm font-bold text-white leading-snug">{phase.title}</span>
                  </div>
                </div>

                <div className="space-y-1.5 mt-auto">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Progress</span>
                    <span className={phase.accent}>{phase.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${phase.progress}%` } : {}}
                      transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 1.1, ease: "easeOut", delay: idx * 0.1 }}
                      className={`h-full rounded-full ${phase.bar}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FutureRoadmap;
