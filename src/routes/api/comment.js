const express = require('express');
const router = express.Router();

const commentController = require('../../app/controllers/api/CommentController');

router.post('/', commentController.create);
router.post('/:id/like', commentController.toggleLikeComment);
router.delete('/:id', commentController.delete);

module.exports = router;
