const { google } = require('googleapis');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');
const oauth2Client = require('../../config/googleOAuth');
const User = require('../models/User');
const mailService = require('./mail.service');

class AuthService {
  // LOGIN
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    // SOCIAL ACCOUNT
    if (!user.password) {
      throw new Error('Please login with Google');
    }
    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }
    return user;
  }

  // REGISTER
  async register({ name, username, email, password }) {
    if (!name || !username || !email || !password) {
      throw new Error('Please fill all fields');
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
      throw new Error('Email already exists');
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('Username already taken');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      verificationToken,
    });
    await mailService.sendVerificationEmail(user.email, verificationToken);
    return user;
  }

  // VERIFY EMAIL
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

  // FORGOT PASSWORD
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
    await mailService.sendResetPasswordEmail(email, resetUrl);
  }

  // RESET PASSWORD
  async resetPassword({ token, password }) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        'Password must be at least 8 chars + uppercase + lowercase + number + special char',
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  }

  // GOOGLE AUTH URL
  async getGoogleAuthUrl(state) {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      state,
      prompt: 'select_account consent',
    });
  }

  // GOOGLE CALLBACK
  async googleLoginCallback(code) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const { data } = await oauth2.userinfo.get();
    let user = await User.findOne({
      email: data.email,
    });
    // CREATE USER
    if (!user) {
      const baseUsername = data.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }
      user = await User.create({
        name: data.name,
        username,
        email: data.email,
        avatar: data.picture,
        provider: 'google',
        googleId: data.id,
        isVerified: true,
      });
    }
    // LINK GOOGLE
    if (!user.googleId) {
      user.googleId = data.id;
      user.provider = 'google';
      await user.save();
    }
    return user;
  }

  //FACEBOOK AUTH URL
  async getFacebookAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URL,
      scope: 'email,public_profile',
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v25.0/dialog/oauth?${params}`;
  }

  //FACEBOOK CALLBACK
  async facebookLoginCallback(code) {
    //get access token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v25.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URL,
          code,
        },
      },
    );
    const accessToken = tokenResponse.data.access_token;
    //get user info
    const userResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id, name, email,picture',
        access_token: accessToken,
      },
    });
    const data = userResponse.data;
    //email check
    if (!data.email) {
      throw new Error('Facebook account has no email');
    }
    let user = await User.findOne({
      email: data.email,
    });
    if (!user) {
      const baseUsername = data.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }
      user = await User.create({
        name: data.name,
        username,
        email: data.email,
        avatar: data.picture?.data?.url,
        provider: 'facebook',
        facebookId: data.id,
        isVerified: true,
      });
    }
    //link facebook
    if (!user.facebookId) {
      ((user.facebookId = data.id), (user.provider = 'facebook'));
      await user.save();
    }
    return user;
  }

  async getLineAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.LINE_CHANNEL_ID,
      redirect_uri: process.env.LINE_REDIRECT_URL,
      scope: 'profile openid email',
      response_type: 'code',
      state,
    });
    return `https://access.line.me/oauth2/v2.1/authorize?${params}`;
  }

  async lineLoginCallback(code) {
    //get access token
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.LINE_CHANNEL_ID,
        client_secret: process.env.LINE_CHANNEL_SECRET,
        redirect_uri: process.env.LINE_REDIRECT_URL,
        code,
      }).toString(),
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const accessToken = tokenResponse.data.access_token;
    //get user info
    const userResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = userResponse.data;
    //get email from ID token
    let email = null;
    try {
      const idToken = tokenResponse.data.id_token;
      const verifyResponse = await axios.post(
        'https://api.line.me/oauth2/v2.1/verify',
        new URLSearchParams({
          id_token: idToken,
          client_id: process.env.LINE_CHANNEL_ID,
        }).toString(),
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
        },
      );
      email = verifyResponse.data.email || null;
    } catch (err) {
      console.log('LINE email not available');
    }
    let user = await User.findOne({
      lineId: data.userId,
    });
    if (!user && email) {
      user = await User.findOne({
        email,
      });
    }
    if (!user) {
      const finalEmail = email || `${data.userId}@line.local`;
      const baseUsername = finalEmail.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }
      user = await User.create({
        name: data.displayName,
        username,
        email: finalEmail,
        avatar: data.pictureUrl,
        provider: 'line',
        lineId: data.userId,
        isVerified: true,
      });
    }
    //link line
    if (!user.lineId) {
      user.lineId = data.userId;
      await user.save();
    }
    return user;
  }
}

module.exports = new AuthService();
