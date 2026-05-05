const Task = require('../../models/Task');
const { safeDel } = require('../layersServices/redisClient');

const isOwner = (task, userId) =>
  task && String(task.author) === String(userId);

//  CREATE
const createTask = async (userId, data) => {
  const task = await Task.create({
    ...data,
    author: userId,
    deleted: false,
  });
  await safeDel(`tasks:${userId}`);
  return task;
};

//  UPDATE
const updateTask = async (taskId, userId, data) => {
  const task = await Task.findById(taskId);
  if (!isOwner(task, userId)) return null;
  await Task.updateOne({ _id: taskId }, data);
  await safeDel(`tasks:${userId}`);
  return true;
};

//  DELETE (SOFT)
const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!isOwner(task, userId)) return null;
  await Task.updateOne({ _id: taskId }, { deleted: true });
  await safeDel(`tasks:${userId}`);
  return true;
};

//  RESTORE
const restoreTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!isOwner(task, userId)) return null;
  await Task.updateOne({ _id: taskId }, { deleted: false });
  await safeDel(`tasks:${userId}`);
  return true;
};

//  FORCE DELETE
const forceDeleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!isOwner(task, userId)) return null;
  await Task.deleteOne({ _id: taskId });
  await safeDel(`tasks:${userId}`);
  return true;
};

//  TOGGLE STATUS
const toggleStatus = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!isOwner(task, userId)) return null;
  const newStatus = task.status === 'done' ? 'pending' : 'done';
  await Task.updateOne({ _id: taskId }, { status: newStatus });
  await safeDel(`tasks:${userId}`);
  return newStatus;
};

//  GET BY ID
const getTaskById = async (taskId, userId) => {
  const task = await Task.findOne({
    _id: taskId,
    deleted: false,
  }).lean();
  if (!isOwner(task, userId)) return null;
  return task;
};

//GET TASK DETAIL
const getDetail = async (taskId, userId) => {
  const task = await Task.findOne({
    _id: taskId,
    deleted: false,
  })
    .populate('author')
    .populate({
      path: 'comments',
      populate: { path: 'user' },
    })
    .lean();
  return task;
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  forceDeleteTask,
  toggleStatus,
  getTaskById,
  getDetail,
};
