/**
 * @typedef {Object} MainTopic
 * @property {string} id
 * @property {string} name
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} SubTopic
 * @property {string} id
 * @property {string} category
 * @property {string} name
 * @property {boolean} completed
 * @property {number} progress
 * @property {string} status
 * @property {string|null} notes
 * @property {number|null} estimatedHours
 * @property {string} priority
 * @property {number} sortOrder
 * @property {string} updatedAt
 */

export const CATEGORY_SENTINEL = "__CATEGORY__";

export const isMainTopicRow = (row) => row.topic_id === CATEGORY_SENTINEL;

export const deriveStatus = (progress) => {
  if (progress === 0) return "Not Started";
  if (progress > 0 && progress <= 30) return "Learning";
  if (progress > 30 && progress < 100) return "Practicing";
  return "Completed";
};

export const toMainTopicRow = (userId, name, sortOrder = 0) => ({
  user_id: userId,
  category: name,
  topic_id: CATEGORY_SENTINEL,
  topic_title: "",
  completed: false,
  progress: 0,
  notes: "",
  estimated_hours: null,
  priority: "Medium",
  sort_order: sortOrder,
  updated_at: new Date().toISOString(),
});

export const fromDbRows = (rows) => {
  const mainTopics = [];
  const byCategory = {};

  // First pass: extract main topics
  const sentinelRows = rows.filter(isMainTopicRow);
  sentinelRows.forEach((row) => {
    mainTopics.push({
      id: row.id, // the DB row ID of the sentinel
      name: row.category,
      sortOrder: row.sort_order || 0,
    });
    if (!byCategory[row.category]) {
      byCategory[row.category] = [];
    }
  });

  // Second pass: extract sub topics
  const subTopicRows = rows.filter((r) => !isMainTopicRow(r));
  subTopicRows.forEach((row) => {
    // If a subtopic belongs to a category that wasn't properly initialized (e.g. from old data)
    if (!byCategory[row.category]) {
      byCategory[row.category] = [];
      // Also inject a virtual MainTopic if there wasn't a sentinel row (to handle old data gracefully)
      if (!mainTopics.some((m) => m.name === row.category)) {
        mainTopics.push({
          id: `virtual-${row.category}`,
          name: row.category,
          sortOrder: mainTopics.length,
        });
      }
    }

    byCategory[row.category].push({
      id: row.topic_id, // we map topic_id to id for the frontend
      row_id: row.id,   // keep actual db id just in case
      category: row.category,
      name: row.topic_title || row.topic_id,
      completed: row.completed || false,
      progress: row.progress || 0,
      status: deriveStatus(row.progress || 0),
      notes: row.notes || "",
      estimatedHours: row.estimated_hours ? Number(row.estimated_hours) : null,
      priority: row.priority || "Medium",
      sortOrder: row.sort_order || 0,
      updatedAt: row.updated_at || new Date().toISOString(),
    });
  });

  // Sort them
  mainTopics.sort((a, b) => a.sortOrder - b.sortOrder);
  Object.keys(byCategory).forEach((cat) => {
    byCategory[cat].sort((a, b) => a.sortOrder - b.sortOrder);
  });

  return { mainTopics, byCategory };
};
