const express = require('express');
const router = express.Router();

const meController = require('../../app/controllers/web/MeController');

router.get('/trash-tasks', meController.trashTasks);

module.exports = router;
