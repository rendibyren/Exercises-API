const mongoose = require('mongoose');
const WorkoutLog = require('../models/WorkoutLog');

// 1. POST: Simpan Log Latihan Baru (Hevy Style)
exports.createLog = async (req, res) => {
    try {
        const { workoutName, duration, exercises } = req.body;

        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({ message: "Log latihan harus berisi minimal satu gerakan." });
        }

        // Mapping data exercises dari body request
        const formattedExercises = exercises.map(item => {
            if (!mongoose.Types.ObjectId.isValid(item.exerciseId)) {
                throw new Error(`Format exerciseId '${item.exerciseId}' tidak valid.`);
            }
            return {
                exerciseId: item.exerciseId,
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
        console.error("ERROR POST LOG:", error);
        res.status(error.message.includes('Format exerciseId') ? 400 : 500).json({
            message: "Gagal menyimpan log latihan.",
            error: error.message
        });
    }
};

// 2. GET ALL: Ambil Semua Riwayat + Tarik Data Master Otomatis (.populate)
exports.getAllLogs = async (req, res) => {
    try {
        // Cukup panggil .populate untuk menarik data nama gerakan, alat, dan otot dari file sebelah
        const logs = await WorkoutLog.find({ user: req.user.id })
            .populate({
                path: 'exercises.exerciseId',
                select: 'name instructions videoUrl image', // Tarik info gerakan master
                populate: [
                    { path: 'equipment', select: 'name' },      // Tarik info alat master
                    { path: 'muscles.muscleId', select: 'name' } // Tarik info otot master
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json(logs);
    } catch (error) {
        console.error("ERROR GET LOG:", error);
        res.status(500).json({ message: "Gagal mengambil riwayat latihan.", error: error.message });
    }
};

// 3. GET BY ID: Mengambil satu detail log berdasarkan ID
exports.getLogById = async (req, res) => {
    try {
        const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user.id })
            .populate({
                path: 'exercises.exerciseId',
                select: 'name instructions videoUrl image',
                populate: [
                    { path: 'equipment', select: 'name' },
                    { path: 'muscles.muscleId', select: 'name' }
                ]
            });

        if (!log) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan." });
        }

        res.status(200).json(log);
    } catch (error) {
        console.error("ERROR GET LOG BY ID:", error);
        res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
    }
};

// 4. PUT KHUSUS: Mengubah status isCompleted menjadi True (User Klik "Finish Workout")
exports.completeWorkoutLog = async (req, res) => {
    try {
        const updated = await WorkoutLog.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: { isCompleted: true } },
            { new: true }
        ).populate({
            path: 'exercises.exerciseId',
            select: 'name',
            populate: { path: 'equipment', select: 'name' }
        });

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan." });
        }

        res.status(200).json({ message: "Sesi latihan berhasil diselesaikan!", data: updated });
    } catch (error) {
        console.error("ERROR COMPLETE LOG:", error);
        res.status(500).json({ message: "Gagal menyelesaikan latihan.", error: error.message });
    }
};

// 5. PUT UMUM: Update isi nama, durasi, atau set latihan harian
exports.updateLog = async (req, res) => {
    try {
        const updateFields = {};
        const allowedFields = ['workoutName', 'duration', 'exercises'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        if (updateFields.exercises && Array.isArray(updateFields.exercises)) {
            updateFields.exercises = updateFields.exercises.map(item => ({
                exerciseId: item.exerciseId,
                sets: item.sets ? item.sets.map(set => ({
                    reps: parseInt(set.reps) || 0,
                    weight: parseFloat(set.weight) || 0
                })) : []
            }));
        }

        const updated = await WorkoutLog.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate({
            path: 'exercises.exerciseId',
            select: 'name'
        });

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan." });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("ERROR PUT LOG:", error);
        res.status(500).json({ message: "Gagal update riwayat.", error: error.message });
    }
};

// 6. DELETE: Menghapus Riwayat Latihan
exports.deleteLog = async (req, res) => {
    try {
        const deleted = await WorkoutLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deleted) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan." });
        }
        res.status(200).json({ message: "Riwayat latihan berhasil dihapus." });
    } catch (error) {
        console.error("ERROR DELETE LOG:", error);
        res.status(500).json({ message: "Gagal menghapus riwayat.", error: error.message });
    }
};