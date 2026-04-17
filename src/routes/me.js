const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');

router.get('/trash-tasks', meController.trashTasks);

module.exports = router;
