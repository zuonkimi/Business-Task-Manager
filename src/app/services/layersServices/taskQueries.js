//  NORMALIZE KEYWORD
const normalizeKeyword = keyword => {
  if (!keyword) return null;
  const trimmed = keyword.trim();
  return trimmed || null;
};

//  BUILD QUERY (DB ONLY LOGIC)
const buildQuery = (viewerId, filters = {}, options = {}) => {
  const { keyword, type, status, tags } = filters;
  const { mode = 'myPosts', targetUserId, followingIds = [] } = options;
  const query = {
    deleted: false,
  };
  const safeKeyword = normalizeKeyword(keyword);
  switch (mode) {
    case 'profile':
      query.author = targetUserId;
      break;
    case 'myPosts':
      query.author = viewerId;
      break;
    case 'feed':
      query.author = { $in: followingIds.length ? followingIds : [viewerId] };
      break;
    case 'trash':
      query.author = viewerId;
      query.deleted = true;
      break;
    default:
      query.author = viewerId;
  }
  /* ===== KEYWORD SEARCH ===== */
  if (safeKeyword) {
    query.$or = [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { description: { $regex: safeKeyword, $options: 'i' } },
      { tags: { $regex: safeKeyword, $options: 'i' } },
    ];
  }
  /* ===== TYPE ===== */
  if (type) {
    query.type = type;
  }
  /* ===== STATUS (ONLY REAL DB STATUS) ===== */
  if (status && !['overdue', 'soon'].includes(status)) {
    query.status = status;
  }
  /* ===== TAGS ===== */
  if (tags) {
    const tagArray = [].concat(tags).filter(Boolean);
    if (tagArray.length) {
      query.tags = { $in: tagArray };
    }
  }
  return query;
};

//  GET TASKS
const getUserTasks = (userId, filters = {}, options = {}) => {
  const query = buildQuery(userId, filters, options);
  return Task.find(query).populate('author').sort({ createdAt: -1 }).lean();
};

//  COUNT TASKS
const countUserTasks = (userId, filters = {}, options = {}) => {
  const query = buildQuery(userId, filters, options);
  return Task.countDocuments(query);
};

//  PAGINATED TASKS
const getUserTasksPaginated = (
  userId,
  filters = {},
  options = {},
  skip = 0,
  limit = 10,
) => {
  const query = buildQuery(userId, filters, options);
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
  buildQuery,
};
