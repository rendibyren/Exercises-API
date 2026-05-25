const mongoose = require('mongoose'); // BARU: Wajib di-import untuk validasi ObjectId
const Exercise = require('../models/Exercise');

// 1. GET ALL (Versi Aman: Kebal dari crash akibat data lama bertipe String)
exports.getAllExercises = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalData = await Exercise.countDocuments();
        const totalPages = Math.ceil(totalData / limit);

        if (page > totalPages && totalData > 0) {
            return res.status(404).json({
                currentPage: page,
                totalPages: totalPages,
                totalExercises: totalData,
                message: `Halaman ${page} tidak ditemukan. Data hanya tersedia sampai halaman ${totalPages}.`,
                detail: []
            });
        }

        // Ambil data mentah dari database terlebih dahulu
        const rawData = await Exercise.find()
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        // Lakukan skenasi populate secara asinkronus dan aman per item data
        const formattedData = await Promise.all(rawData.map(async (exercise) => {
            // Cek apakah kolom equipment berbentuk ObjectId yang valid
            const isEquipmentValid = mongoose.Types.ObjectId.isValid(exercise.equipment);

            // Cek apakah seluruh item di dalam array muscles memiliki muscleId berbentuk ObjectId yang valid
            const hasValidMuscles = exercise.muscles && exercise.muscles.length > 0 &&
                exercise.muscles.every(m => mongoose.Types.ObjectId.isValid(m.muscleId));

            // Buat query dinamis berdasarkan validitas data di atas
            let query = Exercise.findById(exercise._id);
            if (isEquipmentValid) query = query.populate('equipment', 'name');
            if (hasValidMuscles) query = query.populate('muscles.muscleId', 'name');

            return await query;
        }));

        res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalExercises: totalData,
            detail: formattedData
        });

    } catch (error) {
        console.error("DEBUG GET ALL ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
    }
};

// 2. GET BY ID (Versi Aman: Proteksi dari format ID URL salah & kebal data String lama)
exports.getExerciseById = async (req, res) => {
    try {
        const id = req.params.id;

        // Validasi awal: Apakah parameter ID di URL sudah benar format ObjectId-nya?
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID latihan tidak valid." });
        }

        const exercise = await Exercise.findById(id);

        if (!exercise) {
            return res.status(404).json({ message: "Latihan tidak ditemukan." });
        }

        // Validasi internal data sebelum melakukan eksekusi .populate()
        const isEquipmentValid = mongoose.Types.ObjectId.isValid(exercise.equipment);
        const hasValidMuscles = exercise.muscles && exercise.muscles.length > 0 &&
            exercise.muscles.every(m => mongoose.Types.ObjectId.isValid(m.muscleId));

        let query = Exercise.findById(id);
        if (isEquipmentValid) query = query.populate('equipment', 'name');
        if (hasValidMuscles) query = query.populate('muscles.muscleId', 'name');

        const data = await query;
        res.status(200).json(data);
    } catch (error) {
        console.error("DEBUG GET BY ID ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat mengambil detail latihan.", error: error.message });
    }
};

// 3. POST (Membuat latihan baru dengan skema relasi)
exports.createExercise = async (req, res) => {
    try {
        if (!req.body || !req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama latihan wajib diisi." });
        }
        if (!req.body.equipment) {
            return res.status(400).json({ message: "ID Equipment wajib diisi." });
        }
        if (!req.body.muscles || !Array.isArray(req.body.muscles) || req.body.muscles.length === 0) {
            return res.status(400).json({ message: "Data otot (muscles) wajib diisi dalam bentuk array." });
        }

        const newExercise = new Exercise({
            name: req.body.name,
            muscles: req.body.muscles,
            equipment: req.body.equipment,
            instructions: req.body.instructions,
            videoUrl: req.body.videoUrl,
            image: req.body.image,
            user: req.user ? req.user.id : null
        });

        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (error) {
        console.error("DEBUG POST ERROR:", error);
        res.status(500).json({ message: "Gagal menyimpan data ke database.", error: error.message });
    }
};

// 4. PUT (Partial Update - Mengubah field secara fleksibel)
exports.updateExercise = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID latihan tidak valid." });
        }

        const updateFields = {};
        const allowedFields = ['name', 'muscles', 'equipment', 'instructions', 'videoUrl', 'image'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data valid yang diubah." });
        }

        const updated = await Exercise.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "ID tidak ditemukan." });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("DEBUG PUT ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat update.", error: error.message });
    }
};

// 5. DELETE (Menghapus latihan berdasarkan ID)
exports.deleteExercise = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID latihan tidak valid." });
        }

        const deleted = await Exercise.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Data tidak ditemukan." });
        }

        res.status(200).json({ message: `Latihan berhasil dihapus.` });
    } catch (error) {
        console.error("DEBUG DELETE ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus.", error: error.message });
    }
};