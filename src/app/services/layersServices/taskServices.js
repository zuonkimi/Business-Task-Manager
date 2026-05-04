const enrichTasks = (tasks, userId) => {
  const now = Date.now();
  const DAY = 1000 * 60 * 60 * 24;
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
    };
  });
};

module.exports = {
  enrichTasks,
};
