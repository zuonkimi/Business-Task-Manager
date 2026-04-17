const User = require('../models/User');
const bcrypt = require('bcrypt');

class AuthController {
  //Get login
  login(req, res) {
    res.render('auth/login', {
      layout: 'auth',
    });
  }
  //Post login
  async loginPost(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res.render('auth/login', {
          layout: 'auth',
          error: 'User not found',
        });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.send('Wrong password');

      req.session.userId = user._id;
      req.session.email = user.email;

      res.redirect('/home');
    } catch (err) {
      next(err);
    }
  }

  //Get register
  register(req, res) {
    res.render('auth/register', {
      layout: 'auth',
    });
  }
  //Post register
  async registerPost(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!password || password.length < 6) {
        return res.render('auth/register', {
          layout: 'auth',
          error: 'Password must be at least 6 characters!',
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.render('auth/register', {
          layout: 'auth',
          error: 'Email already exists!',
        });
      }
      await User.create({
        email,
        password: hashedPassword,
      });

      res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  }

  //Get logout
  logout(req, res, next) {
    req.session.destroy(err => {
      if (err) return next(err);

      res.clearCookie('connect.sid');
      return res.redirect('/auth/login');
    });
  }
}

module.exports = new AuthController();
