const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const mailService = require('./mail.service');

class AuthService {
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required!');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password!');
    }
    if (!user.isVerified) {
      throw new Error('Please verify your email first!');
    }
    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      throw new Error('Invalid email or password!');
    }
    return user;
  }

  async register({ name, username, email, password }) {
    // CREATE TOKEN
    const verificationToken = crypto.randomBytes(32).toString('hex');
    if (!name || !username || !email || !password) {
      throw new Error('Please fill all fields!');
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        'Password must be at least 8 chars + uppercase + lowercase + number + special char',
      );
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('Email already exists!');
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('Username already taken!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      verificationToken, //save Token in DB
    });
    await mailService.sendVerificationEmail(user.email, verificationToken);
    return user;
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      verificationToken: token,
    });
    if (!user) {
      throw new Error('Invalid token');
    }
    if (user.isVerified) {
      throw new Error('Email already verified');
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email not found');
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    await user.save();
    const resetUrl = `http://localhost:9999/auth/reset-password?token=${token}`;
    return mailService.sendResetPasswordEmail(email, resetUrl);
  }

  async resetPassword({ token, password }) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error('Invalid for expired token');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  }
}

module.exports = new AuthService();
