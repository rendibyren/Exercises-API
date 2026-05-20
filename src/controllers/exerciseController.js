const Exercise = require('../models/Exercise');

// 1. GET ALL (Mengambil daftar latihan dengan Paging, Sort Nama A-Z, & Proteksi Halaman Kosong)
exports.getAllExercises = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalData = await Exercise.countDocuments();
        const totalPages = Math.ceil(totalData / limit);

        // Jika user meminta halaman yang melebihi total halaman yang ada
        if (page > totalPages && totalData > 0) {
            return res.status(404).json({
                currentPage: page,
                totalPages: totalPages,
                totalExercises: totalData,
                message: `Halaman ${page} tidak ditemukan. Data hanya tersedia sampai halaman ${totalPages}.`,
                detail: [] // SUDAH DISERASIKAN
            });
        }

        const data = await Exercise.find()
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalExercises: totalData,
            detail: data // UBAH 'data' MENJADI 'detail' AGAR SINKRON DENGAN WORKOUT LOG
        });

    } catch (error) {
        console.error("DEBUG GET ALL ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
    }
};

// 2. POST (Membuat latihan baru)
exports.createExercise = async (req, res) => {
    try {
        if (!req.body || !req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama latihan wajib diisi." });
        }

        const newExercise = new Exercise({
            name: req.body.name,
            muscle: req.body.muscle,
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

// 3. PUT (Partial Update - Hanya mengupdate field yang dikirim saja)
exports.updateExercise = async (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};
        const allowedFields = ['name', 'muscle', 'equipment', 'instructions', 'videoUrl', 'image'];

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

// 4. DELETE (Menghapus latihan berdasarkan ID)
exports.deleteExercise = async (req, res) => {
    try {
        const id = req.params.id;
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