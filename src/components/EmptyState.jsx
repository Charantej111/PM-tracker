import { Sparkles } from "lucide-react";
import Button from "./Button";
import Card from "./Card";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Card className="border-dashed text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-6">
        <div className="rounded-3xl bg-accent-soft/15 p-4 text-accent">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink dark:text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </div>
    </Card>
  );
}
