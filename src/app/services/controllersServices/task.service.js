const Task = require('../../models/Task');
const { client, safeDel } = require('../layersServices/redisClient');
const {
  enrichTasks,
  filterTasks,
  countTasks,
  getEmptyMessage,
} = require('../layersServices/taskServices');
const { getUserTasks } = require('../layersServices/taskQueries');

// =====================
// SHOW PAGE
// =====================
const getTasksPageData = async (userId, filter) => {
  const tasks = await getUserTasks(userId, false);

  const enriched = enrichTasks(tasks);
  const filtered = filterTasks(enriched, filter);
  const stats = countTasks(enriched);

  return {
    tasks: filtered,
    stats,
    emptyMessage: filtered.length === 0 ? getEmptyMessage(filter) : '',
  };
};

// =====================
// HOME PAGE
// =====================
const getHomePageData = async (userId, filter) => {
  const tasks = await getUserTasks(userId, false);
  const trashTasks = await getUserTasks(userId, true);

  const enriched = enrichTasks(tasks);
  const filtered = filterTasks(enriched, filter);
  const stats = countTasks(enriched);

  return {
    tasks: filtered,
    stats,
    trashTask: trashTasks.length,
    emptyMessage: filtered.length === 0 ? getEmptyMessage(filter) : '',
  };
};

// =====================
// CREATE TASK
// =====================
const createTask = async (userId, data) => {
  const task = await Task.create({
    ...data,
    userId,
    deleted: false,
  });

  await safeDel(`tasks:${userId}`); // invalidate cache

  return task;
};

// =====================
// UPDATE TASK
// =====================
const updateTask = async (taskId, userId, data) => {
  await Task.updateOne({ _id: taskId, userId }, data);

  await safeDel(`tasks:${userId}`);
};

// =====================
// DELETE (SOFT)
// =====================
const deleteTask = async (taskId, userId) => {
  await Task.updateOne({ _id: taskId, userId }, { deleted: true });

  await safeDel(`tasks:${userId}`);
};

// =====================
// RESTORE
// =====================
const restoreTask = async (taskId, userId) => {
  await Task.updateOne({ _id: taskId, userId }, { deleted: false });

  await safeDel(`tasks:${userId}`);
};

// =====================
// FORCE DELETE
// =====================
const forceDeleteTask = async (taskId, userId) => {
  await Task.deleteOne({ _id: taskId, userId });

  await safeDel(`tasks:${userId}`);
};

// =====================
// TOGGLE STATUS
// =====================
const toggleStatus = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, userId });

  if (!task) return null;

  const newStatus = task.status === 'done' ? 'pending' : 'done';

  await Task.updateOne({ _id: taskId, userId }, { status: newStatus });

  await safeDel(`tasks:${userId}`);

  return true;
};

// =====================
// TRASH TASKS
// =====================
const getTrashTasks = async userId => {
  const tasks = await getUserTasks(userId, true);

  const deletedTasks = tasks.filter(t => t.deleted);

  const enriched = enrichTasks(deletedTasks);

  return {
    tasks: enriched,
    isEmpty: enriched.length === 0,
  };
};

module.exports = {
  getTasksPageData,
  getHomePageData,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  forceDeleteTask,
  toggleStatus,
  getTrashTasks,
};
