const taskService = require('../../services/task.service');

class MeController {
  async trashTasks(req, res, next) {
    try {
      const result = await taskService.getTrashPageData(req.session.userId);
      return res.render('pages/me/trash-tasks', {
        tasks: result.tasks,
        isEmpty: result.isEmpty,
        stats: result.stats,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MeController();
