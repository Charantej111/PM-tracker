import { motion } from "framer-motion";
import Card from "./Card";

export default function StatCard({ icon: Icon, label, value, helper, tone = "default", children }) {
  const toneClasses = {
    default: "bg-accent-soft/12 text-accent",
    success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-3xl font-bold text-ink dark:text-white"
            >
              {value}
            </motion.h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
          </div>
          <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {children ? <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/5">{children}</div> : null}
      </div>
    </Card>
  );
}
