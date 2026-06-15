const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

// 1. Tangani GET All & POST (Rute Statis - Wajib di Atas)
router.get('/', protect, exerciseController.getAllExercises);
router.post('/', protect, exerciseController.createExercise);

// 2. Tangani rute dengan ID (Rute Dinamis - Wajib di Bawah)
router.get('/:id', protect, exerciseController.getExerciseById);
router.put('/:id', protect, exerciseController.updateExercise);
router.delete('/:id', protect, exerciseController.deleteExercise);

module.exports = router;