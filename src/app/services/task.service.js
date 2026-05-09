const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const notificationService = require('./notification.service');
const { client, connectRedis, safeDel } = require('./redis.service');

const CACHE_TTL = 60;
const enrichTasks = async (tasks, userId) => {
  const now = Date.now();
  const DAY = 1000 * 60 * 60 * 24;
  const commentCounts = await Comment.aggregate([
    {
      $match: {
        isDeleted: false,
        taskId: { $ne: null },
        parentId: null,
      },
    },
    {
      $group: {
        _id: '$taskId',
        count: { $sum: 1 },
      },
    },
  ]);
  const commentMap = {};
  commentCounts.forEach(item => {
    if (item?._id) commentMap[String(item._id)] = item.count;
  });
  return tasks.map(task => {
    const obj = task.toObject ? task.toObject() : task;
    const deadline = obj.deadline ? new Date(obj.deadline).getTime() : null;
    return {
      ...obj,
      isOverdue: deadline && deadline < now && obj.status !== 'done',
      isSoon:
        deadline &&
        deadline > now &&
        (deadline - now) / DAY <= 3 &&
        obj.status !== 'done',
      isLiked:
        userId &&
        Array.isArray(obj.likes) &&
        obj.likes.some(id => String(id) === String(userId)),
      commentCount: commentMap[String(obj._id)] || 0,
    };
  });
};

const buildQuery = (viewerId, filters = {}, options = {}) => {
  const keyword = filters.keyword;
  let status = filters.status || filters.filter; // ← Fix quan trọng: hỗ trợ cả ?status= và ?filter=
  const tags = filters.tags;
  const { mode = 'myPosts', targetUserId, followingIds = [] } = options;
  const query = { deleted: mode === 'trash' };
  // GLOBAL SEARCH
  const trimmedKeyword = keyword ? keyword.toString().trim() : '';
  const meaningfulKeyword = trimmedKeyword
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
  if (meaningfulKeyword.length >= 2) {
    const safeKeyword = trimmedKeyword;
    query.$or = [
      { title: { $regex: safeKeyword, $options: 'i' } },
      { description: { $regex: safeKeyword, $options: 'i' } },
      { tags: { $regex: safeKeyword, $options: 'i' } },
    ];
    return query;
  }

  // NORMAL MODE
  if (mode === 'profile' && targetUserId) {
    query.author = targetUserId;
  } else if (mode === 'feed') {
    query.author = { $in: [viewerId, ...followingIds] };
  } else if (mode === 'trash') {
    query.author = viewerId;
    query.deleted = true;
  } else {
    query.author = viewerId;
  }

  // STATUS FILTER
  if (status) {
    if (['overdue', 'soon'].includes(status)) {
      // Những cái này là computed field → sẽ filter sau khi enrich
      // Không set vào Mongo query
    } else if (status === 'done' || status === 'pending') {
      query.status = status;
    }
  }

  // TAGS FILTER
  if (tags) {
    const tagArray = [].concat(tags).filter(Boolean);
    if (tagArray.length) {
      query.tags = { $in: tagArray };
    }
  }
  return query;
};

class TaskService {
  // CRUD
  async createTask(userId, data) {
    const task = await Task.create({ ...data, author: userId, deleted: false });
    await safeDel(`tasks:${userId}`);
    //notification
    const followers = await Follow.find({
      following: userId,
    }).select('follower');
    for (const follow of followers) {
      await notificationService.createNotification({
        recipient: follow.follower,
        sender: userId,
        type: 'new_task',
        task: task._id,
      });
    }
    return task;
  }

  async updateTask(taskId, userId, data) {
    const result = await Task.updateOne({ _id: taskId, author: userId }, data);
    await safeDel(`tasks:${userId}`);
    return result.modifiedCount > 0;
  }

  async deleteTask(taskId, userId, soft = true) {
    if (soft) {
      await Task.updateOne({ _id: taskId, author: userId }, { deleted: true });
    } else {
      await Task.deleteOne({ _id: taskId, author: userId });
    }
    await safeDel(`tasks:${userId}`);
  }

  async restoreTask(taskId, userId) {
    await Task.updateOne({ _id: taskId, author: userId }, { deleted: false });
    await safeDel(`tasks:${userId}`);
  }

  async toggleStatus(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, author: userId });
    if (!task) return null;
    task.status = task.status === 'done' ? 'pending' : 'done';
    await task.save();
    await safeDel(`tasks:${userId}`);
    return task.status;
  }

  async toggleLike(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isLiked = task.likes.some(id => id.toString() === userId.toString());
    if (isLiked) {
      task.likes = task.likes.filter(id => id.toString() !== userId.toString());
      task.likeCount = Math.max(0, task.likeCount - 1);
    } else {
      task.likes.push(userId);
      task.likeCount += 1;
      await notificationService.createNotification({
        recipient: task.author,
        sender: userId,
        type: 'like_task',
        task: task._id,
      });
    }
    await task.save();
    return { liked: !isLiked, likeCount: task.likeCount };
  }

  // PAGE & QUERY
  async getTasksPage(userId, filters = {}, mode = 'myPosts') {
    let options = { mode };
    if (mode === 'profile') {
      options.targetUserId = userId;
    }
    const query = buildQuery(userId, filters, options);
    const tasks = await Task.find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .lean();
    let enriched = await enrichTasks(tasks, userId);
    // Filter computed status (overdue, soon)
    const statusFilter = filters.status || filters.filter;
    if (statusFilter === 'overdue') {
      enriched = enriched.filter(t => t.isOverdue);
    } else if (statusFilter === 'soon') {
      enriched = enriched.filter(t => t.isSoon);
    }
    return {
      tasks: enriched,
      filters,
    };
  }

  async getHomePageData(userId) {
    await connectRedis();
    const followingIds = await this.getFollowingIds(userId);
    const visibleUserIds = [userId, ...followingIds];
    const query = buildQuery(userId, {}, { mode: 'feed', followingIds });
    const tasks = await Task.find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .lean();
    const enriched = await enrichTasks(tasks, userId);
    const allTasks = await Task.find({
      author: { $in: visibleUserIds },
      deleted: false,
    }).lean();
    const enrichedStatsTasks = await enrichTasks(allTasks, userId);
    const stats = {
      total: enrichedStatsTasks.length,
      done: enrichedStatsTasks.filter(task => task.status === 'done').length,
      overdue: enrichedStatsTasks.filter(task => task.isOverdue).length,
      soon: enrichedStatsTasks.filter(task => task.isSoon).length,
      trash: await Task.countDocuments({
        author: { $in: visibleUserIds },
        deleted: true,
      }),
    };
    return { tasks: enriched, stats };
  }

  async getTrashPageData(userId) {
    const tasks = await Task.find({ author: userId, deleted: true })
      .populate('author')
      .sort({ updatedAt: -1 })
      .lean();
    const homeData = await this.getHomePageData(userId);
    return {
      tasks: await enrichTasks(tasks, userId),
      isEmpty: tasks.length === 0,
      stats: homeData.stats,
    };
  }

  async getDetail(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, deleted: false })
      .populate('author')
      .lean();
    if (!task) return null;
    return (await enrichTasks([task], userId))[0];
  }

  // Helper
  async getFollowingIds(userId) {
    const follows = await Follow.find({ follower: userId })
      .select('following')
      .lean();
    return follows.map(f => f.following);
  }
}

module.exports = new TaskService();
