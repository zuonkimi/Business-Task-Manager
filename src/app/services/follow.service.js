const Follow = require('../models/Follow');
const notificationService = require('./notification.service');

class FollowService {
  async followUser(followerId, followingId) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    const exitingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (exitingFollow) {
      return exitingFollow;
    }
    const follow = await Follow.create({
      follower: followerId,
      following: followingId,
    });
    await notificationService.createNotification({
      recipient: followingId,
      sender: followerId,
      type: 'follow',
    });
    return follow;
  }

  async unfollowUser(followerId, followingId) {
    return await Follow.deleteOne({
      follower: followerId,
      following: followingId,
    });
  }

  async getFollowingIds(userId) {
    const follows = await Follow.find({ follower: userId })
      .select('following')
      .lean();
    return follows.map(f => f.following);
  }
}

module.exports = new FollowService();
