// Helper: normalize date
const toDateOnly = date => {
  if (!date) return null;
  const customDate = new Date(date);

  return new Date(
    customDate.getFullYear(),
    customDate.getMonth(),
    customDate.getDate(),
  );
};

// Get status
const getTaskStatus = task => {
  if (task.status === 'done') return 'done';
  if (!task.deadline) return 'no-deadline';

  const today = toDateOnly(new Date());
  const deadline = toDateOnly(task.deadline);
  const diff = (deadline - today) / (1000 * 60 * 60 * 24);

  if (diff < 0) return 'overdue';
  if (diff <= 3) return 'soon';

  return 'normal';
};

// Push status in enrich task
const enrichTasks = tasks => {
  return tasks.map(task => {
    const status = getTaskStatus(task);

    return {
      ...task,
      status,
      isOverdue: status === 'overdue',
      isSoon: status === 'soon',
    };
  });
};

// Count tasks optimized
// const countTasks = tasks => {
//   const result = {
//     total: tasks.length,
//     overdue: 0,
//     soon: 0,
//     done: 0,
//   };

//   tasks.forEach(task => {
//     const status = getTaskStatus(task);

//     if (status === 'done') {
//       result.done++;
//     } else if (status === 'overdue') {
//       result.overdue++;
//     } else if (status === 'soon') {
//       result.soon++;
//     }
//   });

//   return result;
// };

const countTasks = tasks => {
  const result = {
    total: tasks.length,
    overdue: 0,
    soon: 0,
    done: 0,
  };

  for (const task of tasks) {
    const status = task.status || getTaskStatus(task);

    if (status === 'done') result.done++;
    else if (status === 'overdue') result.overdue++;
    else if (status === 'soon') result.soon++;
  }

  return result;
};

// Set Filter
const filterTasks = (tasks, filter) => {
  const filterMap = {
    done: task => task.status === 'done',
    overdue: task => task.isOverdue,
    soon: task => task.isSoon,
  };

  return filterMap[filter] ? tasks.filter(filterMap[filter]) : tasks;
};

// Get empty message
const getEmptyMessage = filter => {
  const map = {
    done: 'Chưa có task hoàn thành',
    overdue: 'Không có task quá hạn',
    soon: 'Không có task sắp hết hạn',
  };

  return map[filter] || 'Chưa có task nào';
};

module.exports = {
  toDateOnly,
  getTaskStatus,
  enrichTasks,
  countTasks,
  filterTasks,
  getEmptyMessage,
};
