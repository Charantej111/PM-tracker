import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import Confetti from "react-confetti";
import { accentPalette, createDefaultUserData, roadmapBlueprint } from "../data/defaultData";
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

const calculateOverallProgress = (userData) => {
  const roadmapTopics = Object.values(userData?.roadmap || {}).flat().filter(Boolean);
  const roadmapProgress = roadmapTopics.length > 0 ? average(roadmapTopics.map((topic) => topic.progress || 0)) : 0;
  const skillProgress = (userData?.skills?.length || 0) > 0 ? average(userData.skills.map((skill) => skill.progress || 0)) : 0;
  const projectProgress = (userData?.projects?.length || 0) > 0 ? average(userData.projects.map((project) => project.progress || 0)) : 0;
  const portfolioProgress = (userData?.portfolioGoals?.length || 0) > 0 ? average(userData.portfolioGoals.map((goal) => goal.progress || 0)) : 0;
  return Math.round((roadmapProgress + skillProgress + projectProgress + portfolioProgress) / 4);
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
  const weeklyHours = userData?.learning?.items?.reduce((sum, item) => sum + (item.timeSpent || 0), 0) || 0;
  const activeSkill = [...(userData?.skills || [])].sort((a, b) => (b.focusHours || 0) - (a.focusHours || 0))[0] || null;
  const nextMilestone =
    [...(userData?.portfolioGoals || [])]
      .filter((goal) => !goal.completed)
      .sort((a, b) => new Date(a.deadline || a.target_date) - new Date(b.deadline || b.target_date))[0] || null;

  return {
    overallProgress: calculateOverallProgress(userData),
    currentStreak: calculateStreak(userData?.activityLog || []),
    todayCompletion: percent(plannerStats.completed, plannerStats.total),
    hoursStudiedThisWeek: weeklyHours,
    activeSkill,
    nextMilestone,
    currentMonthGoal: userData?.goalPlan?.completion || 0,
    completedSkills: (userData?.skills || []).filter((skill) => (skill.progress || 0) >= 80).length,
    activeProjects: (userData?.projects || []).filter((project) => project.status !== "Completed").length,
    countdownDays: daysUntil(userData?.goalPlan?.targetDate || new Date()),
    userName: user?.name || "PM Builder",
  };
};

const buildRoadmapData = (dbProgress, metadataState = {}, categories = roadmapBlueprint) => {
  const progressMap = new Map();
  dbProgress.forEach(rp => {
    progressMap.set(`${rp.category}:${rp.id}`, rp);
  });

  const deletedTopics = new Set(metadataState?.deletedTopics || []);

  // Build a set of all blueprint topic keys so we can identify custom topics
  const blueprintKeys = new Set();
  Object.entries(categories).forEach(([category, topics]) => {
    topics.forEach(topicName => {
      const topicId = topicName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      blueprintKeys.add(`${category}:${topicId}`);
    });
  });

  // Start with blueprint categories
  const result = {};
  Object.entries(categories).forEach(([category, topics]) => {
    result[category] = topics
      .map((topicName) => {
        const topicId = topicName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const key = `${category}:${topicId}`;
        
        if (deletedTopics.has(key)) return null;

        const record = progressMap.get(key);
        return {
          id: topicId,
          name: record?.name || topicName,
          completed: record?.completed ?? false,
          progress: record?.progress ?? 0,
          notes: record?.notes ?? "Add one applied exercise and connect the concept to a project artifact.",
        };
      })
      .filter(Boolean);
  });

  // Append custom (non-blueprint) topics from dbProgress
  dbProgress.forEach(rp => {
    const key = `${rp.category}:${rp.id}`;
    if (!blueprintKeys.has(key)) {
      if (deletedTopics.has(key)) return;

      if (!result[rp.category]) {
        result[rp.category] = [];
      }
      result[rp.category].push({
        id: rp.id,
        name: rp.name || rp.id,
        completed: rp.completed ?? false,
        progress: rp.progress ?? 0,
        notes: rp.notes ?? "Add one applied exercise and connect the concept to a project artifact.",
        isCustom: true,
      });
    }
  });

  return result;
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
  const [roadmapState, setRoadmapState] = useState([]);
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

  const loadUserData = async (userId) => {
    try {
      const currentWeekStart = getWeekStartKey();
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
      ] = await Promise.all([
        db.projects.getProjects(),
        db.skills.getSkills(),
        db.tasks.getTasks(),
        db.notes.getNotes(),
        db.roadmap.getRoadmapProgress(),
        db.reviews.getReviews(),
        db.resources.getResources(),
        db.portfolioGoals.getPortfolioGoals(),
        db.weeklyGoals.getWeeklyGoal(currentWeekStart),
        supabase.from("profiles").select("metadata").eq("id", userId).maybeSingle()
      ]);

      setProjectsState(projData || []);
      setSkillsState(skillsData || []);
      setTasksState(tasksData || []);
      setNotesState(notesData || []);
      setRoadmapState(roadmapData || []);
      setReviewsState(reviewsData || []);
      setResourcesState(resData || []);
      setPortfolioGoalsState(pfGoalsData || []);
      setWeeklyGoalState(weeklyGoalData || { targetHours: 18, currentHours: 0, weekStart: currentWeekStart });

      if (profData?.error) throw profData.error;
      setMetadataState(profData?.data?.metadata || {});
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
        await loadUserData(userId);
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
          goalPlan: localData.goalPlan || defaultData.goalPlan,
          learning: localData.learning || defaultData.learning,
          motivation: localData.motivation || defaultData.motivation,
          settings: localData.settings || defaultData.settings,
          notifications: localData.notifications || defaultData.notifications,
          activityLog: localData.activityLog || defaultData.activityLog,
          achievements: localData.achievements || defaultData.achievements,
          calendarEvents: localData.calendarEvents || defaultData.calendarEvents,
          metricsSnapshot: localData.metricsSnapshot || defaultData.metricsSnapshot,
          statsSeed: localData.statsSeed || defaultData.statsSeed,
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
          goalPlan: defaultData.goalPlan,
          learning: defaultData.learning,
          motivation: defaultData.motivation,
          settings: defaultData.settings,
          notifications: defaultData.notifications,
          activityLog: defaultData.activityLog,
          achievements: defaultData.achievements,
          calendarEvents: defaultData.calendarEvents,
          metricsSnapshot: defaultData.metricsSnapshot,
          statsSeed: defaultData.statsSeed,
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
      setRoadmapState([]);
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

    const roadmap = buildRoadmapData(roadmapState, metadataState);
    const meta = metadataState || {};

    return {
      goalPlan: meta.goalPlan || { currentMonth: "Complete SQL dashboard case study", completion: 0, targetDate: "2026-09-30" },
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
      metricsSnapshot: meta.metricsSnapshot || {
        weeklyStudyHours: [0, 0, 0, 0, 0, 0, 0],
        monthlyCompletion: [
          { name: "Jan", completion: 0 },
          { name: "Feb", completion: 0 },
          { name: "Mar", completion: 0 },
          { name: "Apr", completion: 0 },
          { name: "May", completion: 0 },
          { name: "Jun", completion: 0 },
        ],
      },
      statsSeed: meta.statsSeed || { readiness: 0, studyHours: 0 },
      profileMeta: meta.profileMeta || {
        careerGoal: currentUser?.careerGoal || "Land a product internship in 2026",
        targetRole: currentUser?.targetRole || "Associate Product Manager",
      },
    };
  }, [currentUser, projectsState, skillsState, tasksState, notesState, roadmapState, metadataState, reviewsState, resourcesState, portfolioGoalsState, weeklyGoalState]);

  const updateMetadata = (nextValOrUpdater) => {
    if (!currentUser) return;
    setMetadataState((prev) => typeof nextValOrUpdater === "function" ? nextValOrUpdater(prev) : nextValOrUpdater);
  };

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

  const addNotification = (title, body) => {
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
  };

  const showToast = (title, description, variant = "default") => {
    const id = generateId("toast");
    setToasts((previous) => [...previous, { id, title, description, variant }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 3600);
  };

  const triggerCelebration = (title, description = "Big momentum for your PM journey.") => {
    setCelebration({ title, description });
    showToast(title, description, "success");
    window.setTimeout(() => setCelebration(null), 4200);
  };

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

  const updatePlannerTask = async (date, period, taskId, updates) => {
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
  };

  const addPlannerTask = async (date, period, title) => {
    try {
      const newTask = await db.tasks.createTask({ title, completed: false, period, date });
      setTasksState(prev => [...prev, newTask]);
      showToast("Task added", `Added a new ${period} task.`);
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const deletePlannerTask = async (taskId) => {
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
  };

  const updateRoadmapTopic = async (category, topicId, updates) => {
    const existingTopic = roadmapState.find(t => t.topic_id === topicId || t.id === topicId);
    const prevCompleted = existingTopic?.completed || false;
    const prevProgress = existingTopic?.progress || 0;
    const prevNotes = existingTopic?.notes || "";

    setRoadmapState(prev => {
      const found = prev.some(t => t.topic_id === topicId || t.id === topicId);
      if (found) {
        return prev.map(t => (t.topic_id === topicId || t.id === topicId) ? { ...t, ...updates } : t);
      } else {
        return [...prev, { id: topicId, topic_id: topicId, category, name: updates.name || "", completed: updates.completed || false, progress: updates.progress || 0, notes: updates.notes || "" }];
      }
    });

    if (updates.completed && !prevCompleted) {
      triggerCelebration("Topic completed", "Another PM building block is locked in.");
    }

    debounceDb(`roadmap-${category}-${topicId}`, async () => {
      try {
        await db.roadmap.updateRoadmapProgress(category, topicId, updates);
      } catch (err) {
        setRoadmapState(prev => prev.map(t => (t.topic_id === topicId || t.id === topicId) ? { ...t, completed: prevCompleted, progress: prevProgress, notes: prevNotes } : t));
        showToast("Sync Error", err.message, "error");
      }
    }, 800);
  };

  const addRoadmapTopic = async (category, name) => {
    const topicId = generateId("topic");
    const newTopic = {
      completed: false,
      progress: 0,
      name,
      notes: "Add one applied exercise and connect the concept to a project artifact.",
    };
    setRoadmapState(prev => [...prev, { id: topicId, topic_id: topicId, category, ...newTopic }]);
    try {
      await db.roadmap.updateRoadmapProgress(category, topicId, newTopic);
      showToast("Topic added", `Added "${name}" to ${category}.`);
    } catch (err) {
      setRoadmapState(prev => prev.filter(t => t.topic_id !== topicId));
      showToast("Sync Error", err.message, "error");
    }
  };

  const deleteRoadmapTopic = async (category, topicId) => {
    const key = `${category}:${topicId}`;
    
    updateMetadata((prev) => ({
      ...prev,
      deletedTopics: [...(prev.deletedTopics || []), key],
    }));
    
    const removedItems = roadmapState.filter(t => t.category === category && (t.topic_id === topicId || t.id === topicId));
    setRoadmapState(prev => prev.filter(t => !(t.category === category && (t.topic_id === topicId || t.id === topicId))));

    try {
      await db.roadmap.deleteRoadmapProgress(category, topicId);
      showToast("Topic deleted", "Removed the topic from your roadmap.");
    } catch (err) {
      setRoadmapState(prev => [...prev, ...removedItems]);
      showToast("Sync Error", err.message, "error");
    }
  };

  const updateSkill = async (skillId, updates) => {
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
  };

  const addSkill = async (skillData) => {
    try {
      const newSkill = await db.skills.createSkill(skillData);
      setSkillsState(prev => [...prev, newSkill]);
      showToast("Skill added", "Added a new skill card.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const deleteSkill = async (skillId) => {
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
  };

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

  const updateProject = async (projectId, updates, silent = false) => {
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
  };

  const addProject = async (projectData) => {
    try {
      const newProj = await db.projects.createProject({ progress: 0, status: "To Do", ...projectData });
      setProjectsState(prev => [...prev, newProj]);
      showToast("Project added", "A new project was added to your board.");
    } catch (err) {
      showToast("Sync Error", err.message, "error");
    }
  };

  const deleteProject = async (projectId) => {
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
  };

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
      setRoadmapState([]);
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
        goalPlan: { currentMonth: "Set a monthly target", completion: 0, targetDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split("T")[0] },
        learning: { weeklyGoalHours: 18, items: [] },
        motivation: { quotes: defaultData.motivation.quotes },
        settings: defaultData.settings,
        notifications: [],
        activityLog: [],
        achievements: [],
        calendarEvents: [],
        metricsSnapshot: {
          weeklyStudyHours: [0, 0, 0, 0, 0, 0, 0],
          monthlyCompletion: [
            { name: "Jan", completion: 0 },
            { name: "Feb", completion: 0 },
            { name: "Mar", completion: 0 },
            { name: "Apr", completion: 0 },
            { name: "May", completion: 0 },
            { name: "Jun", completion: 0 },
          ],
        },
        statsSeed: { readiness: 0, studyHours: 0 },
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
      updateRoadmapTopic,
      addRoadmapTopic,
      deleteRoadmapTopic,
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
