const userPageService = require('../../services/pageServices/users.pageService');

class UserController {
  async index(req, res, next) {
    try {
      const users = await userPageService.getUsersWithFollowState(
        req.session.userId,
      );
      return res.render('users/index', { users });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
