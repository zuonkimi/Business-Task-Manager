const Task = require('../../models/Task');

// =====================
// HELPERS
// =====================

// normalize keyword (clean + safe regex)
const normalizeKeyword = keyword => {
  if (!keyword) return null;

  const trimmed = keyword.trim();
  if (!trimmed) return null;

  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// =====================
// BUILD QUERY
// =====================
const buildQuery = (userId, filters = {}, includeDeleted = false) => {
  const { keyword, type, status, tags } = filters;

  const query = {
    userId,
    ...(includeDeleted ? {} : { deleted: false }),
  };

  // ===== KEYWORD SEARCH =====
  const safeKeyword = normalizeKeyword(keyword);

  if (safeKeyword) {
    query.$or = [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { description: { $regex: safeKeyword, $options: 'i' } },
      { tags: { $regex: safeKeyword, $options: 'i' } },
    ];
  }

  // ===== TYPE FILTER =====
  if (type) {
    query.type = type;
  }

  // ===== STATUS FILTER =====
  if (status && status !== 'overdue' && status !== 'soon') {
    query.status = status;
  }

  // ===== TAGS FILTER =====
  if (tags) {
    const tagArray = [].concat(tags).filter(Boolean);

    if (tagArray.length) {
      query.tags = { $in: tagArray };
    }
  }

  return query;
};

// =====================
// GET ALL TASKS
// =====================
const getUserTasks = (userId, filters = {}, includeDeleted = false) => {
  const query = buildQuery(userId, filters, includeDeleted);

  return Task.find(query).sort({ createdAt: -1 }).lean();
};

// =====================
// COUNT TASKS
// =====================
const countUserTasks = (userId, filters = {}, includeDeleted = false) => {
  const query = buildQuery(userId, filters, includeDeleted);

  return Task.countDocuments(query);
};

// =====================
// PAGINATE TASKS (DB LEVEL)
// =====================
const getUserTasksPaginated = (userId, filters = {}, skip = 0, limit = 10) => {
  const query = buildQuery(userId, filters, false);

  return Task.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

module.exports = {
  getUserTasks,
  countUserTasks,
  getUserTasksPaginated,
};
