import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function SectionBg({ variant = "white" }) {
  const noMotion = useReducedMotion();

  if (variant === "gray") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Light mode: very subtle warm background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 dark:hidden" />
        
        {/* Dark mode: Deep slate back */}
        <div className="absolute inset-0 bg-[#080c14] hidden dark:block" />

        {/* Ambient radial orbs - Light Mode */}
        <div className="absolute inset-0 dark:hidden">
          <motion.div
            animate={noMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[90px]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(186,230,253,0.3) 0%, rgba(224,242,254,0.1) 60%, transparent 100%)" }}
          />
          <motion.div
            animate={noMotion ? {} : { scale: [1, 1.05, 1], y: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-15%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[100px]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(237,233,254,0.3) 0%, rgba(243,244,246,0.1) 60%, transparent 100%)" }}
          />
        </div>

        {/* Ambient radial orbs - Dark Mode */}
        <div className="absolute inset-0 hidden dark:block">
          <motion.div
            animate={noMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(99,102,241,0.01) 70%, transparent 100%)" }}
          />
          <motion.div
            animate={noMotion ? {} : { scale: [1, 1.08, 1], y: [0, 25, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-15%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[110px]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 80%)" }}
          />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>
    );
  }

  if (variant === "dark-only") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none bg-[#030712] z-0">
        {/* Soft cyan-blue mesh orbs */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] left-[20%] w-[650px] h-[550px] rounded-full blur-[120px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(8,145,178,0.02) 65%, transparent 100%)" }}
        />
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] right-[10%] w-[750px] h-[550px] rounded-full blur-[130px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(29,78,216,0.01) 70%, transparent 100%)" }}
        />

        {/* Subtle grid mesh */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.6) 1px, transparent 1px)", backgroundSize: "36px 36px" }}
        />
      </div>
    );
  }

  // Default: "white" variant
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Light mode */}
      <div className="absolute inset-0 bg-white dark:hidden" />
      {/* Dark mode */}
      <div className="absolute inset-0 bg-[#020817] hidden dark:block" />

      {/* Floating accent mesh gradient blobs - Light Mode */}
      <div className="absolute inset-0 dark:hidden">
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.1, 1], x: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[-15%] w-[600px] h-[500px] rounded-full blur-[90px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(219,234,254,0.3) 0%, rgba(239,246,255,0.1) 60%, transparent 100%)" }}
        />
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.08, 1], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[15%] right-[-15%] w-[650px] h-[550px] rounded-full blur-[100px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(237,233,254,0.25) 0%, rgba(245,243,255,0.05) 60%, transparent 100%)" }}
        />
      </div>

      {/* Floating accent mesh gradient blobs - Dark Mode */}
      <div className="absolute inset-0 hidden dark:block">
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.1, 1], x: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[-15%] w-[600px] h-[500px] rounded-full blur-[100px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, rgba(79,70,229,0.005) 75%, transparent 100%)" }}
        />
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.08, 1], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[15%] right-[-15%] w-[650px] h-[550px] rounded-full blur-[110px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.035) 0%, transparent 80%)" }}
        />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle, #64748b 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
    </div>
  );
}
