import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { accentPalette, createDefaultUserData } from "../data/defaultData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "./AuthContext";
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
  const roadmapTopics = Object.values(userData.roadmap).flat();
  const roadmapProgress = average(roadmapTopics.map((topic) => topic.progress));
  const skillProgress = average(userData.skills.map((skill) => skill.progress));
  const projectProgress = average(userData.projects.map((project) => project.progress));
  const portfolioProgress = average(userData.portfolioGoals.map((goal) => goal.progress));
  return Math.round((roadmapProgress + skillProgress + projectProgress + portfolioProgress) / 4);
};

const calculatePlannerCompletion = (plannerDay = {}) => {
  const tasks = Object.values(plannerDay).flat();
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
  };
};

const deriveDashboardMetrics = (user, userData) => {
  const todayPlan = userData.planner[getTodayKey()] || {};
  const plannerStats = calculatePlannerCompletion(todayPlan);
  const weeklyHours = userData.learning.items.reduce((sum, item) => sum + item.timeSpent, 0);
  const activeSkill = [...userData.skills].sort((a, b) => b.focusHours - a.focusHours)[0];
  const nextMilestone =
    [...userData.portfolioGoals]
      .filter((goal) => !goal.completed)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0] || null;

  return {
    overallProgress: calculateOverallProgress(userData),
    currentStreak: calculateStreak(userData.activityLog),
    todayCompletion: percent(plannerStats.completed, plannerStats.total),
    hoursStudiedThisWeek: weeklyHours,
    activeSkill,
    nextMilestone,
    currentMonthGoal: userData.goalPlan.completion,
    completedSkills: userData.skills.filter((skill) => skill.progress >= 80).length,
    activeProjects: userData.projects.filter((project) => project.status !== "Completed").length,
    countdownDays: daysUntil(userData.goalPlan.targetDate),
    userName: user?.name || "PM Builder",
  };
};

export const AppProvider = ({ children }) => {
  // Auth state comes from Supabase via AuthContext
  const { user: authUser, profile } = useAuth();

  // Build a currentUser object that matches the shape the rest of the app expects
  const currentUser = authUser && profile
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

  const [userDataMap, setUserDataMap] = useLocalStorage(DATA_KEY, {});
  const [toasts, setToasts] = useState([]);
  const [celebration, setCelebration] = useState(null);

  const currentUserData = currentUser ? userDataMap[currentUser.id] || createDefaultUserData(currentUser) : null;

  const [guestDarkMode, setGuestDarkMode] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pm-guest-dark-mode");
      if (saved !== null) return saved === "true";
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [activeAchievementCelebration, setActiveAchievementCelebration] = useState(null);

  const isDarkMode = currentUserData ? Boolean(currentUserData.settings?.darkMode) : guestDarkMode;

  const toggleTheme = () => {
    if (currentUserData) {
      updateSettings({ darkMode: !currentUserData.settings?.darkMode });
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
    const accent = accentPalette[currentUserData?.settings?.accentColor || "blue"];

    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.style.setProperty("--accent", accent.accent);
    document.documentElement.style.setProperty("--accent-soft", accent.soft);
  }, [currentUserData?.settings?.accentColor, isDarkMode]);

  const updateCurrentUserData = (updater) => {
    if (!currentUser) return;

    setUserDataMap((previous) => {
      const existing = previous[currentUser.id] || createDefaultUserData(currentUser);
      const nextValue = typeof updater === "function" ? updater(existing) : updater;
      return {
        ...previous,
        [currentUser.id]: nextValue,
      };
    });
  };

  const addNotification = (title, body) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      notifications: [
        {
          id: generateId("notice"),
          title,
          body,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...existing.notifications,
      ].slice(0, 8),
    }));
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
    // Profile updates are handled by AuthContext.updateProfile for Supabase
    // This stub keeps compatibility with any remaining AppContext consumers
    showToast("Profile updated", "Your profile changes were saved.");
  };


  const markAllNotificationsRead = () => {
    updateCurrentUserData((existing) => ({
      ...existing,
      notifications: existing.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  };

  const logActivity = (count = 1) => {
    updateCurrentUserData((existing) => {
      const today = getTodayKey();
      const found = existing.activityLog.find((entry) => entry.date === today);
      const activityLog = found
        ? existing.activityLog.map((entry) =>
            entry.date === today ? { ...entry, count: entry.count + count } : entry,
          )
        : [...existing.activityLog, { date: today, count }];

      return { ...existing, activityLog };
    });
  };

  const updatePlannerTask = (date, period, taskId) => {
    let completedNow = false;

    updateCurrentUserData((existing) => {
      const day = existing.planner[date] || { morning: [], afternoon: [], evening: [], night: [] };
      const planner = {
        ...existing.planner,
        [date]: {
          ...day,
          [period]: day[period].map((task) => {
            if (task.id !== taskId) return task;
            completedNow = !task.completed;
            return { ...task, completed: !task.completed };
          }),
        },
      };

      return { ...existing, planner };
    });

    showToast("Progress saved", "Your daily planner was updated.");
    if (completedNow) logActivity(1);
  };

  const addPlannerTask = (date, period, title) => {
    updateCurrentUserData((existing) => {
      const day = existing.planner[date] || { morning: [], afternoon: [], evening: [], night: [] };
      return {
        ...existing,
        planner: {
          ...existing.planner,
          [date]: {
            ...day,
            [period]: [...day[period], { id: generateId("task"), title, completed: false }],
          },
        },
      };
    });
    showToast("Task added", `Added a new ${period} task.`);
  };

  const updateRoadmapTopic = (category, topicId, updates) => {
    let shouldCelebrate = false;
    updateCurrentUserData((existing) => ({
      ...existing,
      roadmap: {
        ...existing.roadmap,
        [category]: existing.roadmap[category].map((topic) => {
          if (topic.id !== topicId) return topic;
          const nextTopic = { ...topic, ...updates };
          shouldCelebrate = nextTopic.completed && topic.completed !== nextTopic.completed;
          return nextTopic;
        }),
      },
    }));

    showToast("Roadmap updated", "Your learning roadmap is in sync.");
    if (shouldCelebrate) triggerCelebration("Topic completed", "Another PM building block is locked in.");
  };

  const updateSkill = (skillId, updates) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      skills: existing.skills.map((skill) =>
        skill.id === skillId ? { ...skill, ...updates } : skill,
      ),
    }));
    showToast("Skill updated", "Your skill tracker is up to date.");
  };

  const updateLearningItem = (itemId, updates) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      learning: {
        ...existing.learning,
        items: existing.learning.items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item,
        ),
      },
    }));
    logActivity(1);
    showToast("Learning log saved", "Your learning hub was refreshed.");
  };

  const updateProject = (projectId, updates, silent = false) => {
    let celebrate = false;
    updateCurrentUserData((existing) => ({
      ...existing,
      projects: existing.projects.map((project) => {
        if (project.id !== projectId) return project;
        const nextProject = { ...project, ...updates };
        celebrate = nextProject.progress === 100 && project.progress !== 100;
        return nextProject;
      }),
    }));

    if (!silent) {
      addNotification("Project updated", "A project card has new status or progress.");
      showToast("Project updated", "Your project board was saved.");
      if (celebrate) triggerCelebration("Project completed", "Nice work. That artifact now strengthens your portfolio.");
    }
  };

  const addProject = (projectData) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      projects: [
        ...(existing.projects || []),
        { id: generateId("project"), progress: 0, status: "To Do", ...projectData },
      ],
    }));
    showToast("Project added", "A new project was added to your board.");
  };

  const deleteProject = (projectId) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      projects: (existing.projects || []).filter((project) => project.id !== projectId),
    }));
    showToast("Project deleted", "The project was removed from your board.");
  };

  const createReview = (payload) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      reviews: [{ id: generateId("review"), date: getTodayKey(), ...payload }, ...existing.reviews],
    }));
    addNotification("Weekly review added", "Reflection captured for this week.");
    showToast("Weekly review saved", "Your reflection was added to history.");
  };

  const saveNote = (note) => {
    const isNew = !note.id;
    const noteId = isNew ? generateId("note") : note.id;
    const savedNote = {
      ...note,
      id: noteId,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentUserData((existing) => {
      const existingNote = existing.notes.find((entry) => entry.id === note.id);
      return {
        ...existing,
        notes: existingNote
          ? existing.notes.map((entry) =>
              entry.id === note.id ? savedNote : entry,
            )
          : [savedNote, ...existing.notes],
      };
    });
    showToast("Note saved", "Your note changes are safely stored.");
    return savedNote;
  };

  const deleteNote = (noteId) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      notes: existing.notes.filter((note) => note.id !== noteId),
    }));
    showToast("Note deleted", "The note was removed.");
  };

  const updateResource = (resourceId, updates) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      resources: existing.resources.map((resource) =>
        resource.id === resourceId ? { ...resource, ...updates } : resource,
      ),
    }));
    showToast("Resource updated", "Your resource library is in sync.");
  };

  const addResource = (resourceData) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      resources: [
        ...(existing.resources || []),
        { id: generateId("resource"), bookmarked: false, ...resourceData },
      ],
    }));
    showToast("Resource added", "Added a new resource to your library.");
  };

  const deleteResource = (resourceId) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      resources: (existing.resources || []).filter((res) => res.id !== resourceId),
    }));
    showToast("Resource deleted", "Resource removed from library.");
  };

  const updatePortfolioGoal = (goalId, updates) => {
    let celebrate = false;
    updateCurrentUserData((existing) => ({
      ...existing,
      portfolioGoals: existing.portfolioGoals.map((goal) => {
        if (goal.id !== goalId) return goal;
        const nextGoal = { ...goal, ...updates };
        celebrate = nextGoal.completed && !goal.completed;
        return nextGoal;
      }),
    }));
    showToast("Portfolio goal updated", "Career assets status refreshed.");
    if (celebrate) triggerCelebration("Milestone complete", "This is portfolio-grade momentum.");
  };

  const updateSettings = (updates) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      settings: {
        ...existing.settings,
        ...updates,
        notifications: {
          ...existing.settings.notifications,
          ...(updates.notifications || {}),
        },
      },
    }));
    showToast("Settings saved", "Preferences updated.");
  };

  const resetProgress = () => {
    if (!currentUser) return;
    updateCurrentUserData(createDefaultUserData(currentUser));
    showToast("Progress reset", "Your workspace was reset to a fresh template.", "warning");
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
      updateCurrentUserData(parsed.data);
      showToast("Import complete", "Your data was restored from file.");
      return { ok: true };
    } catch {
      return { ok: false, message: "The imported file could not be read." };
    }
  };

  const addCalendarEvent = (eventData) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      calendarEvents: [
        ...(existing.calendarEvents || []),
        { id: generateId("event"), completed: false, ...eventData },
      ],
    }));
    showToast("Event added", "Calendar event was created.");
  };

  const toggleCalendarEvent = (eventId) => {
    let completedNow = false;
    updateCurrentUserData((existing) => ({
      ...existing,
      calendarEvents: (existing.calendarEvents || []).map((ev) => {
        if (ev.id !== eventId) return ev;
        completedNow = !ev.completed;
        return { ...ev, completed: !ev.completed };
      }),
    }));
    showToast("Event updated", "Calendar status refreshed.");
    if (completedNow) {
      logActivity(1);
    }
  };

  const deleteCalendarEvent = (eventId) => {
    updateCurrentUserData((existing) => ({
      ...existing,
      calendarEvents: (existing.calendarEvents || []).filter((ev) => ev.id !== eventId),
    }));
    showToast("Event deleted", "Event removed from calendar.");
  };

  const dismissCelebration = () => {
    setActiveAchievementCelebration(null);
  };

  useEffect(() => {
    if (!currentUserData) return;

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
      updateCurrentUserData((existing) => ({
        ...existing,
        achievements: [...(existing.achievements || []), ...unlockedNow],
      }));

      const firstNewId = unlockedNow[0];
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
  }, [currentUserData]);

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
      updateRoadmapTopic,
      updateSkill,
      updateLearningItem,
      updateProject,
      addProject,
      deleteProject,
      createReview,
      saveNote,
      deleteNote,
      updateResource,
      addResource,
      deleteResource,
      updatePortfolioGoal,
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
    }),
    [currentUser, currentUserData, dashboardMetrics, toasts, celebration, isDarkMode, activeAchievementCelebration],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {celebration ? (
        <Confetti
          recycle={false}
          numberOfPieces={220}
          gravity={0.22}
          colors={["#2563EB", "#60A5FA", "#22C55E", "#F59E0B", "#FFFFFF"]}
        />
      ) : null}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
