const Task = require('../models/Task');
const { enrichTasks, getEmptyMessage } = require('../services/taskServices');

class TaskController {
  async create(req, res, next) {
    try {
      const filter = req.query.filter || 'all';
      const tasks = await Task.find({
        deleted: false,
        userId: req.session.userId,
      })
        .sort({ createdAt: -1 })
        .lean();

      const tasksWithStatus = enrichTasks(tasks);
      const emptyMessage = getEmptyMessage(filter);

      res.render('tasks/create', { tasks: tasksWithStatus, emptyMessage });
    } catch (err) {
      next(err);
    }
  }

  // Move in trash
  async delete(req, res, next) {
    try {
      await Task.updateOne(
        { _id: req.params.id, userId: req.session.userId },
        { deleted: true },
      );
      res.redirect(req.headers.referer || 'back');
    } catch (err) {
      next(err);
    }
  }
  // Restore deleted task
  async restore(req, res, next) {
    try {
      await Task.updateOne(
        { _id: req.params.id, userId: req.session.userId },
        { deleted: false },
      );

      res.redirect(req.headers.referer || 'back');
    } catch (err) {
      next(err);
    }
  }
  // Force delete
  async forceDelete(req, res, next) {
    try {
      await Task.findByIdAndDelete(req.params.id, {
        userId: req.session.userId,
      });

      res.redirect(req.headers.referer || 'back');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const task = await Task.findById(req.params.id);
      const newStatus = task.status === 'done' ? 'pending' : 'done';

      await Task.updateOne(
        { _id: req.params.id, userId: req.session.userId },
        { status: newStatus },
      );

      res.redirect(req.headers.referer || 'back');
    } catch (err) {
      next(err);
    }
  }

  async edit(req, res, next) {
    try {
      const task = await Task.findById(req.params.id).lean();

      res.render('tasks/edit', { task });
    } catch (err) {
      next(err);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { title, deadline, tags, description } = req.body;
      await Task.updateOne(
        { _id: req.params.id },
        {
          title,
          deadline,
          description,
          tags: [tags],
          userId: req.session.userId,
        },
      );

      res.redirect('/tasks/create');
    } catch (err) {
      next(err);
    }
  }

  async store(req, res, next) {
    try {
      const { title, status, deadline, tags, description } = req.body;

      const task = new Task({
        title,
        status,
        deadline,
        tags: [tags],
        description,
        deleted: false,
        userId: req.session.userId,
      });

      await task.save();

      res.redirect(req.headers.referer || 'back');
    } catch (err) {
      next();
    }
  }
}

module.exports = new TaskController();
