import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, ExternalLink } from "lucide-react";
import { landingTokens } from "../landing-ui/designTokens";
import SectionBg from "./SectionBg";
import { DEVELOPER_CONFIG } from "../../utils/config";

export const CTASection = () => {
  const year = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-white/5 pt-20 pb-10 transition-colors duration-300">
      <SectionBg />

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

        {/* ── Footer bar ─────────────────────────────────────────────────── */}
        <div className="border-t border-slate-200/50 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">

          {/* Logo + copyright */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-slate-800 dark:text-white tracking-tight">Career OS</span>
            <span className="font-medium text-[11px]">© {year} PM Tracker. All rights reserved.</span>
          </div>

          {/* Support links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            <a href="/support" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a>
            <a href="/support?tab=faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a>
            <a href="/support?tab=contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
            <a href="/support?tab=privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="/support?tab=terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>

          {/* ── iOS-inspired Developer Card ─────────────────────────────── */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl
              bg-white/80 dark:bg-white/[0.05]
              border border-slate-200/70 dark:border-white/[0.08]
              shadow-md shadow-slate-200/50 dark:shadow-black/30
              backdrop-blur-md
              hover:shadow-lg hover:border-blue-200/80 dark:hover:border-blue-500/25
              transition-all duration-300"
          >
            {/* ── Avatar video (MP4) ──────────────────────────────────────── */}
            <div
              id="dev-avatar"
              className="w-14 h-14 rounded-full overflow-hidden shrink-0
                         ring-2 ring-white dark:ring-slate-700
                         shadow-lg shadow-slate-300/40 dark:shadow-black/40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
            >
              <video
                src="/videos/avatar.mp4"
                autoPlay
                loop
                muted
                playsInline
                width="56"
                height="56"
                className="w-full h-full object-cover object-center scale-110"
              />
            </div>

            {/* ── Name + label + pill links ──────────────────────────────── */}
            <div className="flex flex-col gap-1.5 min-w-0">

              {/* "Made with love" eyebrow */}
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500
                            uppercase tracking-[0.15em] leading-none flex items-center gap-1">
                <span className="text-rose-400 text-[11px]">♥</span>
                Made with love
              </p>

              {/* Name */}
              <p className="text-[14px] font-black text-slate-800 dark:text-white
                            tracking-tight leading-none whitespace-nowrap">
                {DEVELOPER_CONFIG.name}
              </p>

              {/* Pill buttons */}
              <div className="flex items-center gap-2 mt-0.5">
                <a
                  href={DEVELOPER_CONFIG.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                    text-[10px] font-bold
                    bg-slate-100 dark:bg-white/[0.08]
                    text-slate-600 dark:text-slate-300
                    border border-slate-200/70 dark:border-white/[0.08]
                    hover:bg-blue-50 dark:hover:bg-blue-500/15
                    hover:text-blue-600 dark:hover:text-blue-400
                    hover:border-blue-200 dark:hover:border-blue-500/30
                    transition-all duration-200"
                >
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  Portfolio
                </a>

                <a
                  href={DEVELOPER_CONFIG.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                    text-[10px] font-bold
                    bg-slate-100 dark:bg-white/[0.08]
                    text-slate-600 dark:text-slate-300
                    border border-slate-200/70 dark:border-white/[0.08]
                    hover:bg-blue-50 dark:hover:bg-blue-500/15
                    hover:text-blue-600 dark:hover:text-blue-400
                    hover:border-blue-200 dark:hover:border-blue-500/30
                    transition-all duration-200"
                >
                  <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 shrink-0" fill="currentColor">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.175-.431.573-.878 1.242-.878.877 0 1.229.665 1.229 1.641v3.858h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </footer>
  );
};

export default CTASection;
