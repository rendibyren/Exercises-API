const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');

router.post('/', workoutLogController.createLog);
router.get('/', workoutLogController.getAllLogs);

module.exports = router;