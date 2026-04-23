const express = require('express');
const router = express.Router();

const validate = require('../app/middlewares/validate');
const taskValidateSchema = require('../app/validator/task.validator');
const authMiddleware = require('../app/middlewares/auth');
const taskController = require('../app/controllers/TaskController');

// Login middleware
router.use(authMiddleware);

//create
router.get('/create', taskController.create);
router.post('/store', validate(taskValidateSchema), taskController.store);

// search and filter
router.get('/', taskController.index);

//delete-restore-force delete
router.patch('/:id/restore', taskController.restore);
router.delete('/:id/force', taskController.forceDelete);
router.delete('/:id', taskController.delete);

//updateStatus when done button changed
router.patch('/:id/status', taskController.updateStatus);

//edit and updateTask
router.get('/:id/edit', taskController.edit);
router.put('/:id', validate(taskValidateSchema), taskController.updateTask);

module.exports = router;
