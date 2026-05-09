const express = require('express');
const router = express.Router();

const notificationController = require('../../app/controllers/api/NotificationController');

router.get('/', notificationController.index);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

module.exports = router;
