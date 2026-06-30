import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const StoryConnector = ({
  active = false,
  direction = "horizontal",
  length = 100,
  color = "#3762eb",
  className = ""
}) => {
  const shouldReduceMotion = useReducedMotion();

  const dashAnimation = {
    animate: {
      strokeDashoffset: shouldReduceMotion ? 0 : [-20, 0],
      transition: {
        strokeDashoffset: {
          duration: 1.2,
          repeat: Infinity,
          ease: "linear"
        }
      }
    }
  };

  const isHorizontal = direction === "horizontal";
  const strokeWidth = active ? 2.5 : 1.5;
  const strokeColor = active ? color : "rgba(148, 163, 184, 0.25)";

  return (
    <div
      className={`flex items-center justify-center pointer-events-none ${className}`}
      style={{
        width: isHorizontal ? length : 16,
        height: isHorizontal ? 16 : length
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={isHorizontal ? `0 0 ${length} 16` : `0 0 16 ${length}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d={
            isHorizontal
              ? `M 0 8 L ${length} 8`
              : `M 8 0 L 8 ${length}`
          }
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={active ? "8 6" : "0 0"}
          variants={active && !shouldReduceMotion ? dashAnimation : {}}
          animate="animate"
        />
        {/* Glow underlay if active */}
        {active && (
          <path
            d={
              isHorizontal
                ? `M 0 8 L ${length} 8`
                : `M 8 0 L 8 ${length}`
            }
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 2.5}
            strokeOpacity={0.15}
            className="blur-[2px]"
          />
        )}
      </svg>
    </div>
  );
};
export default StoryConnector;
