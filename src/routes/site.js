const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.get('/landing', siteController.landing);

//list + filter
router.get('/tasks', siteController.show);

router.get('/search', siteController.search);
router.get('/home', siteController.home);
router.get('/', siteController.index);

module.exports = router;
