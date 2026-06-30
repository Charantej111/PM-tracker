import { percent, average } from "./helpers";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Computes comprehensive planner analytics for a list of flat planner tasks.
 * Designed to be AI-ready and support historical reporting.
 */
export const computePlannerAnalytics = (tasks = [], activityLog = [], todayKey = formatDateKey(new Date())) => {
  if (!tasks || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      missedTasks: 0,
      lateTasks: 0,
      completionRate: 0,
      onTimeRate: 0,
      averageDelay: 0,
      productiveWeekday: "N/A",
      weakestWeekday: "N/A",
      morningCompletion: 0,
      afternoonCompletion: 0,
      eveningCompletion: 0,
      nightCompletion: 0,
      streak: 0,
      longestStreak: 0,
      daysCreated: 0,
      daysFullyCompleted: 0,
      consistency: 0,
    };
  }

  // Group tasks by planned date
  const tasksByDate = {};
  tasks.forEach((t) => {
    const d = t.plannedDate || t.date;
    if (d) {
      if (!tasksByDate[d]) {
        tasksByDate[d] = [];
      }
      tasksByDate[d].push(t);
    }
  });

  const dates = Object.keys(tasksByDate).sort();
  const daysCreated = dates.length;

  let daysFullyCompleted = 0;
  dates.forEach((d) => {
    const dayTasks = tasksByDate[d];
    if (dayTasks.length > 0 && dayTasks.every((t) => t.completed)) {
      daysFullyCompleted++;
    }
  });

  // Calculate overall and schedule metrics
  const totalTasks = tasks.length;
  let completedTasks = 0;
  let missedTasks = 0;
  let completedOnTime = 0;
  let lateTasks = 0;
  let totalDelayDays = 0;

  // Period stats
  const periodTotal = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const periodCompleted = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  tasks.forEach((t) => {
    const period = t.period || "morning";
    if (periodTotal[period] !== undefined) {
      periodTotal[period]++;
    }

    if (t.completed) {
      completedTasks++;
      if (periodCompleted[period] !== undefined) {
        periodCompleted[period]++;
      }

      const plannedDateStr = t.plannedDate || t.date;
      const completedOnSchedule = t.completedOnSchedule ?? (t.completedDate === plannedDateStr);
      
      if (completedOnSchedule) {
        completedOnTime++;
      } else {
        lateTasks++;
        if (t.completedDate && plannedDateStr) {
          const planned = new Date(plannedDateStr);
          const completed = new Date(t.completedDate);
          const diffTime = completed - planned;
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            totalDelayDays += diffDays;
          }
        }
      }
    } else {
      missedTasks++;
    }
  });

  const completionRate = percent(completedTasks, totalTasks);
  const onTimeRate = completedTasks > 0 ? percent(completedOnTime, completedTasks) : 0;
  const averageDelay = lateTasks > 0 ? Number((totalDelayDays / lateTasks).toFixed(1)) : 0;
  const consistency = daysCreated > 0 ? percent(daysFullyCompleted, daysCreated) : 0;

  // Period completion rates
  const morningCompletion = periodTotal.morning > 0 ? percent(periodCompleted.morning, periodTotal.morning) : 0;
  const afternoonCompletion = periodTotal.afternoon > 0 ? percent(periodCompleted.afternoon, periodTotal.afternoon) : 0;
  const eveningCompletion = periodTotal.evening > 0 ? percent(periodCompleted.evening, periodTotal.evening) : 0;
  const nightCompletion = periodTotal.night > 0 ? percent(periodCompleted.night, periodTotal.night) : 0;

  // Weekday performance
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const completedByWeekday = [0, 0, 0, 0, 0, 0, 0];
  const totalByWeekday = [0, 0, 0, 0, 0, 0, 0];

  tasks.forEach((t) => {
    const plannedDateStr = t.plannedDate || t.date;
    if (plannedDateStr) {
      const dayOfWeek = new Date(plannedDateStr).getDay();
      if (!isNaN(dayOfWeek)) {
        totalByWeekday[dayOfWeek]++;
        if (t.completed) {
          completedByWeekday[dayOfWeek]++;
        }
      }
    }
  });

  let maxCompleted = -1;
  let productiveIdx = -1;
  let minCompleted = Infinity;
  let weakestIdx = -1;

  for (let i = 0; i < 7; i++) {
    if (totalByWeekday[i] > 0) {
      if (completedByWeekday[i] > maxCompleted) {
        maxCompleted = completedByWeekday[i];
        productiveIdx = i;
      }
      if (completedByWeekday[i] < minCompleted) {
        minCompleted = completedByWeekday[i];
        weakestIdx = i;
      }
    }
  }

  const productiveWeekday = productiveIdx !== -1 ? weekdayNames[productiveIdx] : "N/A";
  const weakestWeekday = weakestIdx !== -1 ? weekdayNames[weakestIdx] : "N/A";

  // Streak calculations
  const completedDatesSet = new Set(
    dates.filter((d) => tasksByDate[d].every((t) => t.completed))
  );

  let streak = 0;
  let longestStreak = 0;

  if (dates.length > 0) {
    const today = new Date(todayKey);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterday);

    const todayHasTasks = tasksByDate[todayKey]?.length > 0;
    const todayIsFullyCompleted = todayHasTasks && tasksByDate[todayKey].every((t) => t.completed);

    let checkDateStr = "";
    if (todayIsFullyCompleted) {
      checkDateStr = todayKey;
    } else if (!todayHasTasks) {
      checkDateStr = yesterdayStr;
    } else {
      checkDateStr = yesterdayStr;
    }

    let tempDate = new Date(checkDateStr);
    while (true) {
      const tempStr = formatDateKey(tempDate);
      if (completedDatesSet.has(tempStr)) {
        streak++;
        tempDate.setDate(tempDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak
    const completedDatesArr = Array.from(completedDatesSet).sort();
    if (completedDatesArr.length > 0) {
      let tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < completedDatesArr.length; i++) {
        const prevD = new Date(completedDatesArr[i - 1]);
        const currD = new Date(completedDatesArr[i]);
        const diffTime = currD - prevD;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }
  }

  return {
    totalTasks,
    completedTasks,
    missedTasks,
    lateTasks,
    completionRate,
    onTimeRate,
    averageDelay,
    productiveWeekday,
    weakestWeekday,
    morningCompletion,
    afternoonCompletion,
    eveningCompletion,
    nightCompletion,
    streak,
    longestStreak,
    daysCreated,
    daysFullyCompleted,
    consistency,
  };
};
