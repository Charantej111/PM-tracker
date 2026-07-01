import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ScrollReveal — wraps any section so it fades + slides up
 * smoothly when it enters the viewport.
 *
 * Props:
 *   delay     – optional stagger delay in seconds (default 0)
 *   className – forwarded to the wrapper div
 */
export default function ScrollReveal({ children, delay = 0, className = "" }) {
  const noMotion = useReducedMotion();

  if (noMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
