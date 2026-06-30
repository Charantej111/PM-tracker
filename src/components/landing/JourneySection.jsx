import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { landingTokens } from "../landing-ui/designTokens";
import { Target, Brain, Calendar, Code2, BarChart2, UserCheck } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Target,
    accent: "#2563eb",
    accentBg: "bg-blue-50 dark:bg-blue-950/40",
    accentBorder: "border-blue-200/60 dark:border-blue-500/20",
    accentText: "text-blue-600 dark:text-blue-400",
    title: "Choose Your Career Goal",
    what: "Select from PM, SWE, UI/UX, AI, or Analyst — or define a custom path.",
    impact: "Career OS initializes a personalized readiness profile and skill checklist for your target role.",
  },
  {
    num: "02",
    icon: Brain,
    accent: "#7c3aed",
    accentBg: "bg-violet-50 dark:bg-violet-950/40",
    accentBorder: "border-violet-200/60 dark:border-violet-500/20",
    accentText: "text-violet-600 dark:text-violet-400",
    title: "Generate Your Roadmap",
    what: "A structured curriculum is generated — milestones, resources, and timelines included.",
    impact: "Your learning roadmap fills with sequenced modules and a progress meter resets to 0%.",
  },
  {
    num: "03",
    icon: Calendar,
    accent: "#059669",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/40",
    accentBorder: "border-emerald-200/60 dark:border-emerald-500/20",
    accentText: "text-emerald-600 dark:text-emerald-400",
    title: "Plan Every Day",
    what: "Milestones convert into morning, afternoon, and evening focus blocks automatically.",
    impact: "The daily planner loads your study schedule. Streak tracking starts on day one.",
  },
  {
    num: "04",
    icon: Code2,
    accent: "#db2777",
    accentBg: "bg-pink-50 dark:bg-pink-950/40",
    accentBorder: "border-pink-200/60 dark:border-pink-500/20",
    accentText: "text-pink-600 dark:text-pink-400",
    title: "Build Real Projects",
    what: "Create and move deliverables through a Kanban board tied to your roadmap milestones.",
    impact: "Completing a project updates roadmap progress, skill levels, and portfolio match scores.",
  },
  {
    num: "05",
    icon: BarChart2,
    accent: "#d97706",
    accentBg: "bg-amber-50 dark:bg-amber-950/40",
    accentBorder: "border-amber-200/60 dark:border-amber-500/20",
    accentText: "text-amber-600 dark:text-amber-400",
    title: "Measure Weekly Progress",
    what: "Logged study hours and completed tasks compile into a clean performance report.",
    impact: "Charts draw, readiness rises, and a one-page PDF becomes available to download.",
  },
  {
    num: "06",
    icon: UserCheck,
    accent: "#0891b2",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/40",
    accentBorder: "border-cyan-200/60 dark:border-cyan-500/20",
    accentText: "text-cyan-600 dark:text-cyan-400",
    title: "Become Career Ready",
    what: "Reach 100% readiness and your portfolio dashboard unlocks a shareable public link.",
    impact: "Your career profile becomes a living document ready for recruiters and technical reviewers.",
  },
];

// Approximate per-step positions along the SVG path (0–100%)
const NODE_Y = [6, 23, 40, 57, 74, 91];
// The curved path through the left-center column
const PATH_D = "M 40 30 C 25 130, 55 200, 40 280 C 25 360, 55 430, 40 530 C 25 620, 55 690, 40 760";

export const JourneySection = () => {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 20%"],
  });

  // Path total length ≈ 760 px (matches viewBox height)
  const PATH_LEN = 760;
  const dashOffset = useTransform(scrollYProgress, [0, 1], [PATH_LEN, 0]);
  // Dot position along path (cy)
  const dotCy = useTransform(scrollYProgress, [0, 1], [30, 760]);

  return (
    <section
      ref={containerRef}
      id="chapter-journey"
      className="py-28 relative overflow-hidden bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-white/5 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span>06</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Complete Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            The Guided Product Journey
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Follow the complete path from choosing a career direction to becoming interview-ready — and see exactly how Career OS responds at every step.
          </p>
        </div>

        {/* ── Timeline ─────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto relative">

          {/* SVG path column — absolutely positioned on the left */}
          <div className="absolute left-[19px] top-0 bottom-0 w-10 hidden sm:block pointer-events-none">
            <svg
              viewBox={`0 0 80 ${PATH_LEN + 30}`}
              className="w-10 h-full"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              {/* Ghost track */}
              <path
                d={PATH_D}
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-200 dark:text-slate-800"
                strokeLinecap="round"
              />
              {/* Animated progress */}
              <motion.path
                d={PATH_D}
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={PATH_LEN}
                style={shouldReduceMotion ? {} : { strokeDashoffset: dashOffset }}
              />
              {/* Traveling glow dot */}
              {!shouldReduceMotion && (
                <motion.circle
                  cx="40"
                  r="6"
                  fill="#2563eb"
                  style={{ cy: dotCy }}
                  className="drop-shadow-[0_0_6px_rgba(37,99,235,0.8)]"
                />
              )}
            </svg>
          </div>

          {/* Step cards stacked vertically */}
          <div className="space-y-10 sm:pl-14">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ ...landingTokens.spring, delay: 0 }}
                  className="relative flex gap-5"
                >
                  {/* Node dot (visible on mobile in place of SVG) */}
                  <div className="sm:hidden absolute -left-14 top-4 w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Card */}
                  <div className={`flex-1 border rounded-2xl overflow-hidden ${step.accentBorder} bg-white dark:bg-slate-900`}>
                    {/* Card header accent bar */}
                    <div className={`px-5 py-4 ${step.accentBg} border-b ${step.accentBorder} flex items-center gap-3`}>
                      <div className={`p-2 rounded-xl border ${step.accentBorder} bg-white dark:bg-slate-900`}>
                        <Icon className={`w-4 h-4 ${step.accentText}`} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${step.accentText} leading-none block`}>
                          Stage {step.num}
                        </span>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug mt-0.5">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                          What Happens
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {step.what}
                        </p>
                      </div>
                      <div className={`px-3 py-3 rounded-xl border ${step.accentBorder} ${step.accentBg}`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${step.accentText}`}>
                          Workspace Impact
                        </span>
                        <p className={`text-xs font-semibold leading-relaxed ${step.accentText} opacity-90`}>
                          {step.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
export default JourneySection;
