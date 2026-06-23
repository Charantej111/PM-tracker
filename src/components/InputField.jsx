import { cn } from "../utils/helpers";

export default function InputField({
  label,
  hint,
  error,
  className,
  as = "input",
  ...props
}) {
  const Element = as;

  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      <Element className={cn("input-shell", className)} {...props} />
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
}
