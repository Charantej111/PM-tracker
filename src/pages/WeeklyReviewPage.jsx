import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import { useAppContext } from "../context/AppContext";
import { formatDate } from "../utils/helpers";

const initialForm = {
  learned: "",
  challenge: "",
  improved: "",
  focusNextWeek: "",
};

export default function WeeklyReviewPage() {
  const { currentUserData, createReview } = useAppContext();
  const [form, setForm] = useState(initialForm);

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
          <div className="mt-5 space-y-4">
            {currentUserData.reviews.map((review) => (
              <div key={review.id} className="rounded-[24px] border border-slate-200/80 p-4 dark:border-white/10">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {formatDate(review.date, { includeYear: false })}
                </div>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <p><span className="font-semibold text-ink dark:text-white">Learned:</span> {review.learned}</p>
                  <p><span className="font-semibold text-ink dark:text-white">Challenge:</span> {review.challenge}</p>
                  <p><span className="font-semibold text-ink dark:text-white">Improved:</span> {review.improved}</p>
                  <p><span className="font-semibold text-ink dark:text-white">Next week:</span> {review.focusNextWeek}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
