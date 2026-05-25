const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');
const { protect } = require('../middleware/authMiddleware'); // Pastikan auth middleware kamu sudah benar

// Semua rute di bawah ini wajib menggunakan token/protect
router.use(protect);

// 1. POST: Bikin log baru
router.post('/', workoutLogController.createLog);

// 2. GET ALL: Ambil semua log user
router.get('/', workoutLogController.getAllLogs);

// 3. GET BY ID: Ambil satu detail log
router.get('/:id', workoutLogController.getLogById);

// 4. PUT KHUSUS: Mengubah status selesai (isCompleted)
router.put('/complete/:id', workoutLogController.completeWorkoutLog);

// 5. PUT UMUM: Edit isi nama, durasi, atau set latihan harian
router.put('/:id', workoutLogController.updateLog);

// 6. DELETE: Hapus riwayat log
router.delete('/:id', workoutLogController.deleteLog);

module.exports = router;