const express = require('express');
const router = express.Router();
const authMiddleware = require('../app/middlewares/auth');

const taskController = require('../app/controllers/TaskController');

//create
router.get('/create', taskController.create);
router.post('/store', taskController.store);

//delete-restore-force delete
router.patch('/:id/restore', taskController.restore);
router.delete('/:id', taskController.delete);
router.delete('/:id/force', taskController.forceDelete);

//updateStatus when done button changed
router.patch('/:id/status', taskController.updateStatus);

//edit and updateTask
router.get('/:id/edit', taskController.edit);
router.put('/:id', taskController.updateTask);

//Login middleware
router.use(authMiddleware);

module.exports = router;
