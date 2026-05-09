const notificationService = require('../../services/notification.service');

class NotificationController {
  async index(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }
      const notification = await notificationService.getUserNotifications(
        req.session.userId,
      );
      return res.json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  }

  async unreadCount(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }
      const count = await notificationService.getUnreadCount(
        req.session.userId,
      );
      return res.json({
        success: true,
        data: { count },
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.session.userId,
      );
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      return res.json({
        success: true,
        message: 'Marked as read',
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }
      const notifications = await notificationService.markAllAsRead(
        req.session.userId,
      );
      return res.json({
        success: true,
        message: 'Marked All As read',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
