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
    password: {
      type: String,
      required: function () {
        return this.provider === 'local';
      },
    },
    name: { type: String, required: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    avatar: { type: String, default: '/uploads/defaultavt.jpg' },
    bio: { type: String, default: '', maxlength: 300 },
    provider: {
      type: String,
      enum: ['local', 'google', 'line', 'facebook'],
      default: 'local',
    },
    //social login ids
    googleId: String,
    lineId: String,
    facebookId: String,
    //local verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    //reset password
    resetPasswordToken: {
      type: String,
      default: null,
    },
    //set date limit
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);
