import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";
import Card from "./Card";

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="border-dashed text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-6">
          <div className="rounded-3xl bg-accent-soft/15 p-4 text-accent">
            {typeof Icon === "string" ? (
              <span className="text-2xl select-none">{Icon}</span>
            ) : (
              <Icon className="h-6 w-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          {(actionLabel || secondaryActionLabel) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
              {secondaryActionLabel && (
                <Button variant="secondary" onClick={onSecondaryAction}>
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
