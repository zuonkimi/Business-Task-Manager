const express = require('express');
const router = express.Router();

const followController = require('../../app/controllers/api/FollowController');

router.post('/:userId', followController.followUser);
router.delete('/:userId', followController.unfollowUser);

module.exports = router;
