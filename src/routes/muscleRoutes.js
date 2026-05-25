const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const muscleController = require('../controllers/muscleController');

// 1. Operasi Basis (Tanpa ID)
router.post('/', protect, muscleController.createMuscle);
router.get('/', muscleController.getAllMuscles);

// 2. Kebijakan jika user lupa ID saat PUT / DELETE
router.all('/', (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
        return res.status(400).json({
            message: `Gagal ${req.method === 'PUT' ? 'update' : 'hapus'}! Silakan pilih otot dulu (masukkan ID).`
        });
    }
    next();
});

// 3. Operasi dengan Parameter ID
router.get('/:id', muscleController.getMuscleById);
router.put('/:id', protect, muscleController.updateMuscle);
router.delete('/:id', protect, muscleController.deleteMuscle);

module.exports = router;