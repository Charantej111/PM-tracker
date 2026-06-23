import { motion } from "framer-motion";
import { cn } from "../utils/helpers";

export default function ProgressRing({
  value,
  size = 120,
  stroke = 12,
  label,
  helper,
  className,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(var(--accent))"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-2xl font-bold text-ink dark:text-white">{value}%</span>
        </div>
      </div>
      {label || helper ? (
        <div className="mt-3 flex flex-col items-center">
          {label ? <span className="text-sm font-semibold text-ink dark:text-white">{label}</span> : null}
          {helper ? <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
