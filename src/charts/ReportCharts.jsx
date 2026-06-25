import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Card from "../components/Card";

const chartTheme = {
  grid: "rgba(148, 163, 184, 0.18)",
  axis: "#94A3B8",
  primary: "#2563EB",
  secondary: "#60A5FA",
  accent1: "#3B82F6",
  accent2: "#10B981",
  accent3: "#F59E0B",
  accent4: "#EF4444",
};

export function PMReadinessRadar({ skills = [] }) {
  if (skills.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Add skills in the Skills module to see your PM Readiness score map.
      </div>
    );
  }

  const data = skills.map((skill) => ({
    skill: skill.name,
    value: skill.progress || 0,
  }));

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke={chartTheme.grid} />
          <PolarAngleAxis dataKey="skill" tick={{ fill: chartTheme.axis, fontSize: 10 }} />
          <Radar
            name="Skill Progress"
            dataKey="value"
            stroke={chartTheme.primary}
            fill={chartTheme.secondary}
            fillOpacity={0.45}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectStatusPie({ projects = [] }) {
  const todo = projects.filter((p) => p.status === "To Do").length;
  const inProgress = projects.filter((p) => p.status === "In Progress").length;
  const completed = projects.filter((p) => p.status === "Completed").length;

  if (projects.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        No projects logged yet.
      </div>
    );
  }

  const data = [
    { name: "To Do", value: todo, color: chartTheme.secondary },
    { name: "In Progress", value: inProgress, color: chartTheme.primary },
    { name: "Completed", value: completed, color: chartTheme.accent2 },
  ].filter((item) => item.value > 0);

  return (
    <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} projects`, "Count"]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-xs font-semibold mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 dark:text-slate-300">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyHoursBar({ learningItems = [] }) {
  const data = [
    { name: "Course", hours: 0 },
    { name: "Practice", hours: 0 },
    { name: "Video", hours: 0 },
    { name: "Reading", hours: 0 },
  ];

  learningItems.forEach((item) => {
    const matching = data.find((d) => d.name === item.type);
    if (matching) {
      matching.hours += item.timeSpent || 0;
    }
  });

  const hasHours = data.some((d) => d.hours > 0);
  if (!hasHours) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        No study hours logged this week.
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} />
          <XAxis dataKey="name" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
          <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => [`${value}h`, "Time Spent"]} />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => {
              const colors = [chartTheme.primary, chartTheme.secondary, chartTheme.accent2, chartTheme.accent3];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RoadmapCompletionBar({ roadmap = {} }) {
  const categories = Object.keys(roadmap);
  if (categories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        No roadmap categories found.
      </div>
    );
  }

  const data = categories.map((cat) => {
    const topics = roadmap[cat] || [];
    const completedCount = topics.filter((t) => t.completed).length;
    const progress = topics.length > 0
      ? Math.round((topics.reduce((sum, t) => sum + (t.progress || 0), 0) / (topics.length * 100)) * 100)
      : 0;

    return {
      name: cat,
      progress,
      completed: completedCount,
      total: topics.length,
    };
  });

  return (
    <div className="h-64 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
        >
          <CartesianGrid stroke={chartTheme.grid} horizontal={false} />
          <XAxis type="number" stroke={chartTheme.axis} domain={[0, 100]} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke={chartTheme.axis}
            tickLine={false}
            axisLine={false}
            width={100}
            tick={{ fontSize: 10 }}
          />
          <Tooltip formatter={(value) => [`${value}%`, "Category Completion"]} />
          <Bar dataKey="progress" fill={chartTheme.primary} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
