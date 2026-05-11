const authService = require('../../services/auth.service');

class AuthController {
  //Get login
  login(req, res) {
    res.render('pages/auth/login', {
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
      return res.render('pages/auth/login', {
        layout: 'auth',
        error: err.message,
      });
    }
  }

  //Get register
  register(req, res) {
    return res.render('pages/auth/register', {
      layout: 'auth',
    });
  }

  // POST register
  async registerPost(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return res.render('pages/auth/check-email', {
        layout: 'auth',
        email: user.email,
      });
    } catch (err) {
      return res.render('pages/auth/register', {
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

  //Verify email
  async verifyEmail(req, res, next) {
    try {
      await authService.verifyEmail(req.query.token);
      return res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  }

  //Forgot password
  async forgotPassword(req, res, next) {
    try {
      res.render('pages/auth/forgot-password', {
        layout: 'auth',
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPasswordPost(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      return res.render('pages/auth/forgot-password', {
        layout: 'auth',
        success: 'Check your email for reset link',
      });
    } catch (err) {
      return res.render('pages/auth/forget-password', {
        layout: 'auth',
        error: err.message,
      });
    }
  }

  //Reset password/email
  async resetPassword(req, res, next) {
    try {
      return res.render('pages/auth/reset-password', {
        layout: 'auth',
        token: req.query.token,
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPasswordPost(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      return res.redirect('/auth/login');
    } catch (err) {
      return res.render('pages/auth/reset-password', {
        layout: 'auth',
        error: err.message,
        token: req.body.token,
      });
    }
  }
}

module.exports = new AuthController();
