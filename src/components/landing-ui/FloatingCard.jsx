import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { landingTokens } from "./designTokens";

export const FloatingCard = ({
  children,
  className = "",
  delay = 0,
  hoverLift = true,
  hoverTilt = true,
  float = true,
  style = {}
}) => {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Gentle floating animation variants
  const floatVariants = {
    animate: {
      y: shouldReduceMotion || !float ? 0 : [0, -6, 0],
      transition: {
        y: {
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay
        }
      }
    }
  };

  // Mouse tilt handlers
  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !hoverTilt || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Convert offsets to rotation angles (max 6 degrees tilt)
    const factorX = (y / (rect.height / 2)) * -6;
    const factorY = (x / (rect.width / 2)) * 6;

    card.style.transform = `perspective(1000px) rotateX(${factorX}deg) rotateY(${factorY}deg) scale3d(1.02, 1.02, 1.02) translateY(${hoverLift ? "-6px" : "0px"})`;
    card.style.boxShadow = "0 30px 60px rgba(37,99,235,0.18)";
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0px)";
    card.style.boxShadow = "";
  };

  return (
    <motion.div
      ref={cardRef}
      variants={float ? floatVariants : {}}
      animate={float && !shouldReduceMotion ? "animate" : ""}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-300 ease-out cursor-default ${landingTokens.glass} ${landingTokens.radius} ${landingTokens.shadowSoft} ${className}`}
      style={{ transformStyle: "preserve-3d", ...style }}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};
export default FloatingCard;
