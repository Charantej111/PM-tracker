import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLandingStory } from "../landing-ui/LandingStoryContext";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import HeroBg from "./HeroBg";
import HeroWindow from "./HeroWindow";

const PRESETS = [
  { key: "pm",      label: "Product Manager" },
  { key: "swe",     label: "Software Engineer" },
  { key: "uiux",    label: "UI/UX Designer" },
  { key: "ai",      label: "AI Engineer" },
  { key: "analyst", label: "Data Analyst" },
];

const TRUST = [
  "Personalized Roadmaps",
  "Daily Planning",
  "Project Tracking",
  "Weekly Reports",
];

export const HeroSection = () => {
  const { activePreset, activePresetData, selectPreset } = useLandingStory();
  const noMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  const sectionRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 5), 4000);
    return () => clearInterval(id);
  }, []);

  const tab =
    step <= 1 ? "planner" : step === 2 ? "roadmap" : step === 3 ? "reports" : "portfolio";

  // ── Scroll tracking relative to the hero section ───────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Text drifts slightly up as the page scrolls down
  const textY = useTransform(scrollYProgress, [0, 1], ["0px", "-60px"]);

  // Console is fully visible on load, then scales up (e.g. 0.95 -> 1.05) and lifts slightly
  const windowY = useTransform(scrollYProgress, [0, 1], ["0px", "-40px"]);
  const windowScale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05]);

  return (
    <section
      id="chapter-hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-between items-center pt-28 pb-12 overflow-visible"
    >
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <HeroBg noMotion={noMotion} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col items-center justify-between h-full gap-12">

        {/* ── CENTERED TEXT COPY ─────────────────────────────────────────── */}
        <motion.div
          style={noMotion ? {} : { y: textY }}
          className="space-y-5 text-center max-w-3xl mx-auto w-full"
        >
          {/* Eyebrow */}
          <motion.div
            initial={noMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 backdrop-blur-sm text-[11px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3 h-3" />
              Career Operating System
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={noMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.06 }}
            className="text-[2.2rem] xs:text-[2.5rem] sm:text-5xl md:text-[3.2rem] lg:text-[3.6rem] xl:text-[4rem] font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white"
          >
            Your career,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                finally organized
              </span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9 Q75 2 150 9 Q225 16 298 9" stroke="url(#ul)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="ul" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={noMotion ? {} : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
            className="text-sm sm:text-base md:text-[17px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-xl mx-auto"
          >
            Roadmaps, daily planners, project boards, skill tracking, and
            performance reports — one system built around your career path.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={noMotion ? {} : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[15px] font-bold rounded-2xl shadow-lg shadow-blue-500/30 dark:shadow-blue-600/20 transition-all duration-200 focus:outline-none"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-[15px] font-bold text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
            >
              View Demo
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={noMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="hidden sm:flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{t}
              </span>
            ))}
          </motion.div>

          {/* Career selector */}
          <motion.div
            initial={noMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.28 }}
            className="space-y-2.5"
          >
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-center">
              <span className="w-3 h-px bg-slate-300 dark:bg-slate-700" />
              Adapt for your path
              <span className="w-3 h-px bg-slate-300 dark:bg-slate-700" />
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRESETS.map((p) => {
                const active = activePreset === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => selectPreset(p.key)}
                    className={`px-4 py-1.5 text-[12px] font-bold rounded-xl border transition-all duration-200 ${
                      active
                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-md"
                        : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* ── MAC CONSOLE — GPU-composited scroll animation ───────────── */}
        <motion.div
          style={noMotion ? {} : { y: windowY, scale: windowScale, willChange: "transform" }}
          className="w-full max-w-[92vw] sm:max-w-[680px] md:max-w-[820px] lg:max-w-[920px] px-4 sm:px-6 z-20 origin-center"
        >
          <div className="relative">
            {/* Ambient glow */}
            <div className="absolute -inset-8 bg-gradient-to-br from-blue-400/10 via-indigo-400/8 to-purple-400/6 dark:from-blue-600/20 dark:via-indigo-600/12 dark:to-purple-600/8 blur-[60px] rounded-3xl pointer-events-none" />

            <HeroWindow
              step={step}
              tab={tab}
              activePresetData={activePresetData}
              skill={activePresetData.skills?.[0]?.name ?? "Core Skill"}
              readinessPct={step >= 4 ? 88 : 80}
              roadmapPct={step >= 2 ? 82 : 74}
              checked={step >= 1}
              noMotion={noMotion}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
