// DB and Redis
const { client, connectRedis } = require('./redisClient');
const Task = require('../../models/Task');

// create time-to-life for cache
const CACHE_TTL = 60;

// Get cached tasks
const getUserTasksCached = async userId => {
  await connectRedis();
  // create user cache key
  const key = `tasks:${userId}`;

  try {
    const cached = await client.get(key);

    // If cache has data -> return it as JSON no query DB
    if (cached) return JSON.parse(cached);

    // If no cache -> query DB
    const tasks = await Task.find({
      userId,
      deleted: false,
    }) // user tasks and not deleted tasks
      .sort({ createdAt: -1 }) // sort by created time new -> old
      .lean();

    // save data to redis with cache time and covert to string
    await client.setEx(key, CACHE_TTL, JSON.stringify(tasks));

    return tasks;
  } catch (err) {
    console.error('Cache error:', err);
    // handle fallback when error -> query DB
    return Task.find({
      userId,
      deleted: false,
    }).lean();
  }
};

module.exports = {
  getUserTasksCached,
};
