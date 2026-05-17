const express = require('express');
const router = express.Router();

const authController = require('../../app/controllers/auth/AuthController');

// AUTH
router.get('/login', authController.login);
router.post('/login', authController.loginPost);
router.get('/register', authController.register);
router.post('/register', authController.registerPost);
router.get('/logout', authController.logout);

// EMAIL VERIFY
router.get('/verify-email', authController.verifyEmail);

// FORGOT PASSWORD
router.get('/forgot-password', authController.forgotPassword);
router.post('/forgot-password', authController.forgotPasswordPost);

// RESET PASSWORD
router.get('/reset-password', authController.resetPassword);
router.post('/reset-password', authController.resetPasswordPost);

// GOOGLE AUTH
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// FACEBOOK AUTH
router.get('/facebook', authController.facebookLogin);
router.get('/facebook/callback', authController.facebookCallback);

//LINE AUTH
router.get('/line', authController.lineLogin);
router.get('/line/callback', authController.lineCallback);

module.exports = router;
