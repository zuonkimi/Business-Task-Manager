const userService = require('../../services/pageServices/users.pasgeService');

class UserController {
  async index(req, res, next) {
    try {
      const users = await userService.getUsersWithFollowState(
        req.session.userId,
      );
      return res.render('users/index', { users });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
