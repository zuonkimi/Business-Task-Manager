const Task = require('../../models/Task');
const Follow = require('../../models/Follow');
const { buildQuery } = require('../layersServices/taskQueries');
const { enrichTasks } = require('../layersServices/taskServices');

//  FILTER BUILDER
const buildFilters = query => ({
  keyword: query.keyword?.trim() || '',
  status: query.status || query.filter || '',
  tags: query.tags || '',
});

//  STATUS FILTER (PURE JS)
const filterByStatus = (tasks, status) => {
  if (!status) return tasks;
  return tasks.filter(task => {
    switch (status) {
      case 'overdue':
        return task.isOverdue;
      case 'soon':
        return task.isSoon;
      case 'done':
        return task.status === 'done';
      default:
        return true;
    }
  });
};

//  PAGINATION
const paginate = (items, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: items.length,
      pages: Math.ceil(items.length / limit),
    },
  };
};

//  EXECUTOR (DRY)
const runQuery = (query, page = 1, limit = 10, populate = true) => {
  let q = Task.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  if (populate) q = q.populate('author');
  return q.lean();
};

//  FEED PAGE
const getFeedPage = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = 10;
  const filters = buildFilters(query);

  const following = await Follow.find({ follower: userId }).select('following');
  const followingIds = following.map(f => f.following);
  followingIds.push(userId);
  const taskQuery = buildQuery(userId, filters, {
    mode: 'feed',
    followingIds,
  });

  const tasks = await runQuery(taskQuery, page, limit);
  const enriched = enrichTasks(tasks, userId);
  const filtered = filterByStatus(enriched, filters.status);
  const total = await Task.countDocuments(taskQuery);
  return {
    tasks: filtered,
    filters,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

//  TASKS PAGE (MY POSTS)
const getTasksPage = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = 10;
  const filters = buildFilters(query);
  const taskQuery = buildQuery(userId, filters, {
    mode: 'myPosts',
  });
  const tasks = await runQuery(taskQuery, page, limit);

  const enriched = enrichTasks(tasks, userId);
  const filtered = filterByStatus(enriched, filters.status);
  const paginated = paginate(filtered, page, limit);
  return {
    tasks: paginated.data,
    filters,
    pagination: paginated.meta,
  };
};

//  PROFILE PAGE
const getProfilePage = async (viewerId, profileUserId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = 10;
  const filters = buildFilters(query);
  const taskQuery = buildQuery(viewerId, filters, {
    mode: 'profile',
    targetUserId: profileUserId,
  });
  const tasks = await runQuery(taskQuery, page, limit);
  const enriched = enrichTasks(tasks, viewerId);
  const filtered = filterByStatus(enriched, filters.status);
  const total = await Task.countDocuments(taskQuery);
  return {
    tasks: filtered,
    filters,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

//  HOME PAGE
const getHomePageData = async userId => {
  const following = await Follow.find({ follower: userId }).select('following');
  const followingIds = following.map(f => f.following);
  followingIds.push(userId);
  const taskQuery = buildQuery(
    userId,
    {},
    {
      mode: 'feed',
      followingIds,
    },
  );
  const tasks = await runQuery(taskQuery, 1, 100);
  const trash = await Task.countDocuments({
    author: userId,
    deleted: true,
  });
  const now = Date.now();
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => {
      const d = t.deadline ? new Date(t.deadline).getTime() : null;
      return d && d < now && t.status !== 'done';
    }).length,
    soon: tasks.filter(t => {
      const d = t.deadline ? new Date(t.deadline).getTime() : null;
      return d && d > now && (d - now) / 86400000 <= 3 && t.status !== 'done';
    }).length,
    trash,
  };
  return {
    tasks: enrichTasks(tasks, userId),
    stats,
    emptyMessage: tasks.length ? '' : 'Hãy follow ai đó để xem feed 👀',
  };
};

//  CREATE PAGE
const getCreatePageData = async userId => {
  const taskQuery = buildQuery(
    userId,
    {},
    {
      mode: 'myPosts',
    },
  );
  const tasks = await runQuery(taskQuery, 1, 50, false);
  const enriched = enrichTasks(tasks, userId);
  return {
    tasks: enriched,
    emptyMessage: enriched.length ? '' : 'No tasks found',
  };
};

//  TRASH PAGE
const getTrashPageData = async userId => {
  const taskQuery = buildQuery(
    userId,
    {},
    {
      mode: 'trash',
    },
  );
  const tasks = await runQuery(taskQuery, 1, 50);
  const enriched = enrichTasks(tasks, userId);
  return {
    tasks: enriched,
    isEmpty: enriched.length === 0,
  };
};

module.exports = {
  getTasksPage,
  getHomePageData,
  getCreatePageData,
  getTrashPageData,
  getFeedPage,
  getProfilePage,
};
