module.exports = {
  // TASK STATUS CLASS
  taskStatusClass: task => {
    if (!task) return '';
    if (task.status === 'done') return 'table-success';
    if (task.status === 'cancelled') return 'table-secondary';
    if (task.isOverdue) return 'table-danger';
    if (task.isSoon) return 'table-warning';
    return '';
  },

  // FORMAT DATE (DISPLAY)
  formatDate: date => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  },

  // FORMAT DATE (INPUT)
  formatDateInput: date => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  // EQUALITY CHECK
  eq: (a, b) => a === b,

  // SELECT OPTION
  selected: (value, current) => {
    return value === current ? 'selected' : '';
  },

  // STRING INCLUDES (CASE INSENSITIVE)
  includes: (str, keyword) => {
    if (!str || !keyword) return false;
    return String(str).toLowerCase().includes(String(keyword).toLowerCase());
  },

  // HIGHLIGHT SEARCH KEYWORD
  highlight: (text, keyword) => {
    if (!text || !keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return String(text).replace(regex, '<mark>$1</mark>');
  },
};
