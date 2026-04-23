const taskGlobal = require('../globalServices/task.globalService');
const { safeDel } = require('../layersServices/redisClient');

// =====================
// CONSTANTS
// =====================
const STATUS = {
  DONE: 'done',
  PENDING: 'pending',
};

// =====================
// CREATE TASK
// =====================
const createTask = async (userId, data) => {
  const task = await taskGlobal.create({
    ...data,
    userId,
    deleted: false,
  });

  await safeDel(`tasks:${userId}`);

  return task;
};

// =====================
// UPDATE TASK
// =====================
const updateTask = async (taskId, userId, data) => {
  await taskGlobal.update(taskId, userId, data);

  await safeDel(`tasks:${userId}`);
};

// =====================
// DELETE (SOFT)
// =====================
const deleteTask = async (taskId, userId) => {
  await taskGlobal.update(taskId, userId, { deleted: true });

  await safeDel(`tasks:${userId}`);
};

// =====================
// RESTORE TASK
// =====================
const restoreTask = async (taskId, userId) => {
  await taskGlobal.update(taskId, userId, { deleted: false });

  await safeDel(`tasks:${userId}`);
};

// =====================
// FORCE DELETE
// =====================
const forceDeleteTask = async (taskId, userId) => {
  await taskGlobal.delete(taskId, userId);

  await safeDel(`tasks:${userId}`);
};

// =====================
// TOGGLE STATUS
// =====================
const toggleStatus = async (taskId, userId) => {
  const task = await taskGlobal.findById(taskId, userId);

  if (!task) return null;

  const newStatus = task.status === STATUS.DONE ? STATUS.PENDING : STATUS.DONE;

  await taskGlobal.update(taskId, userId, { status: newStatus });

  await safeDel(`tasks:${userId}`);

  return newStatus;
};

// =====================
// GET TASK BY ID
// =====================
const getTaskById = async (taskId, userId) => {
  return await taskGlobal.findById(taskId, userId);
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  forceDeleteTask,
  toggleStatus,
  getTaskById,
};
