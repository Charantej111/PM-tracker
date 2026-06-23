import { motion } from "framer-motion";
import { cn } from "../utils/helpers";

export default function Card({ children, className, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.24 }}
      className={cn("soft-panel p-6", className)}
    >
      {children}
    </motion.div>
  );
}
