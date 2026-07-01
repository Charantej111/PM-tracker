import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ReportsPreview } from "../landing-ui/ReportsPreview";
import { landingTokens } from "../landing-ui/designTokens";
import { CheckCircle2 } from "lucide-react";
import SectionBg from "./SectionBg";

const FEATURES = [
  "Automatic compilation from daily study logs",
  "Readiness percentage index calculation",
  "Clean single-page PDF document exports",
  "Week-on-week performance trend lines",
];

export const ReportsShowcase = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="chapter-reports"
      className="py-28 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300"
    >
      <SectionBg />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center relative z-10">

        {/* Left: Narrative */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={landingTokens.spring}
          className="lg:col-span-5 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <span>05</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Measure Progress</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Export Audit-Ready Performance Reports
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Every study session, project, and milestone logged inside Career OS compiles automatically into a clean weekly performance review — ready to reference and share.
          </p>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Preview window */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={landingTokens.spring}
          className="lg:col-span-7"
        >
          <div className={`${landingTokens.glassSolid} ${landingTokens.radius} ${landingTokens.shadowSoft} overflow-hidden border border-slate-200/60 dark:border-white/8`}>
            {/* Window chrome */}
            <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/40 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Weekly Performance Report — June 2026
              </span>
            </div>
            <ReportsPreview />
          </div>
        </motion.div>

      </div>
    </section>
  );
};
export default ReportsShowcase;
