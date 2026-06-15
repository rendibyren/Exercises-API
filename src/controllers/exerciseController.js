const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

// 1. GET ALL: Mengambil daftar latihan dengan Paging, Sort Nama A-Z, & Populate Efisien
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

        // Ditambahkan options: { strictPopulate: false } agar aman dari amnesia serverless Vercel
        const data = await Exercise.find()
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } })
            .populate({ path: 'muscles.muscleId', select: 'name', options: { strictPopulate: false } });

        res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalExercises: totalData,
            detail: data
        });

    } catch (error) {
        console.error("DEBUG GET ALL ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
    }
};

// 2. GET BY ID: Mengambil detail satu latihan berdasarkan ID + Populate Lengkap
exports.getExerciseById = async (req, res) => {
    try {
        const id = req.params.id;

        // Proteksi jika format ID di URL salah ketik / kurang karakter
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Format ID latihan tidak valid. Pastikan alamat URL di Postman benar."
            });
        }

        const data = await Exercise.findById(id)
            .populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } })
            .populate({ path: 'muscles.muscleId', select: 'name', options: { strictPopulate: false } });

        if (!data) {
            return res.status(404).json({ message: "Latihan tidak ditemukan." });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("DEBUG GET BY ID ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat mengambil detail latihan.", error: error.message });
    }
};

// 3. POST: Membuat latihan baru dengan skema relasi
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
            user: req.user ? req.user.id : null // Menghubungkan latihan dengan user yang membuatnya
        });

        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (error) {
        console.error("DEBUG POST ERROR:", error);
        res.status(500).json({ message: "Gagal menyimpan data ke database.", error: error.message });
    }
};

// 4. PUT: Mengubah data gerakan (Partial Update)
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

        // Query pencarian diubah menggunakan findOneAndUpdate agar aman (bisa divalidasi berdasarkan user jika perlu)
        const updated = await Exercise.findOneAndUpdate(
            { _id: id },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } });

        if (!updated) {
            return res.status(404).json({ message: "Data latihan tidak ditemukan." });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("DEBUG PUT ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat update.", error: error.message });
    }
};

// 5. DELETE: Menghapus gerakan latihan berdasarkan ID
exports.deleteExercise = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID latihan tidak valid." });
        }

        const deleted = await Exercise.findOneAndDelete({ _id: id });

        if (!deleted) {
            return res.status(404).json({ message: "Data latihan tidak ditemukan." });
        }

        res.status(200).json({ message: `Latihan '${deleted.name}' berhasil dihapus.` });
    } catch (error) {
        console.error("DEBUG DELETE ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus.", error: error.message });
    }
};