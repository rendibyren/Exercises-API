const Exercise = require('../models/Exercise');

// 1. GET ALL
exports.getAllExercises = async (req, res) => {
    try {
        // Ganti 'exercises' (variabel lama) dengan 'await Exercise.find()'
        const data = await Exercise.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// 2. POST
exports.createExercise = async (req, res) => {
    try {
        if (!req.body || !req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama latihan wajib diisi." });
        }

        // Simpan langsung ke MongoDB
        const newExercise = new Exercise({
            name: req.body.name,
            muscle: req.body.muscle || "Unknown"
        });

        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (error) {
        res.status(500).json({ message: "Gagal menyimpan data ke database." });
    }
};

// 3. PUT (Update)
exports.updateExercise = async (req, res) => {
    try {
        const id = req.params.id;
        // Menggunakan findByIdAndUpdate milik Mongoose
        const updated = await Exercise.findByIdAndUpdate(id, req.body, { new: true });

        if (!updated) {
            return res.status(404).json({ message: "ID tidak ditemukan." });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server saat update." });
    }
};

// 4. DELETE
exports.deleteExercise = async (req, res) => {
    try {
        const id = req.params.id;
        // Menggunakan findByIdAndDelete milik Mongoose
        const deleted = await Exercise.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Data tidak ditemukan." });
        }

        res.status(200).json({ message: `Latihan berhasil dihapus.` });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus." });
    }
};