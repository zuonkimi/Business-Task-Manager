const {
  getTrashTasks,
} = require('../services/controllersServices/task.service');

class MeController {
  async trashTasks(req, res, next) {
    try {
      const { tasks, isEmpty } = await getTrashTasks(req.session.userId);

      return res.render('me/trash-tasks', {
        tasks,
        isEmpty,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MeController();
