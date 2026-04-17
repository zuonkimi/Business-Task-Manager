const Task = require('../models/Task');
const {
  enrichTasks,
  countTasks,
  getEmptyMessage,
  filterTasks,
} = require('../services/taskServices');

class SiteController {
  async show(req, res, next) {
    try {
      const filter = req.query.filter || 'all';
      const tasks = await Task.find({
        deleted: false,
        userId: req.session.userId,
      })
        .sort({ createdAt: -1 })
        .lean();

      const tasksWithStatus = enrichTasks(tasks);

      const filteredTask = filterTasks(tasksWithStatus, filter);

      const { done, overdue, soon } = countTasks(tasksWithStatus);
      let emptyMessage = '';
      if (filteredTask.length === 0) {
        emptyMessage = getEmptyMessage(filter);
      }

      res.render('tasks/show', {
        tasks: filteredTask,
        activeFilter: filter,
        soonTasks: soon,
        overdueTasks: overdue,
        doneTasks: done,
        emptyMessage,
      });
    } catch (err) {
      next(err);
    }
  }

  search(req, res, next) {
    res.send('Site Page');
  }

  async home(req, res, next) {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      if (!req.session.userId) {
        return res.render('landing', {
          layout: 'landing',
        });
      }

      const filter = req.query.filter || 'all';
      const tasks = await Task.find({ userId: req.session.userId })
        .sort({ createdAt: -1 })
        .lean();

      const activeTasks = tasks.filter(task => !task.deleted);
      const tasksWithStatus = enrichTasks(activeTasks);
      const filteredTask = filterTasks(tasksWithStatus, filter);
      const { total, done, overdue, soon } = countTasks(tasksWithStatus);
      const trashTask = tasks.filter(task => task.deleted).length;
      let emptyMessage = '';
      if (filteredTask.length === 0) {
        emptyMessage = getEmptyMessage(filter);
      }

      res.render('home', {
        tasks: filteredTask,
        activeFilter: filter,
        totalTask: total,
        doneTasks: done,
        overdueTasks: overdue,
        soonTasks: soon,
        trashTask,
        emptyMessage,
        userId: req.session.userId,
      });
    } catch (err) {
      next(err);
    }
  }

  landing(req, res, next) {
    return res.render('landing', {
      layout: 'landing',
    });
  }
  index(req, res, next) {
    if (!req.session.userId) {
      return res.redirect('/landing');
    }

    return res.redirect('/home');
  }
}

module.exports = new SiteController();
