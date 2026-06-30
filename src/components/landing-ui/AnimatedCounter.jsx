import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export const AnimatedCounter = ({ value = 0, duration = 800, prefix = "", suffix = "", className = "" }) => {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value);
      return;
    }

    let startTimestamp = null;
    const startValue = prevValueRef.current;
    const endValue = value;

    if (startValue === endValue) {
      setCount(endValue);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quad
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(easedProgress * (endValue - startValue) + startValue);
      
      setCount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        prevValueRef.current = endValue;
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration, shouldReduceMotion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};
export default AnimatedCounter;
