import { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Confetti from "react-confetti";
import { accentPalette, createDefaultUserData } from "../data/defaultData";
import { computeRoadmapMetrics } from "../utils/roadmapMetrics";
import { computeGoalMetrics } from "../utils/reportUtils";
import { useAuth } from "./AuthContext";
import { db } from "../lib/db";
import { supabase } from "../lib/supabaseClient";
import {
  average,
  daysUntil,
  downloadTextFile,
  formatDate,
  generateId,
  getInitials,
  getTodayKey,
  formatDateKey,
  levelOrder,
  percent,
  getWeekStartKey,
} from "../utils/helpers";

const AppContext = createContext(null);

// Dev-telemetry helpers
const requestTracker = new Set();
const logDevApiRequest = (name) => {
  if (import.meta.env.DEV) {
    if (requestTracker.has(name)) {
      console.warn(`[DevPerf] Duplicate API query detected in this session: ${name}`);
    } else {
      requestTracker.add(name);
      console.log(`[DevPerf] API request dispatched: ${name}`);
    }
  }
};

const logSlowOperation = (name, startTime) => {
  if (import.meta.env.DEV) {
    const duration = performance.now() - startTime;
    if (duration > 100) {
      console.warn(`[DevPerf] Slow Operation: "${name}" took ${duration.toFixed(1)}ms (threshold 100ms)`);
    }
  }
};

export const useRenderCounter = (componentName) => {
  const countRef = useRef(0);
  useEffect(() => {
    if (import.meta.env.DEV) {
      countRef.current += 1;
      console.log(`[DevPerf] [Render] <${componentName}> rendered ${countRef.current} times`);
    }
  });
};

const DATA_KEY = "pm-career-os-user-data";

export const ACHIEVEMENTS_LIST = [
  { id: "first_checkin", title: "First Step", desc: "Completed your first daily check-in.", icon: "🎯" },
  { id: "streak_3", title: "Flame Starter", desc: "Reached a 3-day check-in streak.", icon: "🔥" },
  { id: "streak_7", title: "Weekly Habit", desc: "Reached a 7-day check-in streak.", icon: "🏆" },
  { id: "streak_14", title: "Unstoppable", desc: "Reached a 14-day check-in streak.", icon: "👑" },
  { id: "study_10", title: "Deep Focus", desc: "Logged 10+ hours in the Learning Hub.", icon: "⚡" },
  { id: "skill_80", title: "Skill Mastery", desc: "Reached 80% progress on any skill.", icon: "🧠" },
  { id: "project_done", title: "Shipped!", desc: "Finished a portfolio project card.", icon: "🚀" },
  { id: "review_done", title: "Self-Reflective", desc: "Completed your first weekly reflection.", icon: "📝" },
];

const calculateStreak = (activityLog = []) => {
  if (!activityLog || !activityLog.length) return 0;

  const map = new Map(activityLog.map((entry) => [entry.date, entry.count]));
  const today = getTodayKey();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);

  const todayActive = (map.get(today) || 0) > 0;
  const yesterdayActive = (map.get(yesterday) || 0) > 0;

  if (!todayActive && !yesterdayActive) {
    return 0;
  }

  let streak = 0;
  let currentKey = todayActive ? today : yesterday;

  while (true) {
    if ((map.get(currentKey) || 0) > 0) {
      streak += 1;
      const [year, month, day] = currentKey.split("-").map(Number);
      const tempDate = new Date(year, month - 1, day - 1);
      currentKey = formatDateKey(tempDate);
      continue;
    }
    break;
  }

  return streak;
};

const calculatePlannerCompletion = (plannerDay = {}) => {
  const tasks = Object.values(plannerDay).flat().filter(Boolean);
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
  };
};

const deriveDashboardMetrics = (user, userData) => {
  const todayPlan = userData?.planner?.[getTodayKey()] || {};
  const plannerStats = calculatePlannerCompletion(todayPlan);
  
  const roadmapMetrics = computeRoadmapMetrics(userData?.roadmap);
  
  // Weekly hours combine Learning Hub explicit hours + Roadmap estimated hours completed
  const learningHubWeekly = userData?.learning?.items?.reduce((sum, item) => sum + (item.timeSpent || 0), 0) || 0;
  const weeklyHours = Math.round(learningHubWeekly + (roadmapMetrics.estimatedHoursCompleted || 0));

  const activeSkill = [...(userData?.skills || [])].sort((a, b) => (b.focusHours || 0) - (a.focusHours || 0))[0] || null;
  const nextMilestone =
    [...(userData?.portfolioGoals || [])]
      .filter((goal) => !goal.completed)
      .sort((a, b) => new Date(a.deadline || a.target_date) - new Date(b.deadline || b.target_date))[0] || null;

  const skillProgress = (userData?.skills?.length || 0) > 0 ? average(userData.skills.map((skill) => skill.progress || 0)) : 0;
  const projectProgress = (userData?.projects?.length || 0) > 0 ? average(userData.projects.map((project) => project.progress || 0)) : 0;
  const portfolioProgress = (userData?.portfolioGoals?.length || 0) > 0 ? average(userData.portfolioGoals.map((goal) => goal.progress || 0)) : 0;
  
  const overallProgress = Math.round((roadmapMetrics.overallCompletionPct + skillProgress + projectProgress + portfolioProgress) / 4);

  // Dynamic Weekly Study Chart Data (spread weeklyHours across the current week up to today)
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1; // Map Sun(0) to 6, Mon(1) to 0
  const weeklyStudyChartData = [0, 0, 0, 0, 0, 0, 0];
  const spread = Math.floor(weeklyHours / (currentDayIndex + 1));
  const remainder = weeklyHours - (spread * (currentDayIndex + 1));
  for (let i = 0; i <= currentDayIndex; i++) {
     weeklyStudyChartData[i] = spread + (i === currentDayIndex ? remainder : 0);
  }

  // Dynamic Monthly Completion Data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const monthlyCompletionChartData = [
    {
      name: monthNames[currentMonth],
      completion: overallProgress
    }
  ];

  const goalMetrics = computeGoalMetrics(userData?.goals, roadmapMetrics, { hoursStudiedThisWeek: weeklyHours });

  return {
    overallProgress,
    roadmapMetrics,
    goalMetrics,
    weeklyStudyChartData,
    monthlyCompletionChartData,
    currentStreak: calculateStreak(userData?.activityLog || []),
    todayCompletion: percent(plannerStats.completed, plannerStats.total),
    hoursStudiedThisWeek: weeklyHours,
    activeSkill,
    nextMilestone,
    completedSkills: (userData?.skills || []).filter((skill) => (skill.progress || 0) >= 80).length,
    activeProjects: (userData?.projects || []).filter((project) => project.status !== "Completed").length,
    userName: user?.name || "PM Builder",
  };
};

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
};

const FullScreenConfetti = () => {
  const { width, height } = useWindowSize();
  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={280}
      gravity={0.22}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}
      colors={["#2563EB", "#60A5FA", "#22C55E", "#F59E0B", "#A78BFA", "#FFFFFF"]}
    />
  );
};

export const AppProvider = ({ children }) => {
  const { user: authUser, profile } = useAuth();

  const currentUser = useMemo(() => {
    return authUser && profile
      ? {
          id: authUser.id,
          name: profile.name || authUser.email?.split("@")[0] || "PM Builder",
          email: profile.email || authUser.email || "",
          careerGoal: profile.career_goal || "",
          targetRole: profile.target_role || "",
          avatar: profile.avatar_url || "",
          createdAt: profile.created_at || authUser.created_at,
        }
      : null;
  }, [authUser, profile]);

  const [toasts, setToasts] = useState([]);
  const [celebration, setCelebration] = useState(null);
  const [activeAchievementCelebration, setActiveAchievementCelebration] = useState(null);

  // Supabase states
  const [projectsState, setProjectsState] = useState([]);
  const [skillsState, setSkillsState] = useState([]);
  const [tasksState, setTasksState] = useState([]);
  const [notesState, setNotesState] = useState([]);
  const [roadmapState, setRoadmapState] = useState({ mainTopics: [], byCategory: {} });
  const [resourcesState, setResourcesState] = useState([]);
  const [reviewsState, setReviewsState] = useState([]);
  const [portfolioGoalsState, setPortfolioGoalsState] = useState([]);
  const [weeklyGoalState, setWeeklyGoalState] = useState(null);
  const [metadataState, setMetadataState] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const dbTimeouts = useRef({});

  const debounceDb = (key, fn, delay = 800) => {
    if (dbTimeouts.current[key]) {
      clearTimeout(dbTimeouts.current[key]);
    }
    dbTimeouts.current[key] = setTimeout(async () => {
      delete dbTimeouts.current[key];
      await fn();
    }, delay);
  };

  const [guestDarkMode, setGuestDarkMode] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pm-guest-dark-mode");
      if (saved !== null) return saved === "true";
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const isDarkMode = currentUser ? Boolean(metadataState?.settings?.darkMode) : guestDarkMode;

  const toggleTheme = () => {
    if (currentUser) {
      updateSettings({ darkMode: !metadataState?.settings?.darkMode });
    } else {
      setGuestDarkMode((prev) => {
        const next = !prev;
        try {
          window.localStorage.setItem("pm-guest-dark-mode", String(next));
        } catch {}
        return next;
      });
    }
  };

  useEffect(() => {
    const accentColor = metadataState?.settings?.accentColor || "blue";
    const accent = accentPalette[accentColor] || accentPalette.blue;

    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.style.setProperty("--accent", accent.accent);
    document.documentElement.style.setProperty("--accent-soft", accent.soft);
  }, [metadataState?.settings?.accentColor, isDarkMode]);

  const loadUserData = async (userId, preloadedMetadata = null) => {
    let startTime;
    if (import.meta.env.DEV) {
      startTime = performance.now();
      logDevApiRequest("projects");
      logDevApiRequest("skills");
      logDevApiRequest("tasks");
      logDevApiRequest("notes");
      logDevApiRequest("roadmap_progress");
      logDevApiRequest("reviews");
      logDevApiRequest("resources");
      logDevApiRequest("portfolio_goals");
      logDevApiRequest("weekly_goals");
      if (!preloadedMetadata) {
        logDevApiRequest("profiles_metadata");
      }
    }
    try {
      const currentWeekStart = getWeekStartKey();
      const queries = [
        db.projects.getProjects(),
        db.skills.getSkills(),
        db.tasks.getTasks(),
        db.notes.getNotes(),
        db.roadmap.getRoadmapProgress(),
        db.reviews.getReviews(),
        db.resources.getResources(),
        db.portfolioGoals.getPortfolioGoals(),
        db.weeklyGoals.getWeeklyGoal(currentWeekStart),
      ];

      if (!preloadedMetadata) {
        queries.push(supabase.from("profiles").select("metadata").eq("id", userId).maybeSingle());
      }

      const results = await Promise.all(queries);
      const [
        projData,
        skillsData,
        tasksData,
        notesData,
        roadmapData,
        reviewsData,
        resData,
        pfGoalsData,
        weeklyGoalData,
        profData
      ] = results;

      setProjectsState(projData || []);
      setSkillsState(skillsData || []);
      setTasksState(tasksData || []);
      setNotesState(notesData || []);
      setRoadmapState(roadmapData || { mainTopics: [], byCategory: {} });
      setReviewsState(reviewsData || []);
      setResourcesState(resData || []);
      setPortfolioGoalsState(pfGoalsData || []);
      setWeeklyGoalState(weeklyGoalData || { targetHours: 18, currentHours: 0, weekStart: currentWeekStart });

      if (preloadedMetadata) {
        setMetadataState(preloadedMetadata || {});
      } else {
        if (profData?.error) throw profData.error;
        setMetadataState(profData?.data?.metadata || {});
      }
      logSlowOperation("loadUserData", startTime);
    } catch (err) {
      console.error("Error loading user data:", err);
      showToast("Data Sync Error", "Could not synchronize with database: " + err.message, "error");
    }
  };

  const checkAndMigrateData = async (userId) => {
    setLoadingData(true);
    try {
      const { data: prof, error: profError } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", userId)
        .maybeSingle();

      if (profError) throw profError;

      const currentMeta = prof?.metadata || {};
      if (currentMeta.migrated === true || localStorage.getItem("pm-career-os-migrated-" + userId) === "true") {
        await loadUserData(userId, currentMeta);
        return;
      }

      // Perform migration or seeding
      const localData = JSON.parse(localStorage.getItem(DATA_KEY) || "{}")[userId];
      const defaultData = createDefaultUserData({ id: userId });

      if (localData && (localData.projects?.length > 0 || localData.skills?.length > 0 || localData.notes?.length > 0)) {
        console.log("Migrating LocalStorage data to Supabase...");
        showToast("Migration", "Migrating your local workspace to cloud...", "default");

        if (localData.projects && localData.projects.length > 0) {
          const projPayload = localData.projects.map(p => ({
            user_id: userId,
            name: p.title || p.name || "",
            description: p.notes || p.description || "",
            status: p.status || "To Do",
            progress: p.progress || 0,
            tags: p.tag ? [p.tag] : (p.tags || []),
            deadline: p.deadline || null,
            priority: p.priority || "Medium",
            link: p.link || "",
          }));
          await supabase.from("projects").insert(projPayload);
        }

        if (localData.skills && localData.skills.length > 0) {
          const skillPayload = localData.skills.map(s => ({
            user_id: userId,
            name: s.name,
            progress: s.progress || 0,
            focus_hours: s.focusHours || s.focus_hours || 0,
            level: s.level || "Beginner",
          }));
          await supabase.from("skills").insert(skillPayload);
        }

        if (localData.notes && localData.notes.length > 0) {
          const notePayload = localData.notes.map(n => ({
            user_id: userId,
            title: n.title || "Untitled",
            content: n.content || "",
            tags: n.tags || [],
            pinned: n.pinned || n.favorite || false,
            color: n.color || "default",
            updated_at: n.updatedAt || n.updated_at || new Date().toISOString(),
          }));
          await supabase.from("notes").insert(notePayload);
        }

        const taskPayload = [];
        if (localData.planner) {
          Object.entries(localData.planner).forEach(([date, day]) => {
            Object.entries(day).forEach(([period, tasksList]) => {
              if (Array.isArray(tasksList)) {
                tasksList.forEach(t => {
                  taskPayload.push({
                    user_id: userId,
                    title: t.title,
                    completed: t.completed || false,
                    period,
                    date,
                  });
                });
              }
            });
          });
        }
        if (taskPayload.length > 0) {
          await supabase.from("tasks").insert(taskPayload);
        }

        const roadmapPayload = [];
        if (localData.roadmap) {
          Object.entries(localData.roadmap).forEach(([category, topics]) => {
            if (Array.isArray(topics)) {
              topics.forEach(t => {
                if (t.progress > 0 || t.completed || t.notes) {
                  roadmapPayload.push({
                    user_id: userId,
                    category,
                    topic_id: t.id,
                    topic_title: t.name || "",
                    completed: t.completed || false,
                    progress: t.progress || 0,
                    notes: t.notes || "",
                    updated_at: new Date().toISOString(),
                  });
                }
              });
            }
          });
        }
        if (roadmapPayload.length > 0) {
          await supabase.from("roadmap_progress").insert(roadmapPayload);
        }

        if (localData.resources && localData.resources.length > 0) {
          const resPayload = localData.resources.map(r => ({
            user_id: userId,
            title: r.title,
            category: r.category || "",
            url: r.url || "",
            description: r.description || "",
            type: r.type || "",
            bookmarked: r.bookmarked || false,
            favorite: r.favorite || false,
            completed: r.completed || false,
          }));
          await supabase.from("resources").insert(resPayload);
        } else {
          const resPayload = defaultData.resources.map(r => ({
            user_id: userId,
            title: r.title,
            category: r.category || "",
            url: r.url || "",
            description: r.description || "",
            type: r.type || "",
            bookmarked: r.bookmarked || false,
            favorite: r.favorite || false,
            completed: r.completed || false,
          }));
          await supabase.from("resources").insert(resPayload);
        }

        if (localData.portfolioGoals && localData.portfolioGoals.length > 0) {
          const goalPayload = localData.portfolioGoals.map(g => ({
            user_id: userId,
            title: g.title,
            description: g.milestone || g.description || "",
            progress: g.progress || 0,
            completed: g.completed || g.progress === 100 ? true : false,
            status: g.completed || g.progress === 100 ? "Completed" : "In Progress",
            priority: g.priority || "Medium",
            target_date: g.deadline || g.target_date || null,
          }));
          await supabase.from("portfolio_goals").insert(goalPayload);
        } else {
          const goalPayload = defaultData.portfolioGoals.map(g => ({
            user_id: userId,
            title: g.title,
            description: g.milestone || "",
            progress: g.progress || 0,
            completed: g.completed || g.progress === 100 ? true : false,
            status: g.completed || g.progress === 100 ? "Completed" : "In Progress",
            priority: g.priority || "Medium",
            target_date: g.deadline || null,
          }));
          await supabase.from("portfolio_goals").insert(goalPayload);
        }

        if (localData.reviews && localData.reviews.length > 0) {
          const reviewsPayload = localData.reviews.map(r => ({
            user_id: userId,
            wins: r.learned || r.wins || "",
            challenges: r.challenge || r.challenges || "",
            improvements: r.improved || r.improvements || "",
            next_focus: r.focusNextWeek || r.next_focus || "",
            rating: r.rating || null,
            created_at: r.date || r.created_at || new Date().toISOString(),
          }));
          await supabase.from("weekly_reviews").insert(reviewsPayload);
        }

        const metadataPayload = {
          goals: localData.goals || { monthly: null, quarterly: null, yearly: null },
          learning: localData.learning || defaultData.learning,
          motivation: localData.motivation || defaultData.motivation,
          settings: localData.settings || defaultData.settings,
          notifications: localData.notifications || defaultData.notifications,
          activityLog: localData.activityLog || defaultData.activityLog,
          achievements: localData.achievements || defaultData.achievements,
          calendarEvents: localData.calendarEvents || defaultData.calendarEvents,
          migrated: true,
        };

        await supabase.from("profiles").update({ metadata: metadataPayload }).eq("id", userId);
        showToast("Migration Complete", "Your local data is now in Supabase.");
      } else {
        console.log("No LocalStorage data found. Seeding default data to Supabase...");

        const defaultProj = defaultData.projects.map(p => ({
          user_id: userId,
          name: p.title,
          description: p.notes,
          status: p.status,
          progress: p.progress,
          tags: p.tag ? [p.tag] : [],
          deadline: p.deadline || null,
          priority: p.priority || 'Medium',
          link: p.link || '',
        }));
        await supabase.from("projects").insert(defaultProj);

        const defaultSkills = defaultData.skills.map(s => ({
          user_id: userId,
          name: s.name,
          progress: s.progress,
          focus_hours: s.focusHours,
          level: s.level,
        }));
        await supabase.from("skills").insert(defaultSkills);

        const defaultNotes = defaultData.notes.map(n => ({
          user_id: userId,
          title: n.title,
          content: n.content,
          tags: n.tags,
          pinned: n.favorite || false,
          color: n.color || 'default',
        }));
        await supabase.from("notes").insert(defaultNotes);

        const defaultTasks = [];
        Object.entries(defaultData.planner).forEach(([date, day]) => {
          Object.entries(day).forEach(([period, tasksList]) => {
            tasksList.forEach(t => {
              defaultTasks.push({
                user_id: userId,
                title: t.title,
                completed: t.completed,
                period,
                date,
              });
            });
          });
        });
        if (defaultTasks.length > 0) {
          await supabase.from("tasks").insert(defaultTasks);
        }

        const defaultResources = defaultData.resources.map(r => ({
          user_id: userId,
          title: r.title,
          category: r.category || "",
          url: r.url || "",
          description: r.description || "",
          type: r.type || "",
          bookmarked: r.bookmarked || false,
          favorite: r.favorite || false,
          completed: r.completed || false,
        }));
        await supabase.from("resources").insert(defaultResources);

        const defaultPortfolio = defaultData.portfolioGoals.map(g => ({
          user_id: userId,
          title: g.title,
          description: g.milestone || "",
          progress: g.progress || 0,
          completed: g.completed || g.progress === 100 ? true : false,
          status: g.completed || g.progress === 100 ? "Completed" : "In Progress",
          priority: g.priority || "Medium",
          target_date: g.deadline || null,
        }));
        await supabase.from("portfolio_goals").insert(defaultPortfolio);

        const metadataPayload = {
          goals: { monthly: null, quarterly: null, yearly: null },
          learning: defaultData.learning,
          motivation: defaultData.motivation,
          settings: defaultData.settings,
          notifications: defaultData.notifications,
          activityLog: defaultData.activityLog,
          achievements: defaultData.achievements,
          calendarEvents: defaultData.calendarEvents,
          migrated: true,
        };

        await supabase.from("profiles").update({ metadata: metadataPayload }).eq("id", userId);
      }

      localStorage.setItem("pm-career-os-migrated-" + userId, "true");
      await loadUserData(userId);
    } catch (err) {
      console.error("Migration failed:", err);
      showToast("Migration Error", "Failed to migrate data: " + err.message, "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      checkAndMigrateData(currentUser.id);
    } else {
      // Clear data on logout
      setProjectsState([]);
      setSkillsState([]);
      setTasksState([]);
      setNotesState([]);
      setRoadmapState({ mainTopics: [], byCategory: {} });
      setResourcesState([]);
      setReviewsState([]);
      setPortfolioGoalsState([]);
      setWeeklyGoalState(null);
      setMetadataState({});
    }
  }, [currentUser?.id]);

  const currentUserData = useMemo(() => {
    if (!currentUser) return null;

    const planner = {};
    tasksState.forEach(task => {
      const date = task.date;
      if (!planner[date]) {
        planner[date] = { morning: [], afternoon: [], evening: [], night: [] };
      }
      if (planner[date][task.period]) {
        planner[date][task.period].push(task);
      }
    });

    const roadmap = roadmapState;
    const meta = metadataState || {};

    return {
      goals: meta.goals || { monthly: null, quarterly: null, yearly: null },
      planner,
      roadmap,
      skills: skillsState,
      learning: {
        weeklyGoalHours: weeklyGoalState?.targetHours ?? meta.learning?.weeklyGoalHours ?? 18,
        items: meta.learning?.items || [
          { id: "learn_1", title: "PM Fundamentals Cohort", type: "Course", completion: 0, timeSpent: 0, weeklyGoal: 6 },
          { id: "learn_2", title: "SQL Practice Sprint", type: "Practice", completion: 0, timeSpent: 0, weeklyGoal: 4 },
          { id: "learn_3", title: "Product Sense Videos", type: "Video", completion: 0, timeSpent: 0, weeklyGoal: 3 },
          { id: "learn_4", title: "Analytics Reading Stack", type: "Reading", completion: 0, timeSpent: 0, weeklyGoal: 2 },
        ],
      },
      projects: projectsState,
      reviews: reviewsState,
      notes: notesState,
      resources: resourcesState,
      portfolioGoals: portfolioGoalsState,
      motivation: meta.motivation || {
        quotes: [
          "Progress compounds when clarity meets consistency.",
          "Strong PMs turn ambiguity into momentum.",
          "Every shipped artifact is proof of your thinking.",
          "Small systems create big career leaps.",
        ],
      },
      settings: meta.settings || {
        darkMode: false,
        accentColor: "blue",
        notifications: { milestones: true, weeklyReview: true, dailyPlanner: true },
      },
      notifications: meta.notifications || [],
      activityLog: meta.activityLog || [],
      achievements: meta.achievements || [],
      calendarEvents: meta.calendarEvents || [],
      profileMeta: meta.profileMeta || {
        careerGoal: currentUser?.careerGoal || "Land a product internship in 2026",
        targetRole: currentUser?.targetRole || "Associate Product Manager",
      },
    };
  }, [currentUser, projectsState, skillsState, tasksState, notesState, roadmapState, metadataState, reviewsState, resourcesState, portfolioGoalsState, weeklyGoalState]);

  const updateGoal = (scope, payload) => {
    updateMetadata((prev) => {
      const existing = prev.goals?.[scope] || {};
      return {
        ...(prev || {}),
        goals: {
          ...(prev.goals || {}),
          [scope]: {
            ...existing,
            ...payload,
            createdAt: existing.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  };

  const updateMetadata = useCallback((nextValOrUpdater) => {
    if (!currentUser) return;
    setMetadataState((prev) => typeof nextValOrUpdater === "function" ? nextValOrUpdater(prev) : nextValOrUpdater);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !metadataState || Object.keys(metadataState).length === 0) return;
    
    debounceDb("metadata-sync", async () => {
      try {
        await supabase
          .from("profiles")
          .update({ metadata: metadataState })
          .eq("id", currentUser.id);
      } catch (err) {
        console.error("Failed to sync metadata:", err);
      }
    }, 800);
  }, [metadataState, currentUser]);

  const weeklyHours = currentUserData?.learning?.items?.reduce((sum, item) => sum + (item.timeSpent || 0), 0) || 0;
  
  useEffect(() => {
    if (!currentUser || weeklyGoalState === null) return;
    
    if (weeklyGoalState.currentHours !== weeklyHours) {
      setWeeklyGoalState(prev => ({ ...prev, currentHours: weeklyHours }));
      const weekStart = getWeekStartKey();
      const targetHours = weeklyGoalState.targetHours;
      
      debounceDb("weeklyGoal-sync", async () => {
        try {
          await db.weeklyGoals.updateWeeklyGoal(weekStart, targetHours, weeklyHours);
        } catch (err) {
          console.error("Failed to sync weekly study goal:", err);
        }
      }, 800);
    }
  }, [weeklyHours, weeklyGoalState?.targetHours, currentUser]);

  const addNotification = useCallback((title, body) => {
    updateMetadata((prev) => {
      const updatedNotices = [
        {
          id: generateId("notice"),
          title,
          body,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...(prev.notifications || []),
      ].slice(0, 8);

      return {
        ...prev,
        notifications: updatedNotices,
      };
    });
  }, [updateMetadata]);

  const showToast = useCallback((title, description, variant = "default") => {
    const id = generateId("toast");
    setToasts((previous) => [...previous, { id, title, description, variant }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const triggerCelebration = useCallback((title, description = "Big momentum for your PM journey.") => {
    setCelebration({ title, description });
    showToast(title, description, "success");
    window.setTimeout(() => setCelebration(null), 4200);
  }, [showToast]);

  const updateProfile = (updates) => {
    showToast("Profile updated", "Your profile changes were saved.");
  };

  const markAllNotificationsRead = () => {
    updateMetadata((prev) => {
      const readNotices = (prev.notifications || []).map((notification) => ({
        ...notification,
        read: true,
      }));

      return {
        ...prev,
        notifications: readNotices,
      };
    });
  };

  const logActivity = (count = 1) => {
    const today = getTodayKey();
    
    updateMetadata((prev) => {
      const existingLog = prev.activityLog || [];
      const found = existingLog.find((entry) => entry.date === today);
      const activityLog = found
        ? existingLog.map((entry) =>
            entry.date === today ? { ...entry, count: entry.count + count } : entry,
          )
        : [...existingLog, { date: today, count }];

      return {
        ...prev,
        activityLog,
      };
    });
  };

  const updatePlannerTask = useCallback(async (date, period, taskId, updates) => {
    const task = tasksState.find(t => t.id === taskId);
    if (!task) return;
    const prev = { ...task };

    setTasksState(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, ...updates } : t));

    try {
      await db.tasks.updateTask(taskId, updates);
      showToast("Planner updated", "Your daily planner was updated.");
      if (updates.completed && !prev.completed) logActivity(1);
    } catch (err) {
      setTasksState(prevTasks => prevTasks.map(t => t.id === taskId ? prev : t));
      showToast("Sync Error", err.message, "error");
    }
  }, [tasksState, showToast, logActivity]);

  const addPlannerTask = useCallback(async (date, period, title) => {
    try {
      const newTask = await db.tasks.createTask({ title, completed: false, period, date });
      setTasksState(prev => [...prev, newTask]);
      showToast("Task added", `Added a new ${period} task.`);
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  }, [showToast]);

  const deletePlannerTask = useCallback(async (taskId) => {
    const task = tasksState.find(t => t.id === taskId);
    if (!task) return;

    setTasksState(prev => prev.filter(t => t.id !== taskId));

    try {
      await db.tasks.deleteTask(taskId);
      showToast("Task deleted", "The task was removed from your daily planner.");
    } catch (err) {
      setTasksState(prev => [...prev, task]);
      showToast("Sync Error", err.message, "error");
    }
  }, [tasksState, showToast]);

  const addMainTopic = async (name) => {
    try {
      const order = roadmapState.mainTopics.length;
      const dbRow = await db.roadmap.createMainTopic(name, order);
      setRoadmapState((prev) => ({
        ...prev,
        mainTopics: [...prev.mainTopics, { id: dbRow.id, name, sortOrder: order }],
        byCategory: { ...prev.byCategory, [name]: [] }
      }));
      showToast("Main Topic created", `Added "${name}"`);
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const renameMainTopic = async (oldName, newName) => {
    if (oldName === newName) return;
    
    // Optimistic update
    setRoadmapState((prev) => {
      const updatedTopics = prev.mainTopics.map(t => t.name === oldName ? { ...t, name: newName } : t);
      const updatedByCategory = { ...prev.byCategory };
      updatedByCategory[newName] = updatedByCategory[oldName] || [];
      delete updatedByCategory[oldName];
      return { mainTopics: updatedTopics, byCategory: updatedByCategory };
    });
    
    try {
      await db.roadmap.renameMainTopic(oldName, newName);
    } catch (err) {
      // Revert in full load to avoid complex rollback logic
      loadUserData(currentUser.id);
      showToast("Sync Error", err.message, "error");
    }
  };

  const deleteMainTopic = async (name) => {
    // Optimistic
    setRoadmapState((prev) => {
      const updatedTopics = prev.mainTopics.filter(t => t.name !== name);
      const updatedByCategory = { ...prev.byCategory };
      delete updatedByCategory[name];
      return { mainTopics: updatedTopics, byCategory: updatedByCategory };
    });
    try {
      await db.roadmap.deleteMainTopic(name);
      showToast("Main Topic deleted", `Removed "${name}"`);
    } catch (err) {
      loadUserData(currentUser.id);
      showToast("Sync Error", err.message, "error");
    }
  };

  const reorderMainTopics = async (reorderedMainTopics) => {
    setRoadmapState(prev => ({ ...prev, mainTopics: reorderedMainTopics }));
    const dbPayload = reorderedMainTopics
      .filter(t => !t.id.startsWith("virtual-"))
      .map((t, idx) => ({ id: t.id, sort_order: idx }));
    try {
      await db.roadmap.reorderTopics(dbPayload);
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const addSubTopic = async (category, name) => {
    const topicId = generateId("topic");
    const order = (roadmapState.byCategory[category] || []).length;
    
    // Optimistic
    const newSubTopic = {
      id: topicId,
      category,
      name,
      completed: false,
      progress: 0,
      status: "Not Started",
      notes: "",
      estimatedHours: null,
      priority: "Medium",
      sortOrder: order,
      updatedAt: new Date().toISOString()
    };
    
    setRoadmapState(prev => ({
      ...prev,
      byCategory: {
        ...prev.byCategory,
        [category]: [...(prev.byCategory[category] || []), newSubTopic]
      }
    }));
    
    try {
      const dbRow = await db.roadmap.createSubTopic(category, topicId, name, order, "Medium");
      
      // Update with real db row ID just in case
      setRoadmapState(prev => {
        const list = prev.byCategory[category] || [];
        const updatedList = list.map(t => t.id === topicId ? { ...t, row_id: dbRow.id } : t);
        return { ...prev, byCategory: { ...prev.byCategory, [category]: updatedList } };
      });
      
      showToast("Sub Topic added", `Added "${name}" to ${category}`);
    } catch (err) {
      setRoadmapState(prev => ({
        ...prev,
        byCategory: {
          ...prev.byCategory,
          [category]: (prev.byCategory[category] || []).filter(t => t.id !== topicId)
        }
      }));
      showToast("Sync Error", err.message, "error");
    }
  };

  const updateSubTopic = async (category, topicId, updates) => {
    const currentList = roadmapState.byCategory[category] || [];
    const existing = currentList.find(t => t.id === topicId);
    if (!existing) return;

    const normalized = { ...updates };
    if (updates.completed !== undefined && updates.progress === undefined) {
      normalized.progress = updates.completed ? 100 : (existing.progress === 100 ? 0 : existing.progress);
      normalized.status = updates.completed ? "Completed" : (normalized.progress === 0 ? "Not Started" : "Practicing");
    }
    if (updates.progress !== undefined) {
      normalized.completed = updates.progress === 100;
      if (updates.progress === 0) normalized.status = "Not Started";
      else if (updates.progress > 0 && updates.progress <= 30) normalized.status = "Learning";
      else if (updates.progress > 30 && updates.progress < 100) normalized.status = "Practicing";
      else normalized.status = "Completed";
    }

    const completedTransition = !existing.completed && normalized.progress === 100;

    // Optimistic Update
    setRoadmapState(prev => {
      const list = prev.byCategory[category] || [];
      const updatedList = list.map(t => t.id === topicId ? { ...t, ...normalized } : t);
      return { ...prev, byCategory: { ...prev.byCategory, [category]: updatedList } };
    });

    if (completedTransition) {
      triggerCelebration("Topic completed", "Great progress on your roadmap!");
    }

    debounceDb(`roadmap-${category}-${topicId}`, async () => {
      try {
        await db.roadmap.updateSubTopic(category, topicId, normalized);
      } catch (err) {
        // Rollback state on error
        setRoadmapState(prev => {
          const list = prev.byCategory[category] || [];
          const updatedList = list.map(t => t.id === topicId ? existing : t);
          return { ...prev, byCategory: { ...prev.byCategory, [category]: updatedList } };
        });
        showToast("Sync Error", err.message, "error");
      }
    }, 800);
  };

  const deleteSubTopic = async (category, topicId) => {
    setRoadmapState(prev => ({
      ...prev,
      byCategory: {
        ...prev.byCategory,
        [category]: (prev.byCategory[category] || []).filter(t => t.id !== topicId)
      }
    }));
    try {
      await db.roadmap.deleteSubTopic(category, topicId);
      showToast("Sub Topic deleted", "Removed the sub topic.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const reorderSubTopics = async (category, reorderedList) => {
    setRoadmapState(prev => ({
      ...prev,
      byCategory: { ...prev.byCategory, [category]: reorderedList }
    }));
    
    const dbPayload = reorderedList
      .filter(t => t.row_id)
      .map((t, idx) => ({ id: t.row_id, sort_order: idx }));
    try {
      await db.roadmap.reorderTopics(dbPayload);
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const updateSkill = useCallback(async (skillId, updates) => {
    const skill = skillsState.find(s => s.id === skillId);
    if (!skill) return;
    const prev = { ...skill };

    setSkillsState(prevSkills => prevSkills.map(s => s.id === skillId ? { ...s, ...updates } : s));

    debounceDb(`skill-${skillId}`, async () => {
      try {
        await db.skills.updateSkill(skillId, updates);
      } catch (err) {
        setSkillsState(prevSkills => prevSkills.map(s => s.id === skillId ? prev : s));
        showToast("Sync Error", err.message, "error");
      }
    }, 800);
  }, [skillsState, showToast]);

  const addSkill = useCallback(async (skillData) => {
    try {
      const newSkill = await db.skills.createSkill(skillData);
      setSkillsState(prev => [...prev, newSkill]);
      showToast("Skill added", "Added a new skill card.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  }, [showToast]);

  const deleteSkill = useCallback(async (skillId) => {
    const skill = skillsState.find(s => s.id === skillId);
    if (!skill) return;
    setSkillsState(prev => prev.filter(s => s.id !== skillId));
    try {
      await db.skills.deleteSkill(skillId);
      showToast("Skill deleted", "Removed the skill card.");
    } catch (err) {
      setSkillsState(prev => [...prev, skill]);
      showToast("Sync Error", err.message, "error");
    }
  }, [skillsState, showToast]);

  const updateLearningItem = (itemId, updates) => {
    updateMetadata((prev) => {
      const currentLearning = prev.learning || {};
      const updatedItems = (currentLearning.items || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      return {
        ...prev,
        learning: {
          ...currentLearning,
          items: updatedItems,
        },
      };
    });

    logActivity(1);
  };

  const addLearningItem = (itemData) => {
    const newItem = {
      id: generateId("learn"),
      title: itemData.title || "Untitled",
      type: itemData.type || "Course",
      completion: 0,
      timeSpent: 0,
      weeklyGoal: itemData.weeklyGoal || 3,
    };
    
    updateMetadata((prev) => {
      const updatedItems = [...(prev.learning?.items || []), newItem];
      return {
        ...prev,
        learning: {
          ...prev.learning,
          items: updatedItems,
        },
      };
    });
    showToast("Item added", `"${newItem.title}" added to your learning hub.`);
  };

  const deleteLearningItem = (itemId) => {
    updateMetadata((prev) => {
      const updatedItems = (prev.learning?.items || []).filter(item => item.id !== itemId);
      return {
        ...prev,
        learning: {
          ...prev.learning,
          items: updatedItems,
        },
      };
    });
    showToast("Item removed", "Learning item deleted.");
  };

  const updateWeeklyGoalTarget = async (targetHours) => {
    const weekStart = getWeekStartKey();
    const currentHours = weeklyGoalState?.currentHours ?? 0;
    setWeeklyGoalState(prev => ({
      ...prev,
      targetHours,
      weekStart
    }));
    try {
      await db.weeklyGoals.updateWeeklyGoal(weekStart, targetHours, currentHours);
      showToast("Weekly goal updated", `Weekly target set to ${targetHours} hours.`);
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const updateProject = useCallback(async (projectId, updates, silent = false) => {
    const project = projectsState.find(p => p.id === projectId);
    if (!project) return;
    const prev = { ...project };
    const celebrate = updates.progress === 100 && project.progress !== 100;

    setProjectsState(prevProj => prevProj.map(p => p.id === projectId ? { ...p, ...updates } : p));

    if (!silent && celebrate) {
      triggerCelebration("Project completed", "Nice work. That artifact now strengthens your portfolio.");
    }

    debounceDb(`project-${projectId}`, async () => {
      try {
        await db.projects.updateProject(projectId, updates);
        if (!silent) {
          addNotification("Project updated", "A project card has new status or progress.");
        }
      } catch (err) {
        setProjectsState(prevProj => prevProj.map(p => p.id === projectId ? prev : p));
        showToast("Sync Error", err.message, "error");
      }
    }, 800);
  }, [projectsState, triggerCelebration, addNotification, showToast]);

  const addProject = useCallback(async (projectData) => {
    try {
      const newProj = await db.projects.createProject({ progress: 0, status: "To Do", ...projectData });
      setProjectsState(prev => [...prev, newProj]);
      showToast("Project added", "A new project was added to your board.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  }, [showToast]);

  const deleteProject = useCallback(async (projectId) => {
    const project = projectsState.find(p => p.id === projectId);
    if (!project) return;

    setProjectsState(prev => prev.filter(p => p.id !== projectId));

    try {
      await db.projects.deleteProject(projectId);
      showToast("Project deleted", "The project was removed from your board.");
    } catch (err) {
      setProjectsState(prev => [...prev, project]);
      showToast("Sync Error", err.message, "error");
    }
  }, [projectsState, showToast]);

  const createReview = async (payload) => {
    try {
      const newReview = await db.reviews.createReview(payload);
      setReviewsState(prev => [newReview, ...prev]);
      addNotification("Weekly review added", "Reflection captured for this week.");
      showToast("Weekly review saved", "Your reflection was added to history.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const deleteReview = async (reviewId) => {
    const review = reviewsState.find(r => r.id === reviewId);
    if (!review) return;
    setReviewsState(prev => prev.filter(r => r.id !== reviewId));
    try {
      await db.reviews.deleteReview(reviewId);
      showToast("Review deleted", "Your reflection was deleted.");
    } catch (err) {
      setReviewsState(prev => [...prev, review]);
      showToast("Sync Error", err.message, "error");
    }
  };

  const saveNote = async (note) => {
    const isNew = !note.id;
    if (isNew) {
      try {
        const newNote = await db.notes.createNote(note);
        setNotesState(prev => [newNote, ...prev]);
        showToast("Note saved", "Your note changes are safely stored.");
        return newNote;
      } catch (err) {
        showToast("Sync Error", err.message, "error");
        return null;
      }
    } else {
      const existing = notesState.find(n => n.id === note.id);
      const prevNote = existing ? { ...existing } : null;

      setNotesState(prev => prev.map(n => n.id === note.id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n));

      try {
        await db.notes.updateNote(note.id, note);
        showToast("Note saved", "Your note changes are safely stored.");
        return { ...existing, ...note, updatedAt: new Date().toISOString() };
      } catch (err) {
        if (prevNote) {
          setNotesState(prev => prev.map(n => n.id === note.id ? prevNote : n));
        }
        showToast("Sync Error", err.message, "error");
        return null;
      }
    }
  };

  const deleteNote = async (noteId) => {
    const note = notesState.find(n => n.id === noteId);
    if (!note) return;

    setNotesState(prev => prev.filter(n => n.id !== noteId));

    try {
      await db.notes.deleteNote(noteId);
      showToast("Note deleted", "The note was removed.");
    } catch (err) {
      setNotesState(prev => [...prev, note]);
      showToast("Sync Error", err.message, "error");
    }
  };

  const updateResource = async (resourceId, updates) => {
    const res = resourcesState.find(r => r.id === resourceId);
    if (!res) return;
    const prev = { ...res };
    setResourcesState(prevList => prevList.map(r => r.id === resourceId ? { ...r, ...updates } : r));
    try {
      await db.resources.updateResource(resourceId, updates);
      showToast("Resource updated", "Your resource library is in sync.");
    } catch (err) {
      setResourcesState(prevList => prevList.map(r => r.id === resourceId ? prev : r));
      showToast("Sync Error", err.message, "error");
    }
  };

  const addResource = async (resourceData) => {
    try {
      const newRes = await db.resources.createResource(resourceData);
      setResourcesState(prev => [...prev, newRes]);
      showToast("Resource added", "Added a new resource to your library.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const deleteResource = async (resourceId) => {
    const res = resourcesState.find(r => r.id === resourceId);
    if (!res) return;
    setResourcesState(prev => prev.filter(r => r.id !== resourceId));
    try {
      await db.resources.deleteResource(resourceId);
      showToast("Resource deleted", "Resource removed from library.");
    } catch (err) {
      setResourcesState(prev => [...prev, res]);
      showToast("Sync Error", err.message, "error");
    }
  };

  const updatePortfolioGoal = async (goalId, updates) => {
    const goal = portfolioGoalsState.find((g) => g.id === goalId);
    if (!goal) return;
    const prev = { ...goal };

    let nextUpdates = { ...updates };
    
    // Only update progress based on completed if we are explicitly toggling completion (like a checkbox)
    if (updates.completed !== undefined && updates.progress === undefined) {
      nextUpdates.progress = updates.completed ? 100 : (goal.progress === 100 ? 0 : goal.progress);
    }
    
    // If progress was provided (like from the slider), ensure completion syncs with it
    if (updates.progress !== undefined) {
      nextUpdates.completed = updates.progress === 100;
    }

    const celebrate = nextUpdates.completed && !goal.completed;

    setPortfolioGoalsState((prevList) =>
      prevList.map((g) => (g.id === goalId ? { ...g, ...nextUpdates } : g))
    );

    if (celebrate) triggerCelebration("Milestone complete", "This is portfolio-grade momentum.");

    debounceDb(`portfolio-goal-${goalId}`, async () => {
      try {
        await db.portfolioGoals.updatePortfolioGoal(goalId, nextUpdates);
      } catch (err) {
        setPortfolioGoalsState((prevList) =>
          prevList.map((g) => (g.id === goalId ? prev : g))
        );
        showToast("Sync Error", err.message, "error");
      }
    }, 800);
  };

  const addPortfolioGoal = async (goalData) => {
    try {
      const newGoal = await db.portfolioGoals.createPortfolioGoal(goalData);
      setPortfolioGoalsState(prev => [...prev, newGoal]);
      showToast("Portfolio goal added", "Added a new career asset goal.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const deletePortfolioGoal = async (goalId) => {
    const goal = portfolioGoalsState.find(g => g.id === goalId);
    if (!goal) return;
    setPortfolioGoalsState(prev => prev.filter(g => g.id !== goalId));
    try {
      await db.portfolioGoals.deletePortfolioGoal(goalId);
      showToast("Portfolio goal deleted", "Removed the goal.");
    } catch (err) {
      setPortfolioGoalsState(prev => [...prev, goal]);
      showToast("Sync Error", err.message, "error");
    }
  };

  const updateSettings = (updates) => {
    const nextSettings = {
      ...(metadataState?.settings || {}),
      ...updates,
      notifications: {
        ...(metadataState?.settings?.notifications || {}),
        ...(updates.notifications || {}),
      },
    };

    updateMetadata({
      ...metadataState,
      settings: nextSettings,
    });

    showToast("Settings saved", "Preferences updated.");
  };

  const resetProgress = async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      await Promise.all([
        supabase.from("projects").delete().eq("user_id", currentUser.id),
        supabase.from("skills").delete().eq("user_id", currentUser.id),
        supabase.from("notes").delete().eq("user_id", currentUser.id),
        supabase.from("tasks").delete().eq("user_id", currentUser.id),
        supabase.from("roadmap_progress").delete().eq("user_id", currentUser.id),
        supabase.from("resources").delete().eq("user_id", currentUser.id),
        supabase.from("weekly_reviews").delete().eq("user_id", currentUser.id),
        supabase.from("weekly_goals").delete().eq("user_id", currentUser.id),
        supabase.from("portfolio_goals").delete().eq("user_id", currentUser.id),
      ]);

      setProjectsState([]);
      setSkillsState([]);
      setTasksState([]);
      setNotesState([]);
      setRoadmapState({ mainTopics: [], byCategory: {} });
      setResourcesState([]);
      setReviewsState([]);
      setPortfolioGoalsState([]);

      const defaultData = createDefaultUserData(currentUser);

      const defaultResources = defaultData.resources.map(r => ({
        user_id: currentUser.id,
        title: r.title,
        category: r.category || "",
        url: r.url || "",
        description: r.description || "",
        type: r.type || "",
        bookmarked: r.bookmarked || false,
        favorite: r.favorite || false,
        completed: r.completed || false,
      }));
      await supabase.from("resources").insert(defaultResources);

      const defaultPortfolio = defaultData.portfolioGoals.map(g => ({
        user_id: currentUser.id,
        title: g.title,
        description: g.milestone || "",
        progress: g.progress || 0,
        completed: g.completed || g.progress === 100 ? true : false,
        status: g.completed || g.progress === 100 ? "Completed" : "In Progress",
        priority: g.priority || "Medium",
        target_date: g.deadline || null,
      }));
      await supabase.from("portfolio_goals").insert(defaultPortfolio);

      const freshMeta = {
        goals: { monthly: null, quarterly: null, yearly: null },
        learning: { weeklyGoalHours: 18, items: [] },
        motivation: { quotes: defaultData.motivation.quotes },
        settings: defaultData.settings,
        notifications: [],
        activityLog: [],
        achievements: [],
        calendarEvents: [],
        profileMeta: {
          careerGoal: "",
          targetRole: "",
        },
        deletedTopics: [],
        migrated: true,
      };

      await supabase.from("profiles").update({ metadata: freshMeta }).eq("id", currentUser.id);
      setMetadataState(freshMeta);

      const [resData, pfGoals] = await Promise.all([
        db.resources.getResources(),
        db.portfolioGoals.getPortfolioGoals()
      ]);
      setResourcesState(resData);
      setPortfolioGoalsState(pfGoals);

      showToast("Progress reset", "Your workspace was successfully reset and wiped clean.", "warning");
    } catch (err) {
      showToast("Reset failed", err.message, "error");
    } finally {
      setLoadingData(false);
    }
  };

  const exportData = () => {
    if (!currentUser || !currentUserData) return;
    downloadTextFile(
      `pm-career-os-${currentUser.name.toLowerCase().replaceAll(" ", "-")}.json`,
      JSON.stringify({ user: currentUser, data: currentUserData }, null, 2),
    );
    showToast("Export ready", "Your PM Career OS data was downloaded.");
  };

  const importData = (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed?.data || !currentUser) throw new Error("Invalid file");
      
      updateMetadata(parsed.data);
      showToast("Import complete", "Your data was restored from file.");
      return { ok: true };
    } catch {
      return { ok: false, message: "The imported file could not be read." };
    }
  };

  const addCalendarEvent = (eventData) => {
    const updated = [
      ...(currentUserData?.calendarEvents || []),
      { id: generateId("event"), completed: false, ...eventData },
    ];

    updateMetadata({
      ...metadataState,
      calendarEvents: updated,
    });

    showToast("Event added", "Calendar event was created.");
  };

  const toggleCalendarEvent = (eventId) => {
    let completedNow = false;
    const updated = (currentUserData?.calendarEvents || []).map((ev) => {
      if (ev.id !== eventId) return ev;
      completedNow = !ev.completed;
      return { ...ev, completed: !ev.completed };
    });

    updateMetadata({
      ...metadataState,
      calendarEvents: updated,
    });

    showToast("Event updated", "Calendar status refreshed.");
    if (completedNow) logActivity(1);
  };

  const deleteCalendarEvent = (eventId) => {
    const updated = (currentUserData?.calendarEvents || []).filter((ev) => ev.id !== eventId);

    updateMetadata({
      ...metadataState,
      calendarEvents: updated,
    });

    showToast("Event deleted", "Event removed from calendar.");
  };

  const dismissCelebration = () => {
    setActiveAchievementCelebration(null);
  };

  useEffect(() => {
    if (!currentUserData || !currentUser) return;

    const currentStreak = calculateStreak(currentUserData.activityLog);
    const totalStudyHours = currentUserData.learning.items.reduce((sum, item) => sum + item.timeSpent, 0);
    const hasSkill80 = currentUserData.skills.some((skill) => skill.progress >= 80);
    const hasProjectDone = currentUserData.projects.some((project) => project.status === "Completed");
    const hasReviewDone = currentUserData.reviews.length > 0;
    const hasCheckin = currentUserData.activityLog.length > 0;

    const unlockedNow = [];
    const existingUnlocked = currentUserData.achievements || [];

    if (hasCheckin && !existingUnlocked.includes("first_checkin")) unlockedNow.push("first_checkin");
    if (currentStreak >= 3 && !existingUnlocked.includes("streak_3")) unlockedNow.push("streak_3");
    if (currentStreak >= 7 && !existingUnlocked.includes("streak_7")) unlockedNow.push("streak_7");
    if (currentStreak >= 14 && !existingUnlocked.includes("streak_14")) unlockedNow.push("streak_14");
    if (totalStudyHours >= 10 && !existingUnlocked.includes("study_10")) unlockedNow.push("study_10");
    if (hasSkill80 && !existingUnlocked.includes("skill_80")) unlockedNow.push("skill_80");
    if (hasProjectDone && !existingUnlocked.includes("project_done")) unlockedNow.push("project_done");
    if (hasReviewDone && !existingUnlocked.includes("review_done")) unlockedNow.push("review_done");

    if (unlockedNow.length > 0) {
      const newlyUnlocked = unlockedNow.filter(id => !existingUnlocked.includes(id));
      
      if (newlyUnlocked.length > 0) {
        updateMetadata((prev) => {
          const currentAch = prev.achievements || [];
          const trulyNew = unlockedNow.filter((id) => !currentAch.includes(id));
          
          if (trulyNew.length === 0) return prev;
          
          return {
            ...prev,
            achievements: [...currentAch, ...trulyNew],
          };
        });

        const firstNewId = newlyUnlocked[0];
        const achievementDetails = ACHIEVEMENTS_LIST.find((a) => a.id === firstNewId);
        if (achievementDetails) {
          window.setTimeout(() => {
            triggerCelebration(
              `Unlocked: ${achievementDetails.title}!`,
              achievementDetails.desc
            );
            setActiveAchievementCelebration(achievementDetails);
          }, 600);
        }
      }
    }
  }, [currentUserData, currentUser]);

  const dashboardMetrics = currentUser && currentUserData
    ? deriveDashboardMetrics(currentUser, currentUserData)
    : null;

  const value = useMemo(
    () => ({
      currentUser,
      currentUserData,
      dashboardMetrics,
      toasts,
      celebration,
      updateProfile,
      updatePlannerTask,
      addPlannerTask,
      deletePlannerTask,
      addMainTopic,
      renameMainTopic,
      deleteMainTopic,
      reorderMainTopics,
      addSubTopic,
      updateSubTopic,
      deleteSubTopic,
      reorderSubTopics,
      updateSkill,
      addSkill,
      deleteSkill,
      updateLearningItem,
      addLearningItem,
      deleteLearningItem,
      updateProject,
      addProject,
      deleteProject,
      createReview,
      deleteReview,
      saveNote,
      deleteNote,
      updateResource,
      addResource,
      deleteResource,
      updatePortfolioGoal,
      addPortfolioGoal,
      deletePortfolioGoal,
      updateWeeklyGoalTarget,
      weeklyGoalState,
      updateGoal,
      updateSettings,
      resetProgress,
      exportData,
      importData,
      showToast,
      triggerCelebration,
      markAllNotificationsRead,
      logActivity,
      getInitials,
      formatDate,
      levelOrder,
      isDarkMode,
      toggleTheme,
      activeAchievementCelebration,
      dismissCelebration,
      addCalendarEvent,
      toggleCalendarEvent,
      deleteCalendarEvent,
      ACHIEVEMENTS_LIST,
      isLoadingData: loadingData,
    }),
    [currentUser, currentUserData, dashboardMetrics, toasts, celebration, isDarkMode, activeAchievementCelebration, loadingData, skillsState, tasksState, roadmapState, resourcesState, reviewsState, projectsState, weeklyGoalState, portfolioGoalsState, metadataState],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {celebration ? (
        <FullScreenConfetti />
      ) : null}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
