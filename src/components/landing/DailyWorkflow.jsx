import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useLandingStory } from "../landing-ui/LandingStoryContext";
import { landingTokens } from "../landing-ui/designTokens";
import { Sun, Moon, BookOpen, Briefcase, BarChart } from "lucide-react";
import SectionBg from "./SectionBg";

export const DailyWorkflow = () => {
  const { activePresetData } = useLandingStory();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.25 });
  const [activeIdx, setActiveIdx] = useState(0);

  // 3D Card Hover Effect — motion values avoid React re-renders on every mousemove
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Spring smoothing keeps the tilt feeling physical without setState
  const rotateX = useSpring(rawX, { stiffness: 220, damping: 28, mass: 0.6 });
  const rotateY = useSpring(rawY, { stiffness: 220, damping: 28, mass: 0.6 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    rawX.set(-y / (rect.height / 16));
    rawY.set(x / (rect.width / 16));
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

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
    const id = setInterval(() => setActiveIdx(p => (p + 1) % 4), 4500);
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
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Daily Routine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Built for Your Daily Routine
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            See how the system fits naturally into your day — from morning planning to evening reflections.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">

          {/* Timeline list */}
          <div className="lg:col-span-5 space-y-2.5">
            {routine.map((step, idx) => {
              const isActive = activeIdx === idx;
              const StepIcon = step.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left p-4 rounded-2xl border relative transition-all duration-300 flex items-center gap-4 focus:outline-none overflow-hidden ${
                    isActive
                      ? "border-slate-200/80 dark:border-white/[0.08] shadow-sm"
                      : "border-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Sliding highlight layer */}
                  {isActive && !shouldReduceMotion && (
                    <motion.div
                      layoutId="active-workflow-timeline"
                      className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-0"
                      transition={landingTokens.spring}
                    />
                  )}
                  
                  {/* Dark Mode default indicator for reduced motion */}
                  {isActive && shouldReduceMotion && (
                    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-0" />
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 relative z-10 ${
                    isActive ? `${step.colorBg} ${step.color} scale-110 shadow-sm` : "bg-slate-100 dark:bg-slate-800/80 text-slate-400"
                  }`}>
                    <StepIcon className="w-4.5 h-4.5" />
                  </div>
                  
                  <div className="min-w-0 flex-1 relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                      <span className="font-mono">{step.time}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="uppercase tracking-wider font-extrabold">{step.label}</span>
                    </div>
                    <div className={`text-sm font-black mt-0.5 truncate transition-colors duration-300 ${
                      isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3D Interactive Preview card */}
          <div className="lg:col-span-7">
            <motion.div
              style={shouldReduceMotion ? {} : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/8 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/50 transition-all duration-300 ease-out hover:shadow-2xl hover:border-slate-300 dark:hover:border-white/15"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${active.colorBg}`}>
                    <ActiveIcon className={`w-4 h-4 ${active.color}`} />
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {active.time} · {active.label}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
              </div>

              {/* AnimatePresence for content transitions */}
              <div className="p-6 min-h-[220px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIdx}
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="space-y-5 flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                        {active.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                        {active.desc}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-white/5 rounded-xl transition-all duration-300 shadow-inner">
                      {activeIdx === 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-white text-[8px] font-black">✓</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 line-through">{active.detail}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 shrink-0 bg-white dark:bg-slate-900" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Draft presentation updates</span>
                          </div>
                        </div>
                      )}
                      {activeIdx === 1 && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <span>Milestone progress</span>
                            <span className="text-blue-500 font-black">80%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "80%" }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                            Next: {activePresetData.milestones[1]}
                          </span>
                        </div>
                      )}
                      {activeIdx === 2 && (
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-4">
                            <div className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">{active.detail}</div>
                            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">High Priority</div>
                          </div>
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg shrink-0 border border-emerald-500/20 shadow-sm uppercase tracking-wider">
                            Shipped
                          </span>
                        </div>
                      )}
                      {activeIdx === 3 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                              <BarChart className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-700 dark:text-slate-200">Log Compiled</div>
                              <div className="text-[9px] text-slate-500 font-semibold mt-0.5">{active.detail}</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg font-black text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-white/5">
                            2.4h
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DailyWorkflow;
