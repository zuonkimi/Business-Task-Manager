const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TASK_TAGS = [
  '安全書類',
  '請求書',
  '発注',
  '注文請書',
  'リモート',
  '領収書',
  '他',
];
const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending',
    },
    deadline: Date,
    tags: [
      {
        type: [String],
        enum: TASK_TAGS,
      },
    ],
    deleted: { type: Boolean, default: false },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

TaskSchema.index({ userId: 1, deleted: 1 });
TaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', TaskSchema);
