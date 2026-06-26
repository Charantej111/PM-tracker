import { average } from "./helpers";
import { computeRoadmapMetrics } from "./roadmapMetrics";

/**
 * Returns formatted week range string "MMM DD – MMM DD" for the week containing referenceDate.
 * Week starts on Monday.
 */
export const getWeekRange = (referenceDate = new Date()) => {
  const d = new Date(referenceDate);
  const day = d.getDay();
  // Adjust so that week starts on Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatOptions = { month: "short", day: "numeric" };
  const formatter = new Intl.DateTimeFormat("en-IN", formatOptions);
  
  return `${formatter.format(monday)} – ${formatter.format(sunday)}`;
};

/**
 * Returns formatted month range "Month YYYY".
 */
export const getMonthRange = (referenceDate = new Date()) => {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(referenceDate);
};

/**
 * Computes PM Readiness Score dynamically from user's actual skills.
 * If user has no skills, returns 0.
 */
export const computePMReadinessScore = (skills = []) => {
  if (!skills || skills.length === 0) {
    return {
      dimensions: [],
      overall: 0,
    };
  }

  const dimensions = skills.map((skill) => ({
    name: skill.name,
    score: skill.progress || 0,
    level: skill.level || "Beginner",
  }));

  const overall = Math.round(average(skills.map((s) => s.progress || 0)));

  return {
    dimensions,
    overall,
  };
};

/**
 * Computes weekly stats from actual user data.
 */
export const computeWeeklyReport = (userData) => {
  const learningItems = userData?.learning?.items || [];
  const projects = userData?.projects || [];
  const roadmapCategories = userData?.roadmap || {};
  const portfolioGoals = userData?.portfolioGoals || [];

  // Actual study hours logged
  const studyCompleted = learningItems.reduce((sum, item) => sum + (item.timeSpent || 0), 0);
  // Target hours
  const studyTarget = userData?.learning?.weeklyGoalHours || 18;

  // Skills improved (progress > 0)
  const skills = userData?.skills || [];
  const skillsImproved = skills.filter((s) => s.progress > 0).length;

  // Projects completed
  const projectsCompleted = projects.filter((p) => p.status === "Completed").length;

  // Roadmap topics completed
  const roadmapMetrics = computeRoadmapMetrics(userData?.roadmap);
  const roadmapCompletedCount = roadmapMetrics.completedSubTopics;

  // Goal completion % (average progress of all portfolio goals)
  const goalCompletionPercentage = portfolioGoals.length > 0
    ? Math.round(average(portfolioGoals.map((g) => g.progress || 0)))
    : 0;

  return {
    weekRange: getWeekRange(),
    studyTarget,
    studyCompleted,
    skillsImproved,
    projectsCompleted,
    roadmapTopicsCompleted: roadmapCompletedCount,
    goalCompletionPercentage,
  };
};

/**
 * Computes monthly stats from actual user data.
 */
export const computeMonthlyReport = (userData) => {
  const learningItems = userData?.learning?.items || [];
  const projects = userData?.projects || [];
  const roadmapCategories = userData?.roadmap || {};
  const portfolioGoals = userData?.portfolioGoals || [];

  // Target hours (assume weekly hours * 4)
  const weeklyHours = userData?.learning?.weeklyGoalHours || 18;
  const studyTarget = weeklyHours * 4;
  const studyCompleted = learningItems.reduce((sum, item) => sum + (item.timeSpent || 0), 0); // aggregated actual

  // Skills improved (progress > 20)
  const skills = userData?.skills || [];
  const skillsImproved = skills.filter((s) => s.progress > 20).length;

  // Projects completed
  const projectsCompleted = projects.filter((p) => p.status === "Completed").length;

  // Roadmap topics completed
  const roadmapMetrics = computeRoadmapMetrics(userData?.roadmap);
  const roadmapCompletedCount = roadmapMetrics.completedSubTopics;

  // Goal completion percentage
  const goalCompletionPercentage = portfolioGoals.length > 0
    ? Math.round(average(portfolioGoals.map((g) => g.progress || 0)))
    : 0;

  return {
    monthRange: getMonthRange(),
    studyTarget,
    studyCompleted,
    skillsImproved,
    projectsCompleted,
    roadmapTopicsCompleted: roadmapCompletedCount,
    goalCompletionPercentage,
  };
};

/**
 * Groups and sums hours spent by learning type (Course, Practice, Video, Reading)
 */
export const computeStudyHoursBreakdown = (learningItems = []) => {
  const types = ["Course", "Practice", "Video", "Reading"];
  const counts = { Course: 0, Practice: 0, Video: 0, Reading: 0 };

  learningItems.forEach((item) => {
    const type = item.type || "Course";
    if (counts[type] !== undefined) {
      counts[type] += item.timeSpent || 0;
    }
  });

  return types.map((type) => ({
    name: type,
    value: counts[type],
  }));
};

export const computeGoalMetrics = (goals = {}, roadmapMetrics = {}, dashboardMetrics = {}) => {
  const result = {};

  Object.keys(goals).forEach((scope) => {
    const goal = goals[scope];
    if (!goal) return;

    const title = goal.title || "Goal";
    const target = Number(goal.target) || 0;
    const currentValue = Number(goal.currentValue) || 0;
    const unit = goal.unit || "";
    const progress = target > 0 ? Math.round((currentValue / target) * 100) : 0;
    const remaining = Math.max(0, target - currentValue);

    const isPercent = unit === "%" || unit.toLowerCase() === "percent" || unit.toLowerCase() === "percentage";
    const unitStr = unit ? (isPercent ? "%" : ` ${unit}`) : "";

    let displayLabels = {};
    if (isPercent) {
      displayLabels = {
        target: `${target}%`,
        current: `${currentValue}%`,
        achieved: `${Math.min(100, progress)}%`,
        remaining: `${remaining}% remaining`,
        fraction: `${currentValue}% / ${target}%`
      };
    } else {
      displayLabels = {
        target: `${target}${unitStr}`,
        current: `${currentValue}${unitStr}`,
        achieved: `${Math.min(100, progress)}%`,
        remaining: `${remaining}${unitStr} remaining`,
        fraction: `${currentValue} / ${target}${unitStr}`
      };
    }

    result[scope] = {
      ...goal,
      title,
      target,
      currentValue,
      progress: Math.min(100, progress),
      unit,
      remaining,
      status: progress >= 100 ? "Completed" : "In Progress",
      displayLabels
    };
  });

  return result;
};
