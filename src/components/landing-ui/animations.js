import { landingTokens } from "./designTokens";

export const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: landingTokens.spring
  }
};

export const fadeLeft = {
  hidden: { opacity: 0, x: 25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: landingTokens.spring
  }
};

export const fadeRight = {
  hidden: { opacity: 0, x: -25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: landingTokens.spring
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: landingTokens.spring
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const floatTransition = {
  y: {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }
};

export const floating = {
  animate: {
    y: [0, -6, 0],
    transition: floatTransition
  }
};

export const cardHover = {
  rest: { y: 0, scale: 1, rotateX: 0, rotateY: 0 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.25, ease: "easeOut" }
  }
};

export const glowPulse = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [0.98, 1.02, 0.98],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};
