// =====================
// ENRICH TASKS
// =====================
const enrichTasks = tasks => {
  const now = new Date();

  return tasks.map(task => {
    const deadline = task.deadline ? new Date(task.deadline) : null;

    const isOverdue = deadline && deadline < now && task.status !== 'done';

    const isSoon =
      deadline &&
      deadline > now &&
      (deadline - now) / (1000 * 60 * 60 * 24) <= 2;

    return {
      ...task,
      isOverdue,
      isSoon,
    };
  });
};

module.exports = {
  enrichTasks,
};
