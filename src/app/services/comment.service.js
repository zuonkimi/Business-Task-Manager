const Comment = require('../models/Comment');
const Task = require('../models/Task');
const notificationService = require('./notification.service');

class CommentService {
  async createComment({ taskId, userId, content, parentId = null }) {
    const comment = await Comment.create({
      taskId,
      user: userId,
      content,
      parentId,
    });
    //notification
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment) {
        await notificationService.createNotification({
          recipient: parentComment.user,
          sender: userId,
          type: 'reply',
          task: taskId,
          comment: parentComment._id,
        });
      }
    } else {
      const task = await Task.findById(taskId);
      if (task) {
        await notificationService.createNotification({
          recipient: task.author,
          sender: userId,
          type: 'comment',
          task: taskId,
        });
      }
    }
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar')
      .lean();
    return {
      ...populatedComment,
      parentId: populatedComment.parentId
        ? String(populatedComment.parentId)
        : null,
    };
  }

  async getCommentByTaskId(taskId) {
    const comments = await Comment.find({
      taskId,
      isDeleted: false,
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    // comment cha
    const rootComments = comments.filter(comment => !comment.parentId);
    // reply
    const replies = comments.filter(comment => comment.parentId);
    // gắn reply vào cha
    const replyMap = {};
    replies.forEach(reply => {
      const parentId = String(reply.parentId);
      if (!replyMap[parentId]) {
        replyMap[parentId] = [];
      }
      replyMap[parentId].push(reply);
    });
    rootComments.forEach(comment => {
      comment.replies = replyMap[String(comment._id)] || [];
    });
    return rootComments;
  }

  async toggleLikeComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');
    const isLiked = comment.likes.some(
      id => id.toString() === userId.toString(),
    );
    if (isLiked) {
      comment.likes = comment.likes.filter(
        id => id.toString() !== userId.toString(),
      );
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
      await notificationService.createNotification({
        recipient: comment.user,
        sender: userId,
        type: 'like_comment',
        task: comment.taskId,
        comment: comment._id,
      });
    }
    await comment.save();
    return { liked: !isLiked, likeCount: comment.likeCount };
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');
    // Chỉ cho phép xóa comment của chính mình
    if (String(comment.user) !== String(userId)) {
      throw new Error('You can only delete your own comment');
    }
    return await Comment.updateOne({ _id: commentId }, { isDeleted: true });
  }
}

module.exports = new CommentService();
