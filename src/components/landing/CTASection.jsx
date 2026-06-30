import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { landingTokens } from "../landing-ui/designTokens";

const TECH = ["React", "Supabase", "TailwindCSS", "Framer Motion", "Vercel"];

export const CTASection = () => {
  const year = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-white/5 pt-20 pb-10 transition-colors duration-300">
      {/* Ambient radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-500/8 dark:bg-blue-600/8 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-16">

        {/* CTA block */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={landingTokens.spring}
          className="max-w-3xl mx-auto text-center space-y-7"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Ready to Organize Your Career?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Create your account and launch a personalized workspace built around your growth metrics — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Explore Workspace
            </a>
          </div>
        </motion.div>

        {/* Footer bar */}
        <div className="border-t border-slate-200/50 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-400">
          {/* Logo + copyright */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-slate-800 dark:text-white tracking-tight">Career OS</span>
            <span className="font-medium text-[11px]">© {year} PM Tracker. All rights reserved.</span>
          </div>

          {/* Tech credits */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] font-medium">
            <span className="text-slate-500">Built with:</span>
            {TECH.map((t, i) => (
              <span key={t} className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />}
                {t}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
export default CTASection;
