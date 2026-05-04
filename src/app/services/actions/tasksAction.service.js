const Task = require('../../models/Task');

const toggleLike = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found!');
  }
  const isLiked = task.likes.some(id => id.toString() === userId.toString());
  if (isLiked) {
    task.likes = task.likes.filter(id => id.toString() !== userId.toString());
    task.likeCount = Math.max(0, task.likeCount - 1);
  } else {
    task.likes.push(userId);
    task.likeCount += 1;
  }
  await task.save();
  return {
    liked: !isLiked,
    likeCount: task.likeCount,
  };
};

module.exports = { toggleLike };
