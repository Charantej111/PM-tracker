import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Sparkles, TriangleAlert } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
};

export default function ToastViewport() {
  const { toasts } = useAppContext();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4 md:bottom-6 md:right-6 md:top-auto md:justify-end">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.variant] || Sparkles;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="glass-panel pointer-events-auto rounded-3xl px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-accent-soft/15 p-2 text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{toast.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {toast.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
