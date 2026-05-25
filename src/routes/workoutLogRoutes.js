const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');
const { protect } = require('../middleware/authMiddleware');

// 1. Operasi Basis Tanpa ID (Create & Read All)
router.post('/', protect, workoutLogController.createLog);
router.get('/', protect, workoutLogController.getAllLogs);

// 2. Pencegahan jika user lupa memasukkan parameter ID saat PUT / DELETE
router.all('/', (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
        return res.status(400).json({
            message: `Gagal ${req.method === 'PUT' ? 'update' : 'hapus'}! Silakan pilih log latihan dulu (masukkan ID).`
        });
    }
    next();
});

// 3. Operasi dengan Parameter ID (Get by ID, Update, Delete)
router.get('/:id', protect, workoutLogController.getLogById);
router.put('/:id', protect, workoutLogController.updateLog);
router.delete('/:id', protect, workoutLogController.deleteLog);

module.exports = router;