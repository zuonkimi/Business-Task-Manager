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
      // const { email, password } = req.body;
      const email = req.body.email?.trim();
      const password = req.body.password?.trim();
      // validate email and password
      if (!email || !password) {
        return res.render('auth/login', {
          layout: 'auth',
          error: 'Email and password are required!',
        });
      }

      const user = await User.findOne({ email });
      const isValid = user && (await bcrypt.compare(password, user.password));
      //validate user and password matched
      if (!isValid) {
        return res.render('auth/login', {
          layout: 'auth',
          error: 'Invalid email or password!',
        });
      }

      req.session.userId = user._id;
      req.session.email = user.email;

      return res.redirect('/home');
    } catch (err) {
      next(err);
    }
  }

  //Get register
  register(req, res) {
    return res.render('auth/register', {
      layout: 'auth',
    });
  }
  //Post register
  async registerPost(req, res, next) {
    try {
      const email = req.body.email?.trim();
      const password = req.body.password?.trim();
      // Validate password
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.render('auth/register', {
          layout: 'auth',
          error:
            'Password must be at least 8 characters and include uppercase, lowercase, number, and special character!',
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

      return res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  }

  //Get logout
  logout(req, res, next) {
    req.session.destroy(err => {
      if (err) return next(err);

      res.clearCookie('connect.sid');
      return res.redirect(303, '/auth/login');
    });
  }
}

module.exports = new AuthController();
