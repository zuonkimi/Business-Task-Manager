const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, unique: true },
    avatar: { type: String, default: '/uploads/defaultavt.jpg' },
    bio: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);
