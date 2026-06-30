import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { glowPulse } from "./animations";

export const TimelineNode = ({ active = false, completed = false, color = "#3762eb", className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative flex items-center justify-center w-6 h-6 ${className}`}>
      {/* Outer pulsing glow ring */}
      {active && (
        <motion.div
          variants={shouldReduceMotion ? {} : glowPulse}
          animate="animate"
          className="absolute w-8 h-8 rounded-full blur-[3px]"
          style={{ backgroundColor: color, opacity: 0.25 }}
        />
      )}

      {/* Inner Node Ring */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
          active
            ? "border-slate-800 dark:border-white"
            : completed
            ? "border-emerald-500"
            : "border-slate-300 dark:border-slate-700"
        }`}
        style={{
          backgroundColor: active ? color : completed ? "rgba(16, 185, 129, 0.1)" : "transparent"
        }}
      >
        {/* Core Dot */}
        {completed && !active && (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        )}
        {active && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>
    </div>
  );
};
export default TimelineNode;
