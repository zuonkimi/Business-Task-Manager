const Comment = require('../../models/Comment');

const enrichTasks = async (tasks, userId) => {
  const now = Date.now();
  const DAY = 1000 * 60 * 60 * 24;
  const commentCounts = await Comment.aggregate([
    {
      $match: { isDeleted: false, taskId: { $ne: null } },
    },
    {
      $group: {
        _id: '$taskId',
        count: { $sum: 1 },
      },
    },
  ]);
  const commentMap = {};
  commentCounts.forEach(item => {
    if (!item || !item._id) return;
    commentMap[String(item._id)] = item.count;
  });
  return tasks.map(task => {
    const obj = task.toObject ? task.toObject() : task;
    const deadline = obj.deadline ? new Date(obj.deadline).getTime() : null;
    const isOverdue = deadline && deadline < now && obj.status !== 'done';
    const isSoon =
      deadline &&
      deadline > now &&
      (deadline - now) / DAY <= 3 &&
      obj.status !== 'done';
    const isLiked =
      userId &&
      Array.isArray(obj.likes) &&
      obj.likes.some(id => String(id) === String(userId));
    return {
      ...obj,
      isOverdue,
      isSoon,
      isLiked,
      commentCount: commentMap[obj._id.toString()] || 0,
    };
  });
};

module.exports = {
  enrichTasks,
};
