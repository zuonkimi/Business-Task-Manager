const tasksRouter = require('./tasks');
const siteRouter = require('./site');
const meRouter = require('./me');
const authRouter = require('./auth');
const requireAuth = require('../app/middlewares/auth');
const preventCache = require('../app/middlewares/preventCache');

function route(app) {
  //private
  app.use('/tasks', requireAuth, preventCache, tasksRouter);
  app.use('/me', requireAuth, preventCache, meRouter);
  app.use('/auth', authRouter);

  //public
  app.use('/', siteRouter);
}

module.exports = route;
