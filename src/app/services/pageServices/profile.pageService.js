const Task = require('../../models/Task');
const User = require('../../models/User');
const Follow = require('../../models/Follow');
const { buildQuery } = require('../layersServices/taskQueries');
// const { getUserTasks } = require('../layersServices/taskQueries');
const { enrichTasks } = require('../layersServices/taskServices');
const { isOwner } = require('../../utils/fileHelpers');

const getProfilePage = async (viewerId, profileUserId) => {
  //USER
  const user = await User.findById(profileUserId).lean();
  if (!user) return null;
  //POSTED TASKS
  const taskQuery = buildQuery(
    viewerId,
    {},
    {
      mode: 'profile',
      targetUserId: profileUserId,
    },
  );
  let tasks = await Task.find(taskQuery).sort({ createdAt: -1 }).lean();
  // let tasks = await getUserTasks(profileUserId);
  tasks = enrichTasks(tasks);
  //FOLLOW DATA
  const followers = await Follow.countDocuments({
    following: profileUserId,
  });
  const following = await Follow.countDocuments({
    follower: profileUserId,
  });
  const isFollowing = await Follow.exists({
    follower: viewerId,
    following: profileUserId,
  });
  //STATS
  const stats = {
    total: tasks.length,
    done: tasks.filter(task => task.status === 'done').length,
    followers,
    following,
  };
  //PERMISSION
  const isOwnerResult = isOwner(viewerId, profileUserId);
  return {
    user,
    posts: tasks,
    stats,
    isOwner: isOwnerResult,
    isFollowing: !!isFollowing,
  };
};

const getEditProfilePage = async (viewerId, userId) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  const isOwnerResult = isOwner(viewerId, userId);
  if (!isOwnerResult) return null;
  return user;
};

const updateProfilePage = async (viewerId, userId, body, file) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  const isOwnerResult = isOwner(viewerId, userId);
  if (!isOwnerResult) return null;
  const updateData = {
    name: body.name,
    bio: body.bio,
  };
  if (file) {
    updateData.avatar = '/uploads/' + file.filename;
  }
  await User.findByIdAndUpdate(userId, updateData);
  return true;
};

module.exports = {
  getProfilePage,
  getEditProfilePage,
  updateProfilePage,
};
