const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

// 1. Tangani GET All & POST
router.get('/', protect, exerciseController.getAllExercises);
router.post('/', protect, exerciseController.createExercise);

// 2. Tangani jika user lupa ID
// Ini akan menangkap PUT/DELETE ke /api/exercises tanpa membawa ID
router.all('/', (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
        return res.status(400).json({
            message: `Gagal ${req.method === 'PUT' ? 'update' : 'hapus'}! Silakan pilih latihan dulu (masukkan ID).`
        });
    }
    next();
});

// 3. Tangani rute dengan ID (BARU: Ditambahkan GET BY ID & Proteksi Token)
router.get('/:id', protect, exerciseController.getExerciseById);
router.put('/:id', protect, exerciseController.updateExercise);
router.delete('/:id', protect, exerciseController.deleteExercise);

module.exports = router;