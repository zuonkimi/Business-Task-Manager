const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

//public
router.get('/landing', siteController.landing);
router.get('/', siteController.index);

//list + filter
router.get('/tasks', siteController.show);

router.get('/home', siteController.home);

module.exports = router;
