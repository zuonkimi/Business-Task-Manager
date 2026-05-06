const usersRouter = require('./pageRoutes/users');
const tasksRouter = require('./pageRoutes/tasks');
const siteRouter = require('./pageRoutes/site');
const meRouter = require('./pageRoutes/me');
const authRouter = require('./pageRoutes/auth');
const profileRouter = require('./pageRoutes/profile');
const followRouter = require('./apiRoutes/follow');
const commentRouter = require('./apiRoutes/comment');
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
