const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

// 1. Tangani GET All & POST (Ini sudah benar)
router.get('/', protect, exerciseController.getAllExercises);
router.post('/', protect, exerciseController.createExercise);

// 2. Tangani jika user lupa ID (Tambahkan ini)
// Ini akan menangkap DELETE /api/exercises atau DELETE /api/exercises/
router.all('/', (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
        return res.status(400).json({
            message: `Gagal ${req.method === 'PUT' ? 'update' : 'hapus'}! Silakan pilih latihan dulu (masukkan ID).`
        });
    }
    next(); // Lanjut jika methodnya GET atau POST
});

// 3. Tangani rute dengan ID
router.put('/:id', exerciseController.updateExercise);
router.delete('/:id', exerciseController.deleteExercise);

module.exports = router;