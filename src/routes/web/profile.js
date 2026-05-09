const express = require('express');
const router = express.Router();
const authMiddleware = require('../../app/middlewares/auth');
const upload = require('../../app/middlewares/upload');
const profileController = require('../../app/controllers/web/ProfileController');

router.get('/:userId/edit', profileController.edit);
router.get('/:userId', profileController.show);
router.put(
  '/:userId',
  authMiddleware,
  upload.single('avatar'),
  profileController.update,
);

module.exports = router;
