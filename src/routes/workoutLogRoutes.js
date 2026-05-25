const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');
const { protect } = require('../middleware/authMiddleware');

// 1. Operasi Basis Tanpa ID
router.post('/', protect, workoutLogController.createLog);
router.get('/', protect, workoutLogController.getAllLogs);

// 2. Operasi dengan Parameter ID
router.get('/:id', protect, workoutLogController.getLogById);
router.put('/:id', protect, workoutLogController.updateLog);
router.delete('/:id', protect, workoutLogController.deleteLog);

module.exports = router;