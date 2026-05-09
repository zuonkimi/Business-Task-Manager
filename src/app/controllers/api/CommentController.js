const commentService = require('../../services/comment.service');

class CommentController {
  async create(req, res, next) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'No user' });
      }
      const { taskId, content, parentId } = req.body;
      if (!taskId) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing taskId' });
      }
      const comment = await commentService.createComment({
        taskId,
        userId: req.session.userId,
        content,
        parentId,
      });
      return res.json({ success: true, comment });
    } catch (err) {
      next(err);
    }
  }

  async toggleLikeComment(req, res, next) {
    try {
      const result = await commentService.toggleLikeComment(
        req.params.id,
        req.session.userId,
      );
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await commentService.deleteComment(req.params.id, req.session.userId);
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommentController();
