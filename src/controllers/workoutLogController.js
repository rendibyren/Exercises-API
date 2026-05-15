const WorkoutLog = require('../models/WorkoutLog');

// 1. Simpan Log Latihan Baru
exports.createLog = async (req, res) => {
    try {
        // Ambil data dari body
        const { workoutName, duration, exercises } = req.body;

        const newLog = new WorkoutLog({
            user: req.user.id, // Diambil dari middleware 'protect'
            workoutName,
            duration,
            exercises // Ini harus berupa array sesuai model
        });

        const savedLog = await newLog.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error("Error Simpan Log:", error);
        res.status(500).json({ message: "Gagal menyimpan log latihan.", error: error.message });
    }
};

// 2. Ambil Semua Riwayat Latihan (Khusus milik user yang login saja)
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await WorkoutLog.find({ user: req.user.id }) // Hanya log milik si user
            .populate('exercises.exerciseId', 'name bodyPart') // Cara populate di dalam array
            .sort({ date: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil riwayat latihan." });
    }
};