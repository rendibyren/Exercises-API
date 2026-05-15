const Exercise = require('../models/Exercise');

// 1. GET ALL
exports.getAllExercises = async (req, res) => {
    try {
        const data = await Exercise.find();
        res.status(200).json(data);
    } catch (error) {
        console.error("DEBUG GET ALL ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server.", error: error.message });
    }
};

// 2. POST (SUDAH DIPERBAIKI)
exports.createExercise = async (req, res) => {
    try {
        // Cek apakah body ada
        if (!req.body || !req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama latihan wajib diisi." });
        }

        // Ambil semua field dari req.body sesuai keinginanmu tadi
        const newExercise = new Exercise({
            name: req.body.name,
            muscle: req.body.muscle,
            equipment: req.body.equipment,
            instructions: req.body.instructions,
            videoUrl: req.body.videoUrl,
            image: req.body.image,
            user: req.user ? req.user.id : null // Menangkap ID user dari middleware protect
        });

        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (error) {
        // KODE DEBUG: Agar muncul di Log Vercel dan Postman
        console.error("DEBUG POST ERROR:", error);
        res.status(500).json({
            message: "Gagal menyimpan data ke database.",
            error: error.message // Ini penting buat tau kenapa Atlas nolak
        });
    }
};

// 3. PUT (Update)
exports.updateExercise = async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Exercise.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updated) {
            return res.status(404).json({ message: "ID tidak ditemukan." });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error("DEBUG PUT ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat update.", error: error.message });
    }
};

// 4. DELETE
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