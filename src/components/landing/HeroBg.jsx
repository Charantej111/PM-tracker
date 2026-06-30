import React from "react";
import { motion } from "framer-motion";

export default function HeroBg({ noMotion }) {
  return (
    <>
      {/* ── LIGHT mode: warm mesh gradients ── */}
      <div className="absolute inset-0 pointer-events-none dark:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8faff] via-white to-[#f4f6ff]" />
        {/* Blue orb top-left */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-24 w-[700px] h-[600px] rounded-full bg-gradient-radial from-blue-200/70 via-sky-100/40 to-transparent blur-[90px]"
        />
        {/* Violet orb right */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.06, 1], y: [0, -15, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-[-8%] w-[550px] h-[500px] rounded-full bg-gradient-radial from-violet-100/60 via-indigo-50/30 to-transparent blur-[90px]"
        />
        {/* Cyan bottom */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-15%] left-[25%] w-[600px] h-[400px] rounded-full bg-gradient-radial from-cyan-100/50 via-teal-50/20 to-transparent blur-[80px]"
        />
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Diagonal lines (very subtle) */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #6366f1 0px, #6366f1 1px, transparent 0px, transparent 50%)", backgroundSize: "20px 20px" }}
        />
      </div>

      {/* ── DARK mode: animated orbs ── */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-slate-900 to-[#020817]" />
        {/* Blue main orb */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.18, 1], opacity: [0.14, 0.22, 0.14] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-blue-600 blur-[160px]"
        />
        {/* Violet bottom-left */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.1, 1], x: [0, 25, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] -left-20 w-[500px] h-[450px] rounded-full bg-violet-700 blur-[130px] opacity-[0.10]"
        />
        {/* Cyan right */}
        <motion.div
          animate={noMotion ? {} : { scale: [1, 1.12, 1], y: [0, -25, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] -right-20 w-[400px] h-[380px] rounded-full bg-cyan-600 blur-[120px] opacity-[0.08]"
        />
        {/* Indigo accent mid */}
        <motion.div
          animate={noMotion ? {} : { opacity: [0.05, 0.09, 0.05] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-700 blur-[140px]"
        />
        {/* Fine dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.6) 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />
      </div>
    </>
  );
}
