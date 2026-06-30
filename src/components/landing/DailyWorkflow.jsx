import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useLandingStory } from "../landing-ui/LandingStoryContext";
import { landingTokens } from "../landing-ui/designTokens";
import { Sun, Moon, BookOpen, Briefcase, BarChart } from "lucide-react";
import SectionBg from "./SectionBg";

export const DailyWorkflow = () => {
  const { activePresetData } = useLandingStory();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const [activeIdx, setActiveIdx] = useState(0);

  const routine = [
    {
      time: "08:00", label: "Morning Focus", icon: Sun,
      color: "text-amber-500", colorBg: "bg-amber-500/10",
      accentColor: "#f59e0b",
      title: "Open Daily Planner",
      desc: "Check off your priority list and plan focus blocks.",
      detail: activePresetData.planner.morning
    },
    {
      time: "13:00", label: "Afternoon Study", icon: BookOpen,
      color: "text-blue-500", colorBg: "bg-blue-500/10",
      accentColor: "#3762eb",
      title: "Continue Roadmap",
      desc: "Learn core skills through guided exercises.",
      detail: activePresetData.milestones[0]
    },
    {
      time: "18:00", label: "Evening Ship", icon: Briefcase,
      color: "text-indigo-500", colorBg: "bg-indigo-500/10",
      accentColor: "#6366f1",
      title: "Ship Projects",
      desc: "Update your portfolio boards and drag cards.",
      detail: activePresetData.projects[0].title
    },
    {
      time: "22:00", label: "Night Reflections", icon: Moon,
      color: "text-purple-500", colorBg: "bg-purple-500/10",
      accentColor: "#a855f7",
      title: "Compile Reports",
      desc: "Review logs, save PDF statistics, and log hours.",
      detail: activePresetData.planner.night
    }
  ];

  useEffect(() => {
    if (!isInView) return;
    const id = setInterval(() => setActiveIdx(p => (p + 1) % 4), 4000);
    return () => clearInterval(id);
  }, [isInView]);

  const active = routine[activeIdx];
  const ActiveIcon = active.icon;

  return (
    <section
      ref={containerRef}
      id="chapter-workflow"
      className="py-28 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300"
    >
      <SectionBg />
      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Daily Routine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Built for Your Daily Routine
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            See how the system fits naturally into your day — from morning planning to evening reflections.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">

          {/* Timeline list */}
          <div className="lg:col-span-5 space-y-2">
            {routine.map((step, idx) => {
              const isActive = activeIdx === idx;
              const StepIcon = step.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3.5 focus:outline-none ${
                    isActive
                      ? "border-slate-200 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-white/3"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? `${step.colorBg} ${step.color}` : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                      <span className="font-mono">{step.time}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="uppercase tracking-wider font-bold">{step.label}</span>
                    </div>
                    <div className={`text-sm font-bold mt-0.5 truncate ${isActive ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                      {step.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview card */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${active.colorBg}`}>
                    <ActiveIcon className={`w-4 h-4 ${active.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {active.time} · {active.label}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Preview</span>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">{active.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{active.desc}</p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-xl">
                  {activeIdx === 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[8px] font-black">✓</span>
                        </div>
                        <span className="text-xs font-medium text-slate-400 line-through">{active.detail}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 shrink-0" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Draft presentation updates</span>
                      </div>
                    </div>
                  )}
                  {activeIdx === 1 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Milestone progress</span>
                        <span className="text-blue-500">80%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 0.8 }} />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Next: {activePresetData.milestones[1]}</span>
                    </div>
                  )}
                  {activeIdx === 2 && (
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">{active.detail}</div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">High Priority</div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">Shipped</span>
                    </div>
                  )}
                  {activeIdx === 3 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                          <BarChart className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Log complete</div>
                          <div className="text-[9px] text-slate-500 font-medium">{active.detail}</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-bold text-slate-600 dark:text-slate-300">2.4h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DailyWorkflow;
