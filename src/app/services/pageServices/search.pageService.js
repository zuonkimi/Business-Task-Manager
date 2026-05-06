const Task = require('../../models/Task');
const User = require('../../models/User');
const { enrichTasks } = require('../layersServices/taskServices');

const escapeRegex = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
const search = async (query, userId) => {
  const keyword = query.keyword?.trim();
  if (!keyword || keyword.length < 2) {
    return { tasks: [], user: [], keyword: '' };
  }
  const safeKeyword = escapeRegex(keyword);
  const taskQuery = {
    deleted: false,
    $or: [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { description: { $regex: safeKeyword, $options: 'i' } },
      { tags: { $regex: safeKeyword, $options: 'i' } },
    ],
  };
  const tasks = await Task.find(taskQuery)
    .populate('author', 'name avatar')
    .lean();
  const users = await User.find({
    $or: [
      { name: { $regex: safeKeyword, $options: 'i' } },
      { username: { $regex: safeKeyword, $options: 'i' } },
    ],
  }).lean();
  return {
    tasks: await enrichTasks(tasks),
    users,
    keyword,
  };
};

module.exports = { search };
