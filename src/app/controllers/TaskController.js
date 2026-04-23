const taskService = require('../services/controllersServices/task.service');
const taskPageService = require('../services/pageServices/task.pageService');

class TaskController {
  // =====================
  // LIST TASKS (SHOW PAGE)
  // =====================
  async index(req, res, next) {
    try {
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

  // =====================
  // CREATE PAGE
  // =====================
  async create(req, res, next) {
    try {
      const result = await taskPageService.getCreatePageData(
        req.session.userId,
        req.query,
      );

      return res.render('tasks/create', {
        tasks: result.tasks,
        emptyMessage: result.emptyMessage,
        currentUrl: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // STORE TASK
  // =====================
  async store(req, res, next) {
    try {
      const { title, status, deadline, tags, description } = req.body;

      await taskService.createTask(req.session.userId, {
        title,
        status,
        deadline,
        description,
        tags: Array.isArray(tags) ? tags : [tags],
      });

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // DELETE (SOFT)
  // =====================
  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.session.userId);

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // RESTORE
  // =====================
  async restore(req, res, next) {
    try {
      await taskService.restoreTask(req.params.id, req.session.userId);

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // FORCE DELETE
  // =====================
  async forceDelete(req, res, next) {
    try {
      await taskService.forceDeleteTask(req.params.id, req.session.userId);

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // TOGGLE STATUS
  // =====================
  async updateStatus(req, res, next) {
    try {
      const result = await taskService.toggleStatus(
        req.params.id,
        req.session.userId,
      );

      if (!result) {
        return res.status(404).send('Task not found');
      }

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // EDIT PAGE
  // =====================
  async edit(req, res, next) {
    try {
      const task = await taskService.getTaskById(
        req.params.id,
        req.session.userId,
      );

      if (!task) {
        return res.status(404).send('Task not found');
      }

      return res.render('tasks/edit', {
        task,
        redirectTo: req.query.redirectTo || '/tasks/create',
      });
    } catch (err) {
      next(err);
    }
  }

  // =====================
  // UPDATE TASK
  // =====================
  async updateTask(req, res, next) {
    try {
      const { title, deadline, tags, description } = req.body;

      await taskService.updateTask(req.params.id, req.session.userId, {
        title,
        deadline,
        description,
        tags: Array.isArray(tags) ? tags : [tags],
      });

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
