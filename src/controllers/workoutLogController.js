const WorkoutLog = require('../models/WorkoutLog');

// 1. Simpan Log Latihan Baru
exports.createLog = async (req, res) => {
    try {
        const { exerciseId, sets, reps, weight, notes } = req.body;

        const newLog = new WorkoutLog({
            exerciseId,
            sets,
            reps,
            weight,
            notes
        });

        const savedLog = await newLog.save();
        res.status(201).json(savedLog);
    } catch (error) {
        res.status(500).json({ message: "Gagal menyimpan log latihan.", error: error.message });
    }
};

// 2. Ambil Semua Riwayat Latihan (dengan Detail Nama Latihan)
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await WorkoutLog.find()
            .populate('exerciseId', 'name muscle') // Mengambil nama & otot dari tabel Exercise
            .sort({ date: -1 }); // Urutkan dari yang terbaru
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil riwayat latihan." });
    }
};