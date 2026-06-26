import { average, generateId, getTodayKey, formatDateKey } from "../utils/helpers";

const createActivityLog = () => {
  const values = [];

  for (let offset = 119; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const day = date.getDay();
    const count = day === 0 ? 1 : day === 6 ? 2 : Math.min(4, (offset % 5) + 1);

    values.push({
      date: formatDateKey(date),
      count,
    });
  }

  return values;
};



export const createDefaultUserData = (user = {}) => ({
  goals: {
    monthly: null,
    quarterly: null,
    yearly: null,
  },
  planner: {
    [getTodayKey()]: {
      morning: [
        { id: generateId("task"), title: "Product Management lesson", completed: false },
        { id: generateId("task"), title: "Write one user story", completed: false },
      ],
      afternoon: [
        { id: generateId("task"), title: "Practice SQL joins", completed: false },
        { id: generateId("task"), title: "Review funnel metrics", completed: false },
      ],
      evening: [
        { id: generateId("task"), title: "Communication drills", completed: false },
        { id: generateId("task"), title: "Presentation rehearsal", completed: false },
      ],
      night: [
        { id: generateId("task"), title: "Case study outline", completed: false },
        { id: generateId("task"), title: "Portfolio reflection", completed: false },
      ],
    },
  },

  skills: [
    { id: generateId("skill"), name: "Product Thinking", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "SQL", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "Analytics", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "AI", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "UI/UX", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "Communication", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "Leadership", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "Presentation", level: "Beginner", progress: 0, focusHours: 0 },
    { id: generateId("skill"), name: "Documentation", level: "Beginner", progress: 0, focusHours: 0 },
  ],
  learning: {
    weeklyGoalHours: 18,
    items: [
      { id: generateId("learn"), title: "PM Fundamentals Cohort", type: "Course", completion: 0, timeSpent: 0, weeklyGoal: 6 },
      { id: generateId("learn"), title: "SQL Practice Sprint", type: "Practice", completion: 0, timeSpent: 0, weeklyGoal: 4 },
      { id: generateId("learn"), title: "Product Sense Videos", type: "Video", completion: 0, timeSpent: 0, weeklyGoal: 3 },
      { id: generateId("learn"), title: "Analytics Reading Stack", type: "Reading", completion: 0, timeSpent: 0, weeklyGoal: 2 },
    ],
  },
  projects: [
    { id: generateId("project"), title: "PM Portfolio", status: "To Do", deadline: "2026-08-12", priority: "High", progress: 0, notes: "Polish narrative and outcomes.", tag: "Portfolio" },
    { id: generateId("project"), title: "Product Case Study", status: "To Do", deadline: "2026-07-30", priority: "High", progress: 0, notes: "Add user pain points and prioritization.", tag: "Case Study" },
    { id: generateId("project"), title: "SQL Dashboard", status: "To Do", deadline: "2026-07-18", priority: "Medium", progress: 0, notes: "Build KPI views and retention cohort.", tag: "Analytics" },
    { id: generateId("project"), title: "PRD Project", status: "To Do", deadline: "2026-06-05", priority: "Medium", progress: 0, notes: "Use as interview talking point.", tag: "Documentation" },
    { id: generateId("project"), title: "AI Product Idea", status: "To Do", deadline: "2026-08-21", priority: "Medium", progress: 0, notes: "Define problem framing and target user.", tag: "AI" },
    { id: generateId("project"), title: "Resume", status: "To Do", deadline: "2026-05-29", priority: "High", progress: 0, notes: "Tailored for PM internships.", tag: "Career" },
    { id: generateId("project"), title: "Portfolio Website", status: "To Do", deadline: "2026-08-05", priority: "High", progress: 0, notes: "Add better visual hierarchy and proof points.", tag: "Portfolio" },
  ],
  reviews: [],
  notes: [
    {
      id: generateId("note"),
      title: "Interview story bank",
      content: "<p>Use STAR framing for ownership stories and highlight decision tradeoffs.</p>",
      tags: ["interview", "storytelling"],
      favorite: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId("note"),
      title: "Metrics to revisit",
      content: "<p>Retention, activation, north star metrics, and experiment guardrails.</p>",
      tags: ["metrics", "pm"],
      favorite: false,
      updatedAt: new Date().toISOString(),
    },
  ],
  resources: [
    { id: generateId("resource"), title: "Decode & Conquer", category: "Books", type: "Book", url: "https://example.com/decode", bookmarked: false },
    { id: generateId("resource"), title: "PM Learning Roadmap", category: "Articles", type: "Article", url: "https://example.com/roadmap", bookmarked: false },
    { id: generateId("resource"), title: "Analytics for PMs", category: "Courses", type: "Course", url: "https://example.com/analytics", bookmarked: false },
    { id: generateId("resource"), title: "Case Study Templates", category: "Templates", type: "Template", url: "https://example.com/templates", bookmarked: false },
    { id: generateId("resource"), title: "Product Sense Breakdown", category: "YouTube", type: "Video", url: "https://example.com/youtube", bookmarked: false },
  ],
  portfolioGoals: [
    { id: generateId("goal"), title: "Resume", deadline: "2026-06-28", progress: 0, milestone: "Final copy approved", completed: false },
    { id: generateId("goal"), title: "LinkedIn", deadline: "2026-07-10", progress: 0, milestone: "Add featured projects", completed: false },
    { id: generateId("goal"), title: "Portfolio Website", deadline: "2026-08-08", progress: 0, milestone: "Publish case studies page", completed: false },
    { id: generateId("goal"), title: "Case Studies", deadline: "2026-07-24", progress: 0, milestone: "Finish 2 deep dives", completed: false },
    { id: generateId("goal"), title: "Mock Interviews", deadline: "2026-07-16", progress: 0, milestone: "Book 3 practice sessions", completed: false },
  ],
  motivation: {
    quotes: [
      "Progress compounds when clarity meets consistency.",
      "Strong PMs turn ambiguity into momentum.",
      "Every shipped artifact is proof of your thinking.",
      "Small systems create big career leaps.",
    ],
  },
  settings: {
    darkMode: false,
    accentColor: "blue",
    notifications: {
      milestones: true,
      weeklyReview: true,
      dailyPlanner: true,
    },
  },
  notifications: [],
  activityLog: [],
  achievements: [],
  calendarEvents: [],
  profileMeta: {
    careerGoal: user.careerGoal || "Land a product internship in 2026",
    targetRole: user.targetRole || "Associate Product Manager",
  },
});

export const accentPalette = {
  blue: { accent: "37 99 235", soft: "96 165 250" },
  navy: { accent: "37 99 235", soft: "125 170 255" },
  teal: { accent: "14 116 144", soft: "45 212 191" },
  slate: { accent: "30 41 59", soft: "148 163 184" },
};
