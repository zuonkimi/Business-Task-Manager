const express = require('express');
const router = express.Router();

const notificationController = require('../../app/controllers/web/NotificationController');

router.get('/', notificationController.index);
router.get('/:id/redirect', notificationController.redirect);
router.post('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
