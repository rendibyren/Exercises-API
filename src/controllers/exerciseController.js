const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

// 1. GET ALL: Mengambil seluruh daftar latihan dari library global
exports.getAllExercises = async (req, res) => {
    try {
        // BYPASS PAGINATION FIX: Jika frontend tidak mengirimkan query ?page=,
        // kembalikan SEMUA data langsung agar fitur search di frontend bisa membaca seluruh library.
        if (!req.query.page) {
            const data = await Exercise.find()
                .sort({ name: 1 })
                .populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } })
                .populate({ path: 'muscles.muscleId', select: 'name', options: { strictPopulate: false } });

            return res.status(200).json(data);
        }

        // Jika ada query ?page=, jalankan fitur pembatas halaman (Paging) seperti biasa
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
                message: `Halaman ${page} tidak ditemukan.`,
                detail: []
            });
        }

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

// 2. GET BY ID: Detail latihan tunggal lengkap dengan Nama Alat & Otot
exports.getExerciseById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Format ID latihan tidak valid."
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
        res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
    }
};

// 3. POST: Membuat latihan baru (Mendukung Single Object ATAU Banyak Data/Array Sekaligus)
exports.createExercise = async (req, res) => {
    try {
        // KUNCI COCOK: Jika input berupa Array (Bulk Insert dari Postman)
        if (Array.isArray(req.body)) {
            for (const item of req.body) {
                if (!item.name || item.name.trim() === "") {
                    return res.status(400).json({ message: "Ada nama latihan yang kosong di dalam daftar array." });
                }
            }

            const savedExercises = await Exercise.insertMany(req.body);

            const populatedExercises = await Exercise.find({ _id: { $in: savedExercises.map(e => e._id) } })
                .populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } })
                .populate({ path: 'muscles.muscleId', select: 'name', options: { strictPopulate: false } });

            return res.status(201).json(populatedExercises);
        }

        // Jika input berupa Objek Tunggal biasa
        if (!req.body || !req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama latihan wajib diisi." });
        }
        if (!req.body.equipment) {
            return res.status(400).json({ message: "ID Equipment wajib diisi." });
        }
        if (!req.body.muscles || !Array.isArray(req.body.muscles) || req.body.muscles.length === 0) {
            return res.status(400).json({ message: "Data otot wajib diisi dalam bentuk array." });
        }

        const newExercise = new Exercise({
            name: req.body.name,
            muscles: req.body.muscles,
            equipment: req.body.equipment,
            instructions: req.body.instructions,
            videoUrl: req.body.videoUrl
        });

        const savedExercise = await newExercise.save();

        const populatedExercise = await Exercise.findById(savedExercise._id)
            .populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } })
            .populate({ path: 'muscles.muscleId', select: 'name', options: { strictPopulate: false } });

        res.status(201).json(populatedExercise);
    } catch (error) {
        console.error("DEBUG POST ERROR:", error);
        res.status(500).json({ message: "Gagal menyimpan data ke database.", error: error.message });
    }
};

// 4. PUT: Mengubah data latihan + LANGSUNG POPULATE NAMA BARU
exports.updateExercise = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID latihan tidak valid." });
        }

        const updateFields = {};
        const allowedFields = ['name', 'muscles', 'equipment', 'instructions', 'videoUrl'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data valid yang diubah." });
        }

        const updated = await Exercise.findOneAndUpdate(
            { _id: id },
            { $set: updateFields },
            { new: true, runValidators: true }
        )
            .populate({ path: 'equipment', select: 'name', options: { strictPopulate: false } })
            .populate({ path: 'muscles.muscleId', select: 'name', options: { strictPopulate: false } });

        if (!updated) {
            return res.status(404).json({ message: "Data latihan tidak ditemukan." });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("DEBUG PUT ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat update.", error: error.message });
    }
};

// 5. DELETE: Menghapus gerakan latihan dari library
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

        res.status(200).json({ message: `Latihan '${deleted.name}' berhasil dihapus dari library global.` });
    } catch (error) {
        console.error("DEBUG DELETE ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus.", error: error.message });
    }
};