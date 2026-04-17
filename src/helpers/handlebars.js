const Handlebars = require('handlebars');

module.exports = {
  taskStatusClass: task => {
    if (task.status === 'done') return 'table-success';
    if (!task.deadline) return '';

    const now = new Date();
    const deadline = new Date(task.deadline);

    if (isNaN(deadline)) return '';

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineDate = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate(),
    );

    if (deadlineDate < today) return 'table-danger';

    const diff = (deadlineDate - today) / (1000 * 60 * 60 * 24);

    if (diff <= 3) return 'table-warning';
    return '';
  },
  formatDate: date => {
    if (!date) return '';
    const customDate = new Date(date);
    if (isNaN(customDate.getTime())) return '';

    const month = String(customDate.getMonth() + 1).padStart(2, '0');
    const day = String(customDate.getDate()).padStart(2, '0');

    return `${month}/${day}`;
  },
  formatDateInput: date => {
    if (!date) return '';

    const inputDate = new Date(date);

    if (isNaN(inputDate.getTime())) return '';

    return inputDate.toISOString().split('T')[0];
  },
  eq: (a, b) => {
    return a === b;
  },
  selected: (value, crr) => {
    return value === crr ? 'selected' : '';
  },
};
