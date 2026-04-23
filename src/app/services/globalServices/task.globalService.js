const Task = require('../../models/Task');

// =====================
// CREATE
// =====================
const create = data => {
  return Task.create(data);
};

// =====================
// FIND BY USER
// =====================
const findByUser = (userId, query = {}) => {
  return Task.find({ userId, ...query }).lean();
};

// =====================
// FIND BY ID
// =====================
const findById = (taskId, userId) => {
  return Task.findOne({ _id: taskId, userId }).lean();
};

// =====================
// UPDATE
// =====================
const update = (taskId, userId, data) => {
  return Task.updateOne({ _id: taskId, userId }, data);
};

// =====================
// DELETE (HARD)
// =====================
const deleteOne = (taskId, userId) => {
  return Task.deleteOne({ _id: taskId, userId });
};

// =====================
// TRASH
// =====================
const findTrash = userId => {
  return Task.find({ userId, deleted: true }).lean();
};

const countTrash = userId => {
  return Task.countDocuments({ userId, deleted: true });
};

module.exports = {
  create,
  findByUser,
  findById,
  update,
  delete: deleteOne,
  findTrash,
  countTrash,
};
