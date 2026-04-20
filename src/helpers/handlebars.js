const {
  getTaskStatus,
} = require('../app/services/layersServices/taskServices');

module.exports = {
  taskStatusClass: task => {
    const status = getTaskStatus(task);

    if (status === 'done') return 'table-success';
    if (status === 'overdue') return 'table-danger';
    if (status === 'soon') return 'table-warning';

    return '';
  },

  formatDate: date => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';

    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate(),
    ).padStart(2, '0')}`;
  },

  formatDateInput: date => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';

    return d.toISOString().split('T')[0];
  },

  eq: (a, b) => a === b,

  selected: (value, current) => (value === current ? 'selected' : ''),
};
