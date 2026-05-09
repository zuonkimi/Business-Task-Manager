const Follow = require('../models/Follow');

class FollowService {
  async followUser(followerId, followingId) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    return await Follow.findOneAndUpdate(
      { follower: followerId, following: followingId },
      { follower: followerId, following: followingId },
      { upsert: true, new: true },
    );
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
