const Follow = require('../../models/Follow');

const followUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    throw new Error("Can't follow yourself");
  }
  return await Follow.create({
    follower: followerId,
    following: followingId,
  });
};

const unfollowUser = async (followerId, followingId) => {
  return await Follow.findOneAndDelete({
    follower: followerId,
    following: followingId,
  });
};

module.exports = {
  followUser,
  unfollowUser,
};
