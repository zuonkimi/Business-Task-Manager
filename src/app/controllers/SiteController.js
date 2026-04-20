const {
  getTasksPageData,
  getHomePageData,
} = require('../services/controllersServices/task.service');

class SiteController {
  async show(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.redirect('/landing');
      }

      const filter = req.query.filter || 'all';

      const { tasks, stats, emptyMessage } = await getTasksPageData(
        req.session.userId,
        filter,
      );

      return res.render('tasks/show', {
        tasks,
        activeFilter: filter,
        soonTasks: stats.soon,
        overdueTasks: stats.overdue,
        doneTasks: stats.done,
        emptyMessage,
      });
    } catch (err) {
      next(err);
    }
  }

  async home(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.redirect('/landing');
      }

      const filter = req.query.filter || 'all';

      const { tasks, stats, trashTask, emptyMessage } = await getHomePageData(
        req.session.userId,
        filter,
      );

      return res.render('home', {
        tasks,
        activeFilter: filter,
        totalTask: stats.total,
        doneTasks: stats.done,
        overdueTasks: stats.overdue,
        soonTasks: stats.soon,
        trashTask,
        emptyMessage,
        userId: req.session.userId,
      });
    } catch (err) {
      next(err);
    }
  }

  landing(req, res) {
    return res.render('landing', {
      layout: 'landing',
    });
  }

  index(req, res) {
    if (!req.session.userId) {
      return res.redirect('/landing');
    }
    return res.redirect('/home');
  }

  search(req, res) {
    return res.send('Site Page');
  }
}

module.exports = new SiteController();
