export function computeRoadmapMetrics(roadmap) {
  if (!roadmap || !roadmap.mainTopics || !roadmap.byCategory) {
    return {
      totalMainTopics: 0,
      completedMainTopics: 0,
      totalSubTopics: 0,
      completedSubTopics: 0,
      remainingSubTopics: 0,
      inProgressSubTopics: 0,
      overallCompletionPct: 0,
      averageCompletionPct: 0,
      perCategory: [],
      mostCompletedMainTopic: null,
      leastCompletedMainTopic: null,
      estimatedHoursTotal: 0,
      estimatedHoursCompleted: 0,
      estimatedHoursRemaining: 0,
      recentlyUpdatedTopics: [],
      longestInactiveTopics: [],
    };
  }

  const { mainTopics, byCategory } = roadmap;
  
  let totalMainTopics = mainTopics.length;
  let completedMainTopics = 0;
  
  let totalSubTopics = 0;
  let completedSubTopics = 0;
  let inProgressSubTopics = 0;
  let remainingSubTopics = 0;
  
  let sumProgress = 0;
  
  let estimatedHoursTotal = 0;
  let estimatedHoursCompleted = 0;
  
  const perCategory = [];
  const allSubTopics = [];

  mainTopics.forEach((mainTopic) => {
    const subs = byCategory[mainTopic.name] || [];
    const catTotal = subs.length;
    let catCompleted = 0;
    let catProgressSum = 0;
    
    subs.forEach((sub) => {
      allSubTopics.push(sub);
      totalSubTopics++;
      sumProgress += sub.progress;
      catProgressSum += sub.progress;
      
      if (sub.completed || sub.progress === 100) {
        catCompleted++;
        completedSubTopics++;
      } else if (sub.progress > 0) {
        inProgressSubTopics++;
        remainingSubTopics++;
      } else {
        remainingSubTopics++;
      }
      
      if (sub.estimatedHours) {
        estimatedHoursTotal += sub.estimatedHours;
        estimatedHoursCompleted += (sub.estimatedHours * (sub.progress / 100));
      }
    });

    const catCompletionPct = catTotal > 0 ? Math.round(catProgressSum / catTotal) : 0;
    if (catTotal > 0 && catCompleted === catTotal) {
      completedMainTopics++;
    }
    
    perCategory.push({
      name: mainTopic.name,
      total: catTotal,
      completed: catCompleted,
      completionPct: catCompletionPct,
      mostCompleted: false,
      leastCompleted: false,
    });
  });

  const overallCompletionPct = totalSubTopics > 0 ? Math.round(sumProgress / totalSubTopics) : 0;
  
  // Most/Least completed categories
  let mostCompletedMainTopic = null;
  let leastCompletedMainTopic = null;
  
  if (perCategory.length > 0) {
    const validCats = [...perCategory].filter(c => c.total > 0);
    if (validCats.length > 0) {
      validCats.sort((a, b) => b.completionPct - a.completionPct);
      mostCompletedMainTopic = validCats[0];
      leastCompletedMainTopic = validCats[validCats.length - 1];
      
      perCategory.forEach(c => {
        if (mostCompletedMainTopic && c.name === mostCompletedMainTopic.name) c.mostCompleted = true;
        if (leastCompletedMainTopic && c.name === leastCompletedMainTopic.name && validCats.length > 1) c.leastCompleted = true;
      });
    }
  }

  const estimatedHoursRemaining = estimatedHoursTotal - estimatedHoursCompleted;
  
  // Recently updated and longest inactive
  const sortedByDate = [...allSubTopics].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const recentlyUpdatedTopics = sortedByDate.slice(0, 5);
  
  const incompleted = allSubTopics.filter(sub => !sub.completed);
  const longestInactiveTopics = incompleted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()).slice(0, 5);

  return {
    totalMainTopics,
    completedMainTopics,
    totalSubTopics,
    completedSubTopics,
    remainingSubTopics,
    inProgressSubTopics,
    overallCompletionPct,
    averageCompletionPct: overallCompletionPct,
    perCategory,
    mostCompletedMainTopic,
    leastCompletedMainTopic,
    estimatedHoursTotal,
    estimatedHoursCompleted,
    estimatedHoursRemaining,
    recentlyUpdatedTopics,
    longestInactiveTopics,
  };
}
