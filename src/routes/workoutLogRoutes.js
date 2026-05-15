const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');
const { protect } = require('../middleware/authMiddleware'); // Import satpam

// Tambahkan protect di kedua route ini
router.post('/', protect, workoutLogController.createLog);
router.get('/', protect, workoutLogController.getAllLogs);

module.exports = router;