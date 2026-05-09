const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TAGS
const TASK_TAGS = [
  '安全書類',
  '請求書',
  '発注',
  '注文請書',
  'リモート',
  '領収書',
  '他',
];

// TASK SCHEMA
const TaskSchema = new Schema(
  {
    // BASIC INFO
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    // OWNER
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // STATUS
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending',
      index: true,
    },
    // DEADLINE
    deadline: {
      type: Date,
      default: null,
      index: true,
    },
    // TAGS
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: tags => tags.every(tag => TASK_TAGS.includes(tag)),
        message: 'Invalid tag detected',
      },
    },
    // SOFT DELETE
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    // SOCIAL
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    // FILES
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['image', 'pdf', 'file'],
          default: 'file',
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    // ANALYTICS
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
// INDEX
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ author: 1, createdAt: -1 });
TaskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
