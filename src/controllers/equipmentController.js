const Equipment = require('../models/Equipment');

// 1. POST: Tambah Alat Baru
exports.createEquipment = async (req, res) => {
    try {
        if (!req.body.name || req.body.name.trim() === "") {
            return res.status(400).json({ message: "Nama alat wajib diisi." });
        }
        const newEquip = new Equipment({ name: req.body.name });
        const saved = await newEquip.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Gagal input alat.", error: err.message });
    }
};

// 2. GET ALL
exports.getAllEquipments = async (req, res) => {
    try {
        const data = await Equipment.find().sort({ name: 1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data alat.", error: err.message });
    }
};

// 3. GET BY ID
exports.getEquipmentById = async (req, res) => {
    try {
        const data = await Equipment.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "Alat tidak ditemukan." });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Server error saat mengambil data alat.", error: error.message });
    }
};

// 4. UPDATE (PUT - Partial Update)
exports.updateEquipment = async (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};

        if (req.body.name !== undefined) {
            if (req.body.name.trim() === "") {
                return res.status(400).json({ message: "Nama alat tidak boleh kosong." });
            }
            updateFields.name = req.body.name;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data valid yang dikirim untuk diubah." });
        }

        const updated = await Equipment.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "ID alat tidak ditemukan." });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error saat update alat.", error: error.message });
    }
};

// 5. DELETE
exports.deleteEquipment = async (req, res) => {
    try {
        const deleted = await Equipment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Alat tidak ditemukan." });
        res.status(200).json({ message: "Alat berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: "Server error saat menghapus alat.", error: error.message });
    }
};