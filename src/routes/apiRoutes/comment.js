const express = require('express');
const router = express.Router();

const commentController = require('../../app/controllers/apiControllers/CommentController');

router.post('/', commentController.create);
router.post('/:id/like', commentController.toggleLikeComment);
router.post('/:id/reply', commentController.reply);
router.delete('/:id', commentController.delete);

module.exports = router;
