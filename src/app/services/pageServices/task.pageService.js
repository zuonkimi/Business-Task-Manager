const Task = require('../../models/Task');
const taskGlobal = require('../globalServices/task.globalService');
const { getUserTasks } = require('../layersServices/taskQueries');
const { enrichTasks } = require('../layersServices/taskServices');

const applyFilter = (tasks, filters) => {
  let result = tasks;

  if (filters.status === 'overdue') {
    result = result.filter(t => t.isOverdue);
  }

  if (filters.status === 'soon') {
    result = result.filter(t => t.isSoon);
  }

  if (filters.status === 'done') {
    result = result.filter(t => t.status === 'done');
  }

  return result;
};

const paginate = (data, page, limit) => {
  const total = data.length;
  const start = (page - 1) * limit;

  return {
    data: data.slice(start, start + limit),
    meta: { page, total, limit },
  };
};

const getTasksPage = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = 10;

  const filters = {
    keyword: query.keyword,
    type: query.type,
    status: query.status || query.filter,
    tags: query.tags,
  };

  const tasks = await getUserTasks(userId, filters);

  const enriched = enrichTasks(tasks);

  const filtered = applyFilter(enriched, filters);

  const paginated = paginate(filtered, page, limit);

  return {
    tasks: paginated.data,
    filters,
    pagination: paginated.meta,
  };
};

const getHomePageData = async (userId, query) => {
  const tasks = await getUserTasks(userId);

  const enriched = enrichTasks(tasks);

  const stats = {
    total: enriched.length,
    done: enriched.filter(t => t.status === 'done').length,
    overdue: enriched.filter(t => t.isOverdue).length,
    soon: enriched.filter(t => t.isSoon).length,
  };

  const trashTask = await Task.countDocuments({
    userId,
    deleted: true,
  });

  return {
    tasks: enriched,
    stats,
    trashTask,
    emptyMessage: enriched.length === 0 ? 'No tasks found' : '',
  };
};

const getCreatePageData = async (userId, query = {}) => {
  const tasks = await taskGlobal.findByUser(userId, { deleted: false });

  const enriched = enrichTasks(tasks);

  return {
    tasks: enriched,
    emptyMessage: enriched.length === 0 ? 'No tasks found' : '',
  };
};

const getTrashPageData = async userId => {
  const tasks = await taskGlobal.findTrash(userId);

  const enriched = enrichTasks(tasks);

  return {
    tasks: enriched,
    isEmpty: enriched.length === 0,
  };
};

module.exports = {
  getTasksPage,
  getHomePageData,
  getTrashPageData,
  getCreatePageData,
};
