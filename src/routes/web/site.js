const express = require('express');
const router = express.Router();

const siteController = require('../../app/controllers/web/SiteController');

//public
router.get('/landing', siteController.landing);
router.get('/', siteController.index);

//list + filter
router.get('/tasks', siteController.show);
router.get('/home', siteController.home);
router.get('/search', siteController.search);

module.exports = router;
