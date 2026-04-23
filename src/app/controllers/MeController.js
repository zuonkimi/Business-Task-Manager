const taskPageService = require('../services/pageServices/task.pageService');

class MeController {
  async trashTasks(req, res, next) {
    try {
      const result = await taskPageService.getTrashPageData(req.session.userId);

      return res.render('me/trash-tasks', {
        tasks: result.tasks,
        isEmpty: result.isEmpty,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MeController();
