import { useEffect, useState } from "react";
import { ArrowUpRight, Flame, Target } from "lucide-react";
import Card from "./Card";

export default function MotivationWidget({ streak, countdownDays, quote, nextMilestone }) {
  const [visibleQuote, setVisibleQuote] = useState(quote);

  useEffect(() => {
    setVisibleQuote(quote);
  }, [quote]);

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-accent shadow-sm dark:bg-white/10">
            Motivation
          </div>
          <blockquote className="mt-4 max-w-xl text-xl font-semibold leading-8 text-ink dark:text-white">
            “{visibleQuote}”
          </blockquote>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-sm dark:bg-white/10">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Flame className="h-4 w-4 text-warning" />
                Current streak
              </div>
              <div className="mt-2 text-lg font-semibold text-ink dark:text-white">{streak} days</div>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-sm dark:bg-white/10">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Target className="h-4 w-4 text-accent" />
                Career countdown
              </div>
              <div className="mt-2 text-lg font-semibold text-ink dark:text-white">{countdownDays} days left</div>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-slate-950/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Next milestone</p>
              <h4 className="mt-2 text-lg font-semibold text-ink dark:text-white">
                {nextMilestone?.title || "Keep the momentum"}
              </h4>
            </div>
            <div className="rounded-2xl bg-accent-soft/15 p-3 text-accent">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {nextMilestone?.milestone || "Your next milestone will appear here as your goals advance."}
          </p>
          <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Finishing one meaningful artifact this week can materially improve your interview readiness.
          </div>
        </div>
      </div>
    </Card>
  );
}
