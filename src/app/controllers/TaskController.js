const Task = require('../models/Task');
const taskService = require('../services/controllersServices/task.service');
const taskQueries = require('../services/layersServices/taskQueries');
const {
  enrichTasks,
  getEmptyMessage,
} = require('../services/layersServices/taskServices');

class TaskController {
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const tasks = await taskQueries.getUserTasksPaginated(
        req.session.userId,
        skip,
        limit,
      );

      const total = await taskQueries.countUserTasks(req.session.userId);

      return res.render('tasks/index', {
        tasks,
        pagination: {
          page,
          total,
          limit,
        },
        currentUrl: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const tasks = await taskQueries.getUserTasks(req.session.userId);

      const filter = req.query.filter || 'all';
      const enrichedTasks = enrichTasks(tasks);

      return res.render('tasks/create', {
        tasks: enrichedTasks,
        emptyMessage: getEmptyMessage(filter),
        currentUrl: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

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

  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.session.userId);

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  async restore(req, res, next) {
    try {
      await taskService.restoreTask(req.params.id, req.session.userId);

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  async forceDelete(req, res, next) {
    try {
      await taskService.forceDeleteTask(req.params.id, req.session.userId);

      return res.redirect(req.body.redirectTo || '/tasks/create');
    } catch (err) {
      next(err);
    }
  }

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

  async edit(req, res, next) {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.session.userId,
      }).lean();

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
