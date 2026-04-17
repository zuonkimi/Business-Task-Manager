const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    tags: {
      type: [String],
      enum: [
        '安全書類',
        '請求書',
        '発注',
        '注文請書',
        'リモート',
        '領収書',
        '他',
      ],
    },
    description: String,
    deleted: { type: Boolean, default: false },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Task', TaskSchema);
