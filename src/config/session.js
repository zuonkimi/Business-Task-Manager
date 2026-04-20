require('dotenv').config();

module.exports = {
  secret: process.env.SESSION_SECRET,

  resave: false,
  saveUninitialized: false,

  rolling: true, // 🔥 extend session khi user hoạt động

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 🔥 auto switch
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
};
