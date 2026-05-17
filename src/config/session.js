require('dotenv').config();

const session = require('express-session');
const { MongoStore } = require('connect-mongo');

module.exports = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
};
