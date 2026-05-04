const taskPageService = require('../../services/pageServices/task.pageService');
const searchPageService = require('../../services/pageServices/search.pageService');
class SiteController {
  // SHOW TASK PAGE
  async show(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.redirect('/landing');
      }
      const result = await taskPageService.getTasksPage(
        req.session.userId,
        req.query,
      );
      return res.render('tasks/show', {
        tasks: result.tasks,
        activeFilter: result.filters,
        pagination: result.pagination,
        currentUrl: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    const result = await searchPageService.search(
      req.query,
      req.session.userId,
    );
    return res.render('search', {
      tasks: result.tasks,
      users: result.users,
      keyword: result.keyword,
    });
  }

  // HOME PAGE
  async home(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.redirect('/landing');
      }
      const result = await taskPageService.getHomePageData(req.session.userId);
      return res.render('home', {
        tasks: result.tasks,
        totalTask: result.stats.total,
        doneTasks: result.stats.done,
        overdueTasks: result.stats.overdue,
        soonTasks: result.stats.soon,
        trashTask: result.stats.trash,
        emptyMessage: result.emptyMessage,
        userId: req.session.userId,
      });
    } catch (err) {
      next(err);
    }
  }

  // LANDING PAGE
  landing(req, res) {
    return res.render('landing', {
      layout: 'landing',
    });
  }

  // ROOT
  index(req, res) {
    if (!req.session.userId) {
      return res.redirect('/landing');
    }
    return res.redirect('/home');
  }
}

module.exports = new SiteController();
