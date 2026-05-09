const notificationService = require('../services/notification.service');

const notificationMiddleware = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return next();
    }
    const notifications = await notificationService.getUserNotifications(
      req.session.userId,
    );
    const unreadCount = await notificationService.getUnreadCount(
      req.session.userId,
    );
    res.locals.notifications = notifications.slice(0, 10);
    res.locals.unreadCount = unreadCount;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = notificationMiddleware;
