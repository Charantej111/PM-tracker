import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { formatDate } from "../utils/helpers";
import { Trash2 } from "lucide-react";

const initialForm = {
  learned: "",
  challenge: "",
  improved: "",
  focusNextWeek: "",
};

export default function WeeklyReviewPage() {
  const { currentUserData, createReview, deleteReview } = useAppContext();
  const [form, setForm] = useState(initialForm);

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const reviewsList = currentUserData?.reviews || [];

  return (
    <PageShell
      title="Weekly Review"
      description="Reflect on what you learned, where you got stuck, and what deserves your focus next week."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card hover={false}>
          <div className="space-y-4">
            <InputField
              label="What did I learn?"
              as="textarea"
              rows={4}
              value={form.learned}
              onChange={(event) => setForm((previous) => ({ ...previous, learned: event.target.value }))}
              placeholder="Capture the most important insight from this week."
            />
            <InputField
              label="Biggest challenge?"
              as="textarea"
              rows={4}
              value={form.challenge}
              onChange={(event) => setForm((previous) => ({ ...previous, challenge: event.target.value }))}
              placeholder="What slowed you down or created friction?"
            />
            <InputField
              label="What improved?"
              as="textarea"
              rows={4}
              value={form.improved}
              onChange={(event) => setForm((previous) => ({ ...previous, improved: event.target.value }))}
              placeholder="Where did your process get stronger?"
            />
            <InputField
              label="What should I focus on next week?"
              as="textarea"
              rows={4}
              value={form.focusNextWeek}
              onChange={(event) => setForm((previous) => ({ ...previous, focusNextWeek: event.target.value }))}
              placeholder="Choose one or two high-leverage priorities."
            />
            <Button
              onClick={() => {
                if (!form.learned && !form.challenge && !form.improved && !form.focusNextWeek) return;
                createReview(form);
                setForm(initialForm);
              }}
            >
              Save weekly review
            </Button>
          </div>
        </Card>
        <Card hover={false}>
          <h3 className="text-xl font-semibold text-ink dark:text-white">Review history</h3>
          <div className="mt-5 space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {reviewsList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No reflections logged yet. Capture your first one on the left!</p>
            ) : (
              reviewsList.map((review) => (
                <div key={review.id} className="relative group rounded-[24px] border border-slate-200/80 p-4 dark:border-white/10 bg-white/45 dark:bg-black/10">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {formatDate(review.date || review.created_at || new Date().toISOString(), { includeYear: false })}
                    </div>
                    <button
                      onClick={() => deleteReview && deleteReview(review.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete Review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {review.learned && <p><span className="font-semibold text-ink dark:text-white">Learned:</span> {review.learned}</p>}
                    {review.challenge && <p><span className="font-semibold text-ink dark:text-white">Challenge:</span> {review.challenge}</p>}
                    {review.improved && <p><span className="font-semibold text-ink dark:text-white">Improved:</span> {review.improved}</p>}
                    {review.focusNextWeek && <p><span className="font-semibold text-ink dark:text-white">Next week:</span> {review.focusNextWeek}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
