const taskService = require('../../services/controllersServices/task.service');
const taskPageService = require('../../services/pageServices/task.pageService');
const taskActionService = require('../../services/actions/tasksAction.service');
const { buildAttachments } = require('../../utils/fileHelpers');
const validatedBody = require('../../middlewares/validate');

class TaskController {
  async index(req, res, next) {
    try {
      const result = await taskPageService.getTasksPage(
        req.session.userId,
        req.query,
      );
      return res.render('tasks/list', {
        tasks: result.tasks,
        activeFilter: result.filters,
        pagination: result.pagination,
        currentUrl: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleLike(req, res, next) {
    try {
      const result = await taskActionService.toggleLike(
        req.params.id,
        req.session.userId,
      );
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await taskPageService.getCreatePageData(
        req.session.userId,
      );
      return res.render('tasks/create', {
        tasks: result.tasks,
        emptyMessage: result.emptyMessage,
      });
    } catch (err) {
      next(err);
    }
  }

  async store(req, res, next) {
    try {
      const data = req.validatedBody || req.body;
      const { title, status, deadline, tags, description } = data;
      const files = req.files || [];
      const attachments = buildAttachments(req.files);
      await taskService.createTask(req.session.userId, {
        title,
        status,
        deadline: deadline ? new Date(deadline) : null,
        description,
        tags: Array.isArray(tags) ? tags : [tags],
        attachments,
      });
      return res.redirect('/tasks');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.session.userId);
      return res.redirect('/tasks');
    } catch (err) {
      next(err);
    }
  }

  async restore(req, res, next) {
    await taskService.restoreTask(req.params.id, req.session.userId);
    return res.redirect('/me/trash-tasks');
  }

  async forceDelete(req, res, next) {
    await taskService.forceDeleteTask(req.params.id, req.session.userId);
    return res.redirect('/me/trash-tasks');
  }

  async updateStatus(req, res, next) {
    await taskService.toggleStatus(req.params.id, req.session.userId);
    const redirectUrl = req.get('Referer') || '/tasks';
    return res.redirect(redirectUrl);
  }

  async edit(req, res, next) {
    const task = await taskService.getTaskById(
      req.params.id,
      req.session.userId,
    );
    if (!task) return res.status(404).send('Task not found');
    return res.render('tasks/edit', {
      task,
      redirectTo: '/tasks',
    });
  }

  async updateTask(req, res, next) {
    try {
      const { title, deadline, tags, description } = req.body;
      const files = req.files || [];
      const attachments = buildAttachments(req.files);
      const updateData = {
        title,
        description,
        tags: Array.isArray(tags) ? tags : [tags],
      };
      if (deadline) updateData.deadline = new Date(deadline);
      if (attachments.length > 0) updateData.attachments = attachments;
      await taskService.updateTask(
        req.params.id,
        req.session.userId,
        updateData,
      );
      return res.redirect('/tasks');
    } catch (err) {
      next(err);
    }
  }

  async showDetail(req, res, next) {
    try {
      const task = await taskService.getDetail(
        req.params.id,
        req.session.userId,
      );
      if (!task) {
        return res.redirect('/tasks');
      }
      return res.render('tasks/detail', { task });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
