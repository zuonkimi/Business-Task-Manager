const usersRouter = require('./web/users');
const tasksRouter = require('./web/tasks');
const siteRouter = require('./web/site');
const meRouter = require('./web/me');
const authRouter = require('./web/auth');
const profileRouter = require('./web/profile');
const followRouter = require('./api/follow');
const commentRouter = require('./api/comment');
const requireAuth = require('../app/middlewares/auth');
const preventCache = require('../app/middlewares/preventCache');

function route(app) {
  //private
  app.use('/api/comments', requireAuth, preventCache, commentRouter);
  app.use('/api/follow', requireAuth, preventCache, followRouter);
  app.use('/tasks', requireAuth, preventCache, tasksRouter);
  app.use('/me', requireAuth, preventCache, meRouter);
  app.use('/auth', authRouter);
  app.use('/profile', profileRouter);
  app.use('/users', usersRouter);

  //public
  app.use('/', siteRouter);
}

module.exports = route;
