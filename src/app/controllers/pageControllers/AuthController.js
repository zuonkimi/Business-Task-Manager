const authService = require('../../services/auth/auth.service');

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
      const user = await authService.login(req.body);
      req.session.userId = user._id;
      req.session.email = user.email;
      return res.redirect('/home');
    } catch (err) {
      return res.render('auth/login', {
        layout: 'auth',
        error: err.message,
      });
    }
  }

  //Get register
  register(req, res) {
    return res.render('auth/register', {
      layout: 'auth',
    });
  }

  // POST register
  async registerPost(req, res, next) {
    try {
      const user = await authService.register(req.body);
      req.session.userId = user._id;
      return res.redirect('/');
    } catch (err) {
      return res.render('auth/register', {
        layout: 'auth',
        error: err.message,
      });
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
