import { BarChart3, CheckCircle2, Sparkles, Timer } from "lucide-react";
import Card from "./Card";
import ProgressRing from "./ProgressRing";

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl animate-float">
      <div className="absolute inset-x-16 -top-8 h-32 rounded-full bg-accent-soft/30 blur-3xl" />
      <div className="glass-panel relative grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-white/80 dark:bg-slate-900/80 p-4" hover={false}>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <BarChart3 className="h-4 w-4 text-accent" />
                Overall progress
              </div>
              <div className="mt-3 text-2xl font-bold text-ink dark:text-white">74%</div>
            </Card>
            <Card className="bg-white/80 dark:bg-slate-900/80 p-4" hover={false}>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Timer className="h-4 w-4 text-accent" />
                Study streak
              </div>
              <div className="mt-3 text-2xl font-bold text-ink dark:text-white">19 days</div>
            </Card>
            <Card className="bg-white/80 dark:bg-slate-900/80 p-4" hover={false}>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Projects shipped
              </div>
              <div className="mt-3 text-2xl font-bold text-ink dark:text-white">4</div>
            </Card>
          </div>
          <Card className="bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white" hover={false}>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Sparkles className="h-4 w-4" />
              Today's focus
            </div>
            <h3 className="mt-3 text-xl font-semibold">Finish the SQL dashboard insight layer</h3>
            <div className="mt-5 h-3 rounded-full bg-white/10">
              <div className="h-3 w-[68%] rounded-full bg-gradient-to-r from-blue-300 to-white" />
            </div>
          </Card>
        </div>
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-soft dark:border-white/10 dark:bg-slate-900/90">
          <p className="text-sm text-slate-500 dark:text-slate-400">Career readiness</p>
          <div className="mt-4 flex justify-center">
            <ProgressRing value={81} label="portfolio ready" helper="steady weekly growth" />
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              Learning hours this week: <span className="font-semibold text-ink dark:text-white">22h</span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              Next milestone: <span className="font-semibold text-ink dark:text-white">Case study walkthrough</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
