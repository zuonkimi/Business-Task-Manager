const Task = require('../../models/Task');

// Get all tasks no cache
const getUserTasks = (userId, includeDeleted = false) => {
  return Task.find({ userId, deleted: includeDeleted })
    .sort({ createdAt: -1 })
    .lean();
};

// Count tasks
const countUserTasks = userId => {
  return Task.countDocuments({ userId });
};

// Paginate tasks
const getUserTasksPaginated = (userId, skip = 0, limit = 10) => {
  //skip 0 get ten tasks first page
  return Task.find({ userId, deleted: false }) // get tasks of user and not deleted
    .sort({ createdAt: -1 }) // created time new -> old
    .skip(skip) // skip first n tasks
    .limit(limit) // only get record with limit number
    .lean();
};

// const getUserTasksCached = async userId => {
//   try {
//     const key = `tasks:${userId}`;
//     const cached = await client.get(key);

//     if (cached) return JSON.parse(cached);

//     const tasks = await Task.find({ userId, deleted: false })
//       .sort({ createdAt: -1 })
//       .lean();

//     await client.setEx(key, 60, JSON.stringify(tasks));

//     return tasks;
//   } catch (err) {
//     return Task.find({ userId, deleted: false }).lean();
//   }
// };

module.exports = {
  getUserTasks,
  countUserTasks,
  getUserTasksPaginated,
};
