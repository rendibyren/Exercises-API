const Muscle = require('../models/Muscle');

// 1. POST: Tambah Otot Baru
exports.createMuscle = async (req, res) => {
    try {
        if (!req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama otot wajib diisi." });
        }
        const newMuscle = new Muscle({ name: req.body.name });
        const saved = await newMuscle.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Gagal input nama otot.", error: err.message });
    }
};

// 2. GET ALL: Ambil Semua Daftar Otot
exports.getAllMuscles = async (req, res) => {
    try {
        const data = await Muscle.find().sort({ name: 1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data otot.", error: err.message });
    }
};

// 3. GET BY ID
exports.getMuscleById = async (req, res) => {
    try {
        const data = await Muscle.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "Otot tidak ditemukan." });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Server error saat mengambil data otot.", error: error.message });
    }
};

// 4. UPDATE (PUT - Partial Update)
exports.updateMuscle = async (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};

        if (req.body.name !== undefined) {
            if (req.body.name.trim() === "") {
                return res.status(400).json({ message: "Nama otot tidak boleh kosong." });
            }
            updateFields.name = req.body.name;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data valid yang dikirim untuk diubah." });
        }

        const updated = await Muscle.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "ID otot tidak ditemukan." });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error saat update otot.", error: error.message });
    }
};

// 5. DELETE
exports.deleteMuscle = async (req, res) => {
    try {
        const deleted = await Muscle.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Otot tidak ditemukan." });
        res.status(200).json({ message: "Otot berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: "Server error saat menghapus otot.", error: error.message });
    }
};