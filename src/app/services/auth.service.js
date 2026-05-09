const User = require('../models/User');
const bcrypt = require('bcrypt');

class AuthService {
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required!');
    }
    const user = await User.findOne({ email });
    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      throw new Error('Invalid email or password!');
    }
    return user;
  }

  async register({ name, username, email, password }) {
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
    });
    return user;
  }
}

module.exports = new AuthService();
