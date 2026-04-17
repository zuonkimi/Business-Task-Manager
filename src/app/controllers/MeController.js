const Task = require('../models/Task');
const { enrichTasks } = require('../services/taskServices');

class MeController {
  async trashTasks(req, res, next) {
    try {
      const tasks = await Task.find({
        deleted: true,
        userId: req.session.userId,
      }).lean();
      const tasksWithStatus = enrichTasks(tasks);

      res.render('me/trash-tasks', { tasks: tasksWithStatus });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MeController();
