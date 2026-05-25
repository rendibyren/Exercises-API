const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');
const { protect } = require('../middleware/authMiddleware');

// 1. Operasi Basis Tanpa ID
router.post('/', protect, workoutLogController.createLog);
router.get('/', protect, workoutLogController.getAllLogs);

// 2. BARU: Rute Khusus untuk Mengubah Status isCompleted Saja
router.put('/complete/:id', protect, workoutLogController.completeWorkoutLog);

// 3. Operasi dengan Parameter ID (Rute Umum untuk field lainnya)
router.get('/:id', protect, workoutLogController.getLogById);
router.put('/:id', protect, workoutLogController.updateLog);
router.delete('/:id', protect, workoutLogController.deleteLog);

module.exports = router;