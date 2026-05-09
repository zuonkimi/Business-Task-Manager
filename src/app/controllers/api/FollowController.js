const followService = require('../../services/follow.service');

class FollowController {
  async followUser(req, res, next) {
    try {
      await followService.followUser(req.session.userId, req.params.userId);
      return res.json({ message: 'Followed', following: true });
    } catch (err) {
      next(err);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      await followService.unfollowUser(req.session.userId, req.params.userId);
      return res.json({ message: 'Unfollowed', following: false });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FollowController();
