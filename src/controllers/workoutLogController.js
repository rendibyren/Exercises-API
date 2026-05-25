const mongoose = require('mongoose');
const WorkoutLog = require('../models/WorkoutLog');
const Exercise = require('../models/Exercise');

// Fungsi pembantu (helper) untuk merakit detail relasi tanpa bergantung pada .populate() bawaan Mongoose yang rawan bermasalah di Vercel
const kumpulkanDetailLog = async (log) => {
    if (!log) return null;

    // 1. Ambil semua exerciseId unik yang ada di dalam log ini
    const idsLatihan = log.exercises.map(item => item.exerciseId).filter(id => id != null);

    // 2. Ambil data master Exercise secara utuh dari DB Atlas sekaligus
    // Serta langsung jalankan populate untuk alat (equipment) dan otot (muscles) di level master
    const dataMasterLatihan = await Exercise.find({ _id: { $in: idsLatihan } })
        .populate({ path: 'equipment', select: 'name' })
        .populate({ path: 'muscles.muscleId', select: 'name' });

    // 3. Petakan (Map) data sets user dengan data master gerakan yang cocok
    const detailRelasi = log.exercises.map(item => {
        const gerakanCocok = dataMasterLatihan.find(master => master._id.toString() === item.exerciseId.toString());

        if (gerakanCocok) {
            return {
                _id: gerakanCocok._id,
                name: gerakanCocok.name,
                equipment: gerakanCocok.equipment ? gerakanCocok.equipment.name : null,
                muscles: gerakanCocok.muscles ? gerakanCocok.muscles.map(m => ({
                    name: m.muscleId ? m.muscleId.name : null,
                    percentage: m.percentage
                })) : [],
                instructions: gerakanCocok.instructions || [],
                videoUrl: gerakanCocok.videoUrl || "",
                image: gerakanCocok.image || "",
                sets: item.sets
            };
        }
        return null;
    }).filter(item => item !== null);

    return {
        _id: log._id,
        user: log.user,
        workoutName: log.workoutName,
        duration: log.duration,
        isCompleted: log.isCompleted || false,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        detail: detailRelasi
    };
};

// 1. POST: Simpan Log Latihan Baru
exports.createLog = async (req, res) => {
    try {
        const { workoutName, duration, exercises } = req.body;

        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({ message: "Log latihan harus berisi minimal satu gerakan/exercise." });
        }

        const formattedExercises = exercises.map(item => {
            if (!mongoose.Types.ObjectId.isValid(item.exerciseId)) {
                throw new Error(`Format exerciseId '${item.exerciseId}' tidak valid.`);
            }
            return {
                exerciseId: new mongoose.Types.ObjectId(item.exerciseId),
                sets: item.sets ? item.sets.map(set => ({
                    reps: parseInt(set.reps) || 0,
                    weight: parseFloat(set.weight) || 0
                })) : []
            };
        });

        const newLog = new WorkoutLog({
            user: req.user.id,
            workoutName: workoutName || "Custom Workout",
            duration: duration || 0,
            exercises: formattedExercises
        });

        const savedLog = await newLog.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error("DEBUG POST LOG ERROR:", error);
        res.status(error.message.includes('Format exerciseId') ? 400 : 500).json({
            message: "Gagal menyimpan log latihan.",
            error: error.message
        });
    }
};

// 2. GET ALL: Ambil Semua Riwayat Khusus User
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await WorkoutLog.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Rakit detail untuk setiap log secara paralel menggunakan Promise.all
        const formattedLogs = await Promise.all(logs.map(log => kumpulkanDetailLog(log)));

        res.status(200).json(formattedLogs);
    } catch (error) {
        console.error("DEBUG GET LOG ERROR:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat latihan.", error: error.message });
    }
};

// 3. GET BY ID: Mengambil satu detail log berdasarkan ID
exports.getLogById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID log tidak valid." });
        }

        const log = await WorkoutLog.findOne({ _id: id, user: req.user.id });

        if (!log) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        const formattedLog = await kumpulkanDetailLog(log);
        res.status(200).json(formattedLog);
    } catch (error) {
        console.error("DEBUG GET LOG BY ID ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat mengambil detail riwayat.", error: error.message });
    }
};

// 4. PUT KHUSUS: Mengubah status isCompleted menjadi True Saja
exports.completeWorkoutLog = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID log tidak valid." });
        }

        const updated = await WorkoutLog.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { $set: { isCompleted: true } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        const formattedLog = await kumpulkanDetailLog(updated);
        res.status(200).json({
            message: "Sesi latihan berhasil diselesaikan!",
            data: formattedLog
        });
    } catch (error) {
        console.error("DEBUG COMPLETE LOG ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat menyelesaikan latihan.", error: error.message });
    }
};

// 5. PUT UMUM: Update data field nama, durasi, atau array latihan harian
exports.updateLog = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID log tidak valid." });
        }

        const updateFields = {};
        const allowedFields = ['workoutName', 'duration', 'exercises'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data riwayat yang diubah." });
        }

        if (updateFields.exercises && Array.isArray(updateFields.exercises)) {
            updateFields.exercises = updateFields.exercises.map(item => {
                if (!mongoose.Types.ObjectId.isValid(item.exerciseId)) {
                    throw new Error(`Format exerciseId '${item.exerciseId}' tidak valid.`);
                }
                return {
                    exerciseId: new mongoose.Types.ObjectId(item.exerciseId),
                    sets: item.sets ? item.sets.map(set => ({
                        reps: parseInt(set.reps) || 0,
                        weight: parseFloat(set.weight) || 0
                    })) : []
                };
            });
        }

        const updated = await WorkoutLog.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        const formattedLog = await kumpulkanDetailLog(updated);
        res.status(200).json(formattedLog);
    } catch (error) {
        console.error("DEBUG PUT LOG ERROR:", error);
        res.status(error.message?.includes('Format exerciseId') ? 400 : 500).json({
            message: "Terjadi kesalahan server saat update riwayat.",
            error: error.message
        });
    }
};

// 6. DELETE: Menghapus Riwayat Latihan
exports.deleteLog = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID log tidak valid." });
        }

        const deleted = await WorkoutLog.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deleted) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        res.status(200).json({ message: "Riwayat latihan berhasil dihapus." });
    } catch (error) {
        console.error("DEBUG DELETE LOG ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus riwayat.", error: error.message });
    }
};