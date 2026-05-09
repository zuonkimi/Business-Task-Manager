const taskService = require('../../services/task.service');
const commentService = require('../../services/comment.service');
const { buildAttachments } = require('../../utils/fileHelpers');

class TaskController {
  async index(req, res, next) {
    try {
      const result = await taskService.getTasksPage(
        req.session.userId,
        req.query,
      );
      return res.render('pages/tasks/list', {
        tasks: result.tasks,
        activeFilter: result.filters,
        pagination: result.pagination,
        currentUrl: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  // Like Task
  async toggleLike(req, res, next) {
    try {
      const result = await taskService.toggleLike(
        req.params.id,
        req.session.userId,
      );
      return res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  // Trang tạo Task
  async create(req, res, next) {
    try {
      const result = await taskService.getHomePageData(req.session.userId);
      return res.render('pages/tasks/create', {
        tasks: result.tasks,
      });
    } catch (err) {
      next(err);
    }
  }

  // Lưu Task mới
  async store(req, res, next) {
    try {
      const data = req.validatedBody || req.body;
      const attachments = buildAttachments(req.files);
      await taskService.createTask(req.session.userId, {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        tags: Array.isArray(data.tags)
          ? data.tags
          : [data.tags].filter(Boolean),
        attachments,
      });
      return res.redirect('/tasks');
    } catch (err) {
      next(err);
    }
  }

  // Xóa mềm (vào thùng rác)
  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.session.userId, true);
      return res.redirect('/tasks');
    } catch (err) {
      next(err);
    }
  }

  // Khôi phục từ thùng rác
  async restore(req, res, next) {
    try {
      await taskService.restoreTask(req.params.id, req.session.userId);
      return res.redirect('pages/me/trash-tasks');
    } catch (err) {
      next(err);
    }
  }

  // Xóa vĩnh viễn
  async forceDelete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.session.userId, false);
      return res.redirect('pages/me/trash-tasks');
    } catch (err) {
      next(err);
    }
  }

  // Đổi trạng thái Done/Pending
  async updateStatus(req, res, next) {
    try {
      await taskService.toggleStatus(req.params.id, req.session.userId);
      const redirectUrl = req.get('Referer') || '/tasks';
      return res.redirect(redirectUrl);
    } catch (err) {
      next(err);
    }
  }

  // Trang chỉnh sửa
  async edit(req, res, next) {
    try {
      const task = await taskService.getDetail(
        req.params.id,
        req.session.userId,
      );
      if (!task) return res.status(404).send('Task not found');
      return res.render('pages/tasks/edit', {
        task,
        redirectTo: '/tasks',
      });
    } catch (err) {
      next(err);
    }
  }

  // Cập nhật Task
  async updateTask(req, res, next) {
    try {
      const data = req.body;
      const attachments = buildAttachments(req.files);

      const updateData = {
        title: data.title,
        description: data.description,
        tags: Array.isArray(data.tags)
          ? data.tags
          : [data.tags].filter(Boolean),
      };
      if (data.deadline) updateData.deadline = new Date(data.deadline);
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

  // Xem chi tiết Task và Comment
  async showDetail(req, res, next) {
    try {
      const task = await taskService.getDetail(
        req.params.id,
        req.session.userId,
      );
      if (!task) return res.redirect('/tasks');
      const comments = await commentService.getCommentByTaskId(req.params.id);
      return res.render('pages/tasks/detail', { task, comments });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
