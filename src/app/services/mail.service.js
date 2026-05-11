const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

class MailService {
  async sendVerificationEmail(email, token) {
    const verifyUrl = `http://localhost:9999/auth/verify-email?token=${token}`;
    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Verify your account',
        html: `
                <h2>Verify your account</h2>
                <p>Click link below:</p>
                <a href='${verifyUrl}'>${verifyUrl}</a>
            `,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async sendResetPasswordEmail(email, url) {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Reset password',
      html: `
        <h2>Reset Password</h2>
        <p>Click link below</p>
        <a href="${url}">${url}</a>
      `,
    });
  }
}

module.exports = new MailService();
