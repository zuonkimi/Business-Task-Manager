const express = require('express');
const router = express.Router();

const { validate } = require('../../app/middlewares/validate');
const taskValidateSchema = require('../../app/validator/task.validator');
const authMiddleware = require('../../app/middlewares/auth');
const upload = require('../../app/middlewares/upload');
const taskController = require('../../app/controllers/pageControllers/TaskController');

// Login middleware
router.use(authMiddleware);

// CREATE
router.get('/create', taskController.create);

// STORE
router.post(
  '/store',
  upload.array('attachments', 5),
  validate(taskValidateSchema),
  taskController.store,
);

// SEARCH / FILTER
router.get('/', taskController.index);

// DELETE / RESTORE
router.patch('/:id/restore', taskController.restore);
router.delete('/:id/force', taskController.forceDelete);
router.delete('/:id', taskController.delete);

// DETAIL
router.get('/:id', taskController.showDetail);

// LIKE
router.post('/:id/like', taskController.toggleLike);

// UPDATE STATUS
router.patch('/:id/status', taskController.updateStatus);

// EDIT
router.get('/:id/edit', taskController.edit);

// UPDATE TASK
router.put(
  '/:id',
  upload.array('attachments', 5),
  validate(taskValidateSchema),
  taskController.updateTask,
);

module.exports = router;
