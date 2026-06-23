import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/helpers";

const variants = {
  primary:
    "bg-accent text-white shadow-soft hover:bg-accent/90 dark:bg-accent dark:text-white",
  secondary:
    "border border-accent/20 bg-white text-accent hover:border-accent/40 hover:bg-accent/5 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
  subtle:
    "bg-accent-soft/10 text-accent hover:bg-accent-soft/20 dark:bg-white/10 dark:text-slate-100",
};

export default function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  onClick,
  ...props
}) {
  const [ripple, setRipple] = useState(false);

  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={cn(
        "relative overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200",
        variants[variant],
        className,
      )}
      onClick={(event) => {
        setRipple(true);
        window.setTimeout(() => setRipple(false), 300);
        onClick?.(event);
      }}
      {...props}
    >
      {ripple ? (
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-white/25 opacity-60" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
