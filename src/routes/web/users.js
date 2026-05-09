const express = require('express');
const router = express.Router();

const usersController = require('../../app/controllers/web/UserController');

router.get('/', usersController.index);

module.exports = router;
