import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { landingTokens } from "./designTokens";

export const AnimatedChart = ({
  type = "line", // "line" or "bar"
  data = [30, 45, 35, 60, 50, 80],
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  color = "#3762eb",
  height = 140,
  className = ""
}) => {
  const shouldReduceMotion = useReducedMotion();
  const maxVal = Math.max(...data, 10);
  
  // Chart dimensions
  const width = 360;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate coordinates
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  });

  // Construct SVG path for Line
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Generate curved bezier segments
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  // Path fill for underlay gradient
  const fillD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Y Axis Gridlines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth={1}
            />
          );
        })}

        {type === "line" ? (
          <>
            {/* Gradient Area under line */}
            {fillD && (
              <motion.path
                d={fillD}
                fill="url(#chartGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            )}

            {/* Main curved path */}
            {pathD && (
              <motion.path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : { duration: 1.2, ease: "easeInOut" }
                }
              />
            )}

            {/* Glowing dots on points */}
            {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#ffffff"
                stroke={color}
                strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.05, ...landingTokens.spring }}
              />
            ))}
          </>
        ) : (
          // Bar Chart Rendering
          points.map((p, i) => {
            const barWidth = Math.min(20, chartWidth / data.length - 8);
            const barHeight = height - padding - p.y;
            return (
              <g key={i}>
                <motion.rect
                  x={p.x - barWidth / 2}
                  y={height - padding} // Start from bottom for anim
                  width={barWidth}
                  height={0}
                  rx={4}
                  fill={color}
                  opacity={0.85}
                  animate={{
                    y: p.y,
                    height: barHeight
                  }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.1 }
                      : { ...landingTokens.spring, delay: 0.1 + i * 0.06 }
                  }
                  whileHover={{ opacity: 1, fill: color }}
                />
              </g>
            );
          })
        )}

        {/* Labels */}
        {labels.map((lbl, i) => {
          const x = padding + (i / (labels.length - 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - 2}
              textAnchor="middle"
              className="text-[9px] font-sans font-semibold fill-slate-400/90 dark:fill-slate-500"
            >
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
export default AnimatedChart;
