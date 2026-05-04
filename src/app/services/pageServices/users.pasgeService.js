const User = require('../../models/User');
const Follow = require('../../models/Follow');

const getUsersWithFollowState = async currentUserId => {
  const users = await User.find({
    _id: { $ne: currentUserId },
  }).lean();
  const following = await Follow.find({
    follower: currentUserId,
  }).lean();
  const followingIds = following.map(follow => follow.following.toString());
  return users.map(user => ({
    ...user,
    name: user.name || user.username || user.email,
    isFollowing: followingIds.includes(user._id.toString()),
  }));
};

module.exports = {
  getUsersWithFollowState,
};
