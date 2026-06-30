import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { landingTokens } from "./designTokens";

export const ProgressRing = ({
  size = 120,
  strokeWidth = 10,
  progress = 0,
  color = "#3762eb",
  trackColor = "rgba(226, 232, 240, 0.4)",
  darkTrackColor = "rgba(255, 255, 255, 0.05)",
  className = ""
}) => {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200/40 dark:text-white/5"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            shouldReduceMotion
              ? { duration: 0.1 }
              : { ...landingTokens.spring, delay: 0.1 }
          }
        />
      </svg>
      {/* Inner Slot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold font-display text-slate-800 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};
export default ProgressRing;
