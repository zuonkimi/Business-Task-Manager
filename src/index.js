require('dotenv').config(); // read .env file -> set process.env

// import rate limit middleware
const rateLimit = require('express-rate-limit');
// session saved in server memory (should use Redis or MongoDB in production)
const session = require('express-session');
// Cross-Site-Request-Forgery protection
const csrf = require('csurf');
// Express framework for building web applications
const express = require('express');
// HTML template engine for express
const exphbs = require('express-handlebars');
// fake methods
const methodOverride = require('method-override');
// create server to control app
const app = express();
// connect to database
const db = require('./config/db');
const User = require('./app/models/User');
// handle path to static files and views
const path = require('path');
// set up all routes for app
const route = require('./routes');
// const { max } = require('./app/validator/task.validator');
// It help read cookie from server request (convert object type)
const cookieParser = require('cookie-parser');
// config session for app
const sessionConfig = require('./config/session');
// get environment const (process.env is env saved)
const port = process.env.PORT || 9999;
// read date from form (convert object type)
app.use(express.urlencoded({ extended: true }));
// read json data
app.use(express.json());
// allow fake method in _method
app.use(methodOverride('_method'));
// User -> Proxy(cloudflare, nginx, render, heroku...) -> Server Express app (proxy )
// trust first(1) proxy and allow express app read true info from header
app.set('trust proxy', 1);
// is service static files (css, js, images...) in public folder
app.use(express.static(path.join(__dirname, 'public')));
// use ratelimit to send 100 requests per 15 min
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
// read cookie from request and convert to object type
app.use(cookieParser());
// create session ID -> save session in server -> send cookie with session ID to browser -> browser send cookie -> server find session by ID in cookie -> get session data
app.use(session(sessionConfig));

app.use(async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId).lean();
      res.locals.currentUser = user;
    } else {
      res.locals.currentUser = null;
    }
  } catch (err) {
    res.locals.currentUser = null;
  }

  next();
});

//View engine, set up handlebars -> hbs and has helpers
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    helpers: require('./helpers/handlebars'),
  }),
);
// when get res.render('home') -> is home.hbs ...
app.set('view engine', '.hbs');
// set path to hbs file
app.set('views', path.join(__dirname, 'resources', 'views'));

// when connect successfully to database
db.connect().then(() => {
  // Load all routes for app
  route(app);
  // start server
});

app.listen(port, () => {
  console.log(`Server chạy tại port ${port}`);
});
