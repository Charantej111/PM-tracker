import {
  Brain,
  Code,
  PenTool,
  Cpu,
  LineChart,
} from "lucide-react";

export const careerPresets = {
  pm: {
    id: "pm",
    role: "Product Manager",
    icon: Brain,
    accent: "#3762eb",
    gradient: "from-blue-600 to-cyan-500",
    theme: "blue",
    quote: "Focus on user value and turn ambiguity into shipped outcomes.",
    dailyHours: 6,
    difficulty: "Medium",
    readiness: 84,
    hours: 160,
    skills: [
      { name: "Product Thinking", level: "Advanced", val: 88 },
      { name: "SQL & Metrics", level: "Intermediate", val: 72 },
      { name: "User Stories & PRDs", level: "Advanced", val: 90 },
      { name: "Agile Prioritization", level: "Advanced", val: 86 }
    ],
    milestones: [
      "Define PRD & User Stories",
      "Run SQL Metrics Analysis",
      "Design Portfolio Case Study"
    ],
    planner: {
      morning: "Define PRD & core user stories",
      afternoon: "Write SQL query script for metric dashboard",
      evening: "Design portfolio case study slides",
      night: "Complete weekly reflection & log hours"
    },
    projects: [
      { title: "Product PRD Case Study", priority: "High", status: "In Progress" },
      { title: "SQL Analytics Dashboard", priority: "Medium", status: "To Do" },
      { title: "PM Portfolio Website", priority: "High", status: "Completed" }
    ],
    portfolioGoals: [
      { title: "Resume Polish", deadline: "Due in 2 days", progress: 90, milestone: "Final approval", completed: false },
      { title: "Case Studies Page", deadline: "Due in 8 days", progress: 60, milestone: "Publish two case studies", completed: false },
      { title: "Mock Interview Loops", deadline: "Due in 15 days", progress: 40, milestone: "Schedule 3 mock reviews", completed: false }
    ]
  },
  swe: {
    id: "swe",
    role: "Software Engineer",
    icon: Code,
    accent: "#6366f1",
    gradient: "from-indigo-600 to-purple-500",
    theme: "indigo",
    quote: "Write clean, maintainable systems that scale to millions of users.",
    dailyHours: 8,
    difficulty: "Hard",
    readiness: 91,
    hours: 320,
    skills: [
      { name: "System Architecture", level: "Intermediate", val: 82 },
      { name: "Data Structures & Algos", level: "Advanced", val: 94 },
      { name: "API Integration", level: "Advanced", val: 90 },
      { name: "CI/CD & Pipelines", level: "Intermediate", val: 78 }
    ],
    milestones: [
      "System Architecture Design",
      "Build Backend API Endpoints",
      "Configure Docker & Pipelines"
    ],
    planner: {
      morning: "Map out system architecture patterns",
      afternoon: "Write REST API endpoints in Node/React",
      evening: "Configure Docker Compose yaml template",
      night: "Log study hours & run pipeline tests"
    },
    projects: [
      { title: "Distributed Chat Engine", priority: "High", status: "In Progress" },
      { title: "Vite Component Library", priority: "Medium", status: "To Do" },
      { title: "Supabase Integration API", priority: "High", status: "Completed" }
    ],
    portfolioGoals: [
      { title: "LeetCode Prep", deadline: "Due in 3 days", progress: 85, milestone: "Complete 50 mediums", completed: false },
      { title: "API Gateway Project", deadline: "Due in 10 days", progress: 50, milestone: "Deploy prototype version", completed: false },
      { title: "CI Pipeline Integration", deadline: "Due in 20 days", progress: 100, milestone: "Autodeployment verified", completed: true }
    ]
  },
  uiux: {
    id: "uiux",
    role: "UI/UX Designer",
    icon: PenTool,
    accent: "#ec4899",
    gradient: "from-pink-600 to-rose-500",
    theme: "pink",
    quote: "Design intuitive interfaces that delight users with clarity.",
    dailyHours: 5,
    difficulty: "Medium",
    readiness: 78,
    hours: 190,
    skills: [
      { name: "Figma & Auto-layout", level: "Advanced", val: 95 },
      { name: "Design Systems", level: "Intermediate", val: 80 },
      { name: "User Research & Testing", level: "Intermediate", val: 76 },
      { name: "Interactive Prototyping", level: "Advanced", val: 88 }
    ],
    milestones: [
      "User Persona Research",
      "Interactive Figma Wireframes",
      "Build Component Design Library"
    ],
    planner: {
      morning: "Draft user research questions",
      afternoon: "Build auto-layout Figma high-fi screens",
      evening: "Tune design library typography styling",
      night: "Submit designer feedback checklist"
    },
    projects: [
      { title: "Mobile App Interactive Wire", priority: "High", status: "In Progress" },
      { title: "Responsive Style Guide", priority: "Medium", status: "To Do" },
      { title: "Web Component Library Mock", priority: "High", status: "Completed" }
    ],
    portfolioGoals: [
      { title: "Figma Portfolio Review", deadline: "Due in 4 days", progress: 75, milestone: "Finish case study 1", completed: false },
      { title: "Interactive Mockups V2", deadline: "Due in 12 days", progress: 40, milestone: "Complete prototyping flow", completed: false },
      { title: "Dribbble Case Study PDF", deadline: "Due in 18 days", progress: 100, milestone: "PDF exported and linked", completed: true }
    ]
  },
  ai: {
    id: "ai",
    role: "AI Engineer",
    icon: Cpu,
    accent: "#8b5cf6",
    gradient: "from-violet-600 to-indigo-600",
    theme: "violet",
    quote: "Deploy intelligent models that augment human workflows.",
    dailyHours: 8,
    difficulty: "Hard",
    readiness: 88,
    hours: 280,
    skills: [
      { name: "Model Tuning & PyTorch", level: "Advanced", val: 86 },
      { name: "RAG System Pipelines", level: "Advanced", val: 90 },
      { name: "Prompt Engineering", level: "Advanced", val: 92 },
      { name: "Vector Database Setup", level: "Intermediate", val: 78 }
    ],
    milestones: [
      "Fine-tune Transformer Model",
      "Deploy RAG System Pipeline",
      "Optimize Token Context Usage"
    ],
    planner: {
      morning: "Study self-attention mechanisms",
      afternoon: "Write model fine-tuning Python script",
      evening: "Integrate vector database embeddings",
      night: "Optimize context window token size"
    },
    projects: [
      { title: "Semantic RAG Search engine", priority: "High", status: "In Progress" },
      { title: "Context Window Optimizer", priority: "Medium", status: "To Do" },
      { title: "Fine-tuned Chat Agent API", priority: "High", status: "Completed" }
    ],
    portfolioGoals: [
      { title: "LLM Pipeline Speed Run", deadline: "Due in 5 days", progress: 95, milestone: "Deploy Docker model container", completed: false },
      { title: "RAG Evaluation Metrics", deadline: "Due in 11 days", progress: 30, milestone: "Generate precision report", completed: false },
      { title: "AI Assistant Documentation", deadline: "Due in 25 days", progress: 100, milestone: "Publish readme setup guide", completed: true }
    ]
  },
  analyst: {
    id: "analyst",
    role: "Data Analyst",
    icon: LineChart,
    accent: "#10b981",
    gradient: "from-emerald-600 to-teal-500",
    theme: "emerald",
    quote: "Uncover insights in noise and map growth trajectories.",
    dailyHours: 5,
    difficulty: "Medium",
    readiness: 82,
    hours: 140,
    skills: [
      { name: "SQL Data Modeling", level: "Advanced", val: 92 },
      { name: "Data Viz (Recharts/D3)", level: "Advanced", val: 86 },
      { name: "Cohort Analysis", level: "Intermediate", val: 78 },
      { name: "Executive Presentation", level: "Intermediate", val: 80 }
    ],
    milestones: [
      "Database Schema Mapping",
      "Vite/React Chart Integration",
      "Design Cohort Analysis Deck"
    ],
    planner: {
      morning: "Write SQL CTE queries for data pull",
      afternoon: "Connect analytical data to Recharts",
      evening: "Draft cohort analysis deck outlines",
      night: "Export PDF review & metrics checklist"
    },
    projects: [
      { title: "Cohort Analysis Dashboard", priority: "High", status: "In Progress" },
      { title: "User Activation Audit Case", priority: "Medium", status: "To Do" },
      { title: "SQL Retention Engine Mock", priority: "High", status: "Completed" }
    ],
    portfolioGoals: [
      { title: "SQL Cohort Script", deadline: "Due in 1 day", progress: 100, milestone: "Verify query execution speed", completed: true },
      { title: "Activation Funnel Review", deadline: "Due in 7 days", progress: 65, milestone: "Map checkout drop-offs", completed: false },
      { title: "Data Deck PDF Export", deadline: "Due in 14 days", progress: 45, milestone: "Export deck to folder link", completed: false }
    ]
  }
};
