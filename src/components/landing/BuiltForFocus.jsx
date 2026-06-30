import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { landingTokens } from "../landing-ui/designTokens";
import {
  Chrome, FileSpreadsheet, FileText, Calendar, Video,
  Github, Bookmark, MessageSquare, Figma, StickyNote,
  FileCode, Monitor, CheckSquare, Layout, BarChart2,
  Award, Target, BookOpen, Activity
} from "lucide-react";
import SectionBg from "./SectionBg";

// ─── Scattered tool items ───────────────────────────────────────────────────
const TOOLS = [
  { label: "12 Chrome Tabs",    icon: Chrome,         color: "text-red-500",     bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200/60 dark:border-red-500/15" },
  { label: "Notion Notes",      icon: FileText,       color: "text-slate-600 dark:text-slate-300", bg: "bg-white dark:bg-slate-800",       border: "border-slate-200/60 dark:border-white/8" },
  { label: "YouTube",           icon: Video,          color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-950/30",   border: "border-rose-200/60 dark:border-rose-500/15" },
  { label: "GitHub PRs",        icon: Github,         color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200/60 dark:border-purple-500/15" },
  { label: "Google Calendar",   icon: Calendar,       color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-200/60 dark:border-blue-500/15" },
  { label: "Excel Tracker",     icon: FileSpreadsheet, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200/60 dark:border-emerald-500/15" },
  { label: "ChatGPT",           icon: MessageSquare,  color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30",   border: "border-teal-200/60 dark:border-teal-500/15" },
  { label: "Figma",             icon: Figma,          color: "text-pink-500",    bg: "bg-pink-50 dark:bg-pink-950/30",   border: "border-pink-200/60 dark:border-pink-500/15" },
  { label: "Sticky Notes",      icon: StickyNote,     color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200/60 dark:border-amber-500/15" },
  { label: "PDF Notes",         icon: FileCode,       color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200/60 dark:border-orange-500/15" },
  { label: "Bookmarks",         icon: Bookmark,       color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200/60 dark:border-indigo-500/15" },
  { label: "Discord",           icon: Monitor,        color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200/60 dark:border-violet-500/15" },
];

// Subtle rotations to simulate organic desk placement
const ROTATIONS = [-1.2, 0.8, -0.6, 1.4, -0.9, 0.3, -1.1, 0.7, -0.4, 1.0, -0.7, 0.5];

export const BuiltForFocus = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.25 });
  const shouldReduceMotion = useReducedMotion();

  const [phase, setPhase] = useState("chaos");
  useEffect(() => {
    if (!isInView) { setPhase("chaos"); return; }
    const id = setInterval(() => setPhase(p => p === "chaos" ? "unified" : "chaos"), 6000);
    return () => clearInterval(id);
  }, [isInView]);

  const unified = phase === "unified";

  return (
    <section
      ref={ref}
      id="chapter-focus"
      className="py-28 relative overflow-hidden bg-slate-50 dark:bg-[#080c14] border-y border-slate-100 dark:border-white/5 transition-colors duration-300"
    >
      <SectionBg variant="gray" />

      <div className="max-w-7xl mx-auto px-6 space-y-14 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Built for Focus
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Stop managing your career across{" "}
            <span className="text-blue-600 dark:text-blue-400">12 different apps</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-lg mx-auto">
            Every tab, bookmark, and scattered note — consolidated into one intentional workspace.
          </p>
        </div>

        {/* Transformation layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_64px_1fr] gap-8 lg:gap-0 items-center max-w-5xl mx-auto">

          {/* ── LEFT: Scattered tools ──────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your Current Setup</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-all duration-500 ${
                unified
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  : "bg-rose-100 dark:bg-rose-950/40 text-rose-500 border border-rose-200/60 dark:border-rose-500/20"
              }`}>
                {unified ? "Migrated" : "Scattered"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TOOLS.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.label}
                    animate={unified && !shouldReduceMotion
                      ? { opacity: 0.15, scale: 0.85, filter: "blur(2px)" }
                      : { opacity: 1, scale: 1, filter: "blur(0px)" }
                    }
                    transition={{ type: "spring", stiffness: 120, damping: 16, delay: unified ? i * 0.03 : (11 - i) * 0.02 }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border shadow-sm ${tool.bg} ${tool.border}`}
                    style={{ rotate: `${ROTATIONS[i]}deg` }}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${tool.color}`} />
                    <span className={`text-[9px] font-semibold leading-none truncate ${tool.color}`}>{tool.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── CENTER: Flow connector ─────────────────────────────────────── */}
          <div className="hidden lg:flex items-center justify-center">
            <svg viewBox="0 0 64 320" className="w-16 h-80" fill="none">
              {/* Ghost path */}
              <path d="M32 10 Q32 160 32 310" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800" />
              {/* Animated path */}
              <motion.path
                d="M32 10 Q32 160 32 310"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="300"
                animate={unified && !shouldReduceMotion ? { strokeDashoffset: 0, opacity: 1 } : { strokeDashoffset: 300, opacity: 0.2 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              {/* Traveling dot */}
              {!shouldReduceMotion && (
                <motion.circle
                  cx="32" r="4" fill="#2563eb"
                  animate={unified ? { cy: [10, 160, 310], opacity: [0, 1, 0] } : { cy: 10, opacity: 0 }}
                  transition={unified ? { duration: 1.2, ease: "easeInOut", times: [0, 0.5, 1] } : {}}
                  className="drop-shadow-[0_0_6px_rgba(37,99,235,0.6)]"
                />
              )}
              {/* Arrow */}
              <motion.path d="M25 298 L32 310 L39 298" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none" animate={unified ? { opacity: 1 } : { opacity: 0.15 }} />
            </svg>
          </div>

          {/* Mobile connector */}
          <div className="flex lg:hidden justify-center">
            <motion.div
              animate={unified ? { scaleY: 1, opacity: 1 } : { scaleY: 0.3, opacity: 0.3 }}
              className="w-0.5 h-12 bg-blue-500 rounded-full origin-top"
            />
          </div>

          {/* ── RIGHT: Career OS organized workspace ──────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Career OS</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                One Workspace
              </span>
            </div>

            <motion.div
              animate={unified ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 6 }}
              transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 100, damping: 18 }}
            >
              {/* App window */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm">
                {/* Chrome */}
                <div className="h-9 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-white/5 flex items-center px-3.5 gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                  <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
                  <span className="w-2 h-2 rounded-full bg-[#28c840]" />
                  <span className="ml-auto text-[8px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Career OS
                  </span>
                </div>

                {/* 2x3 grid dashboard */}
                <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-white/5">

                  {/* Roadmap */}
                  <div className="p-3.5 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Layout className="w-3 h-3 text-blue-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Roadmap</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                      <motion.div className="h-full bg-blue-500 rounded-full" animate={unified ? { width: "78%" } : { width: "0%" }} transition={{ duration: 0.9, ease: "easeOut" }} />
                    </div>
                    <span className="text-[8px] text-slate-400 font-medium">Milestone 3 / 5</span>
                  </div>

                  {/* Planner */}
                  <div className="p-3.5 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckSquare className="w-3 h-3 text-emerald-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Planner</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[8px]">
                        <CheckSquare className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-slate-400 line-through font-medium">Study SQL</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px]">
                        <div className="w-2.5 h-2.5 rounded-sm border border-slate-300 dark:border-slate-600" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Portfolio page</span>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="p-3.5 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="w-3 h-3 text-purple-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Projects</span>
                    </div>
                    <div className="space-y-1">
                      <div className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/30 border border-purple-200/40 dark:border-purple-500/15 text-[7px] font-bold text-purple-600 dark:text-purple-400">PRD Case Study</div>
                      <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-500/15 text-[7px] font-bold text-emerald-600 dark:text-emerald-400">Portfolio ✓</div>
                    </div>
                  </div>

                  {/* Readiness */}
                  <div className="p-3.5 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Readiness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" className="stroke-slate-200 dark:stroke-slate-700" />
                        <motion.circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeDasharray="88" animate={unified ? { strokeDashoffset: 88 * 0.16 } : { strokeDashoffset: 88 }} transition={{ duration: 1, ease: "easeOut" }} />
                      </svg>
                      <div>
                        <div className="text-sm font-black text-slate-800 dark:text-white leading-none">84%</div>
                        <div className="text-[7px] text-slate-400">Job Ready</div>
                      </div>
                    </div>
                  </div>

                  {/* Reports */}
                  <div className="p-3.5 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart2 className="w-3 h-3 text-indigo-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Reports</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-6">
                      {[30, 50, 35, 65, 55, 75, 40].map((v, i) => (
                        <motion.div key={i} className="flex-1 bg-indigo-400/60 dark:bg-indigo-400/40 rounded-t" animate={unified ? { height: `${v}%` } : { height: "0%" }} transition={{ duration: 0.5, delay: i * 0.04 }} />
                      ))}
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="p-3.5 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Activity className="w-3 h-3 text-cyan-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Activity</span>
                    </div>
                    <div className="space-y-1 text-[7px] font-medium text-slate-400">
                      <div>✓ SQL module completed</div>
                      <div>✓ Portfolio updated</div>
                      <div className="text-emerald-500">↑ Readiness +4%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Bottom status */}
        <div className="flex justify-center">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors duration-700 ${unified ? "bg-emerald-500" : "bg-rose-400"}`} />
            {unified ? "Everything organized. One workspace." : "Watch the transformation above."}
          </p>
        </div>

      </div>
    </section>
  );
};

export default BuiltForFocus;
