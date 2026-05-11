const express = require('express');
const router = express.Router();

const authController = require('../../app/controllers/auth/AuthController');

router.get('/verify-email', authController.verifyEmail);
router.get('/forgot-password', authController.forgotPassword);
router.post('/forgot-password', authController.forgotPasswordPost);
router.get('/reset-password', authController.resetPassword);
router.post('/reset-password', authController.resetPasswordPost);

router.get('/login', authController.login);
router.post('/login', authController.loginPost);

router.get('/register', authController.register);
router.post('/register', authController.registerPost);

router.get('/logout', authController.logout);

module.exports = router;
