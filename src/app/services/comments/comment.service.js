const Comment = require('../../models/Comment');
const mongoose = require('mongoose');

// CREATE COMMENT
const createComment = async ({ taskId, userId, content }) => {
  const comment = await Comment.create({
    taskId: new mongoose.Types.ObjectId(taskId),
    user: userId,
    content,
  });
  await comment.populate({
    path: 'user',
    select: 'name avatar',
  });
  return comment;
};

// GET COMMENTS
const getCommentByTaskId = async taskId => {
  return Comment.find({
    taskId: new mongoose.Types.ObjectId(taskId),
    isDeleted: false,
  })
    .populate({
      path: 'user',
      select: 'name avatar',
    })
    .sort({ createdAt: 1 })
    .lean();
};

// LIKE COMMENT
const toggleLikeComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  const isLiked = comment.likes.some(id => id.toString() === userId.toString());
  if (isLiked) {
    comment.likes = comment.likes.filter(
      id => id.toString() !== userId.toString(),
    );
    comment.likeCount = Math.max(0, comment.likeCount - 1);
  } else {
    comment.likes.push(userId);
    comment.likeCount += 1;
  }
  await comment.save();
  return {
    liked: !isLiked,
    likeCount: comment.likeCount,
  };
};

// REPLY COMMENT
const replyComment = async ({ taskId, userId, content, parentId }) => {
  const comment = await Comment.create({
    taskId: new mongoose.Types.ObjectId(taskId),
    user: userId,
    content,
    parentId: parentId || null,
  });
  await comment.populate({
    path: 'user',
    select: 'name avatar',
  });
  return comment;
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });
  if (!comment) throw new Error('Comment not found');
  if (comment.user.toString() !== userId.toString()) {
    throw new Error('No permission to delete comment');
  }
  await Comment.updateOne({ _id: commentId }, { $set: { isDeleted: true } });
  return true;
};

module.exports = {
  createComment,
  getCommentByTaskId,
  toggleLikeComment,
  replyComment,
  deleteComment,
};
