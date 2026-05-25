const mongoose = require('mongoose');
const WorkoutLog = require('../models/WorkoutLog');
const Exercise = require('../models/Exercise');

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
        const logs = await WorkoutLog.find({ user: req.user.id })
            .populate({
                path: 'exercises.exerciseId',
                populate: [
                    { path: 'equipment', select: 'name' },
                    { path: 'muscles.muscleId', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        const formattedLogs = logs.map(log => {
            const detailRelasi = log.exercises ? log.exercises.map(item => {
                // Perbaikan Kunci: Cek apakah field nama hasil populate berhasil keluar
                if (item.exerciseId && item.exerciseId.name) {
                    return {
                        _id: item.exerciseId._id,
                        name: item.exerciseId.name,
                        equipment: item.exerciseId.equipment ? item.exerciseId.equipment.name : null,
                        muscles: item.exerciseId.muscles ? item.exerciseId.muscles.map(m => ({
                            name: m.muscleId ? m.muscleId.name : null,
                            percentage: m.percentage
                        })) : [],
                        instructions: item.exerciseId.instructions,
                        videoUrl: item.exerciseId.videoUrl,
                        image: item.exerciseId.image,
                        sets: item.sets
                    };
                }
                return null;
            }).filter(item => item !== null) : [];

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
        });

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

        const log = await WorkoutLog.findOne({ _id: id, user: req.user.id })
            .populate({
                path: 'exercises.exerciseId',
                populate: [
                    { path: 'equipment', select: 'name' },
                    { path: 'muscles.muscleId', select: 'name' }
                ]
            });

        if (!log) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        const detailRelasi = log.exercises ? log.exercises.map(item => {
            if (item.exerciseId && item.exerciseId.name) {
                return {
                    _id: item.exerciseId._id,
                    name: item.exerciseId.name,
                    equipment: item.exerciseId.equipment ? item.exerciseId.equipment.name : null,
                    muscles: item.exerciseId.muscles ? item.exerciseId.muscles.map(m => ({
                        name: m.muscleId ? m.muscleId.name : null,
                        percentage: m.percentage
                    })) : [],
                    instructions: item.exerciseId.instructions,
                    videoUrl: item.exerciseId.videoUrl,
                    image: item.exerciseId.image,
                    sets: item.sets
                };
            }
            return null;
        }).filter(item => item !== null) : [];

        res.status(200).json({
            _id: log._id,
            user: log.user,
            workoutName: log.workoutName,
            duration: log.duration,
            isCompleted: log.isCompleted || false,
            createdAt: log.createdAt,
            updatedAt: log.updatedAt,
            detail: detailRelasi
        });
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
        ).populate({
            path: 'exercises.exerciseId',
            populate: [
                { path: 'equipment', select: 'name' },
                { path: 'muscles.muscleId', select: 'name' }
            ]
        });

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        const detailRelasi = updated.exercises ? updated.exercises.map(item => {
            if (item.exerciseId && item.exerciseId.name) {
                return {
                    _id: item.exerciseId._id,
                    name: item.exerciseId.name,
                    equipment: item.exerciseId.equipment ? item.exerciseId.equipment.name : null,
                    muscles: item.exerciseId.muscles ? item.exerciseId.muscles.map(m => ({
                        name: m.muscleId ? m.muscleId.name : null,
                        percentage: m.percentage
                    })) : [],
                    sets: item.sets
                };
            }
            return null;
        }).filter(item => item !== null) : [];

        res.status(200).json({
            message: "Sesi latihan berhasil diselesaikan!",
            data: {
                _id: updated._id,
                workoutName: updated.workoutName,
                duration: updated.duration,
                isCompleted: updated.isCompleted,
                createdAt: updated.createdAt,
                detail: detailRelasi
            }
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
                    exerciseId: item.exerciseId,
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
        ).populate({
            path: 'exercises.exerciseId',
            populate: [
                { path: 'equipment', select: 'name' },
                { path: 'muscles.muscleId', select: 'name' }
            ]
        });

        if (!updated) {
            return res.status(404).json({ message: "Riwayat latihan tidak ditemukan atau Anda tidak memiliki akses." });
        }

        const detailRelasi = updated.exercises ? updated.exercises.map(item => {
            if (item.exerciseId && item.exerciseId.name) {
                return {
                    _id: item.exerciseId._id,
                    name: item.exerciseId.name,
                    equipment: item.exerciseId.equipment ? item.exerciseId.equipment.name : null,
                    muscles: item.exerciseId.muscles ? item.exerciseId.muscles.map(m => ({
                        name: m.muscleId ? m.muscleId.name : null,
                        percentage: m.percentage
                    })) : [],
                    sets: item.sets
                };
            }
            return null;
        }).filter(item => item !== null) : [];

        res.status(200).json({
            _id: updated._id,
            user: updated.user,
            workoutName: updated.workoutName,
            duration: updated.duration,
            isCompleted: updated.isCompleted,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            detail: detailRelasi
        });
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