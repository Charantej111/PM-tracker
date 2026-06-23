import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/Card";

const chartTheme = {
  grid: "rgba(148, 163, 184, 0.18)",
  axis: "#94A3B8",
  primary: "#2563EB",
  secondary: "#60A5FA",
};

export function WeeklyStudyChart({ values = [] }) {
  const data = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({
    day,
    hours: values[index] || 0,
  }));

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-ink dark:text-white">Weekly study hours</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A calm pulse on your learning consistency.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="day" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
            <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="hours"
              stroke={chartTheme.primary}
              strokeWidth={3}
              dot={{ strokeWidth: 0, r: 4, fill: chartTheme.primary }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function SkillRadarChart({ skills = [] }) {
  const data = skills.slice(0, 6).map((skill) => ({
    skill: skill.name,
    value: skill.progress,
  }));

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-ink dark:text-white">Skill progress</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Where your PM toolkit is strongest today.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke={chartTheme.grid} />
            <PolarAngleAxis dataKey="skill" tick={{ fill: chartTheme.axis, fontSize: 12 }} />
            <Radar dataKey="value" stroke={chartTheme.primary} fill={chartTheme.secondary} fillOpacity={0.45} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function MonthlyCompletionChart({ values = [] }) {
  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-ink dark:text-white">Monthly completion</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Progress trend for your learning system.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={values}>
            <CartesianGrid stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="name" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
            <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="completion" radius={[12, 12, 0, 0]}>
              {values.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={index === values.length - 1 ? chartTheme.primary : "rgba(96,165,250,0.55)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
