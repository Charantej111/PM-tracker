import CalendarHeatmap from "react-calendar-heatmap";
import Card from "./Card";

export default function ActivityHeatmap({ values = [] }) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 120);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink dark:text-white">Study consistency</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            GitHub-style learning streak across the last 4 months.
          </p>
        </div>
      </div>
      <div className="heatmap mt-6 overflow-x-auto">
        <CalendarHeatmap
          startDate={startDate}
          endDate={new Date()}
          values={values}
          classForValue={(value) => {
            if (!value || !value.count) return "color-empty";
            return `color-scale-${Math.min(4, value.count)}`;
          }}
          tooltipDataAttrs={(value) =>
            value.date
              ? {
                  "data-tip": `${value.count || 0} study blocks on ${value.date}`,
                }
              : {}
          }
          showWeekdayLabels
        />
      </div>
    </Card>
  );
}
