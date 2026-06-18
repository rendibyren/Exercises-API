const Routine = require('../models/Routine');

// 1. POST: Tambah Routine Baru
exports.createRoutine = async (req, res) => {
    try {
        if (!req.body.routineName || req.body.routineName.trim() === "") {
            return res.status(400).json({ message: "Nama routine wajib diisi." });
        }
        const newRoutine = new Routine({
            routineName: req.body.routineName,
            exercises: req.body.exercises || [] // Default array kosong jika belum ada latihan
        });
        const saved = await newRoutine.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Gagal input routine.", error: err.message });
    }
};

// 2. GET ALL
exports.getAllRoutines = async (req, res) => {
    try {
        // Menggunakan populate agar detail dari id exercise (nama, jenis alat, otot) ikut ditarik
        const data = await Routine.find()
            .populate('exercises.exerciseId')
            .sort({ routineName: 1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data routine.", error: err.message });
    }
};

// 3. GET BY ID
exports.getRoutineById = async (req, res) => {
    try {
        const data = await Routine.findById(req.params.id).populate('exercises.exerciseId');
        if (!data) return res.status(404).json({ message: "Routine tidak ditemukan." });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Server error saat mengambil data routine.", error: error.message });
    }
};

// 4. UPDATE (PUT - Partial Update)
exports.updateRoutine = async (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = {};

        // Validasi jika user mengirimkan update nama
        if (req.body.routineName !== undefined) {
            if (req.body.routineName.trim() === "") {
                return res.status(400).json({ message: "Nama routine tidak boleh kosong." });
            }
            updateFields.routineName = req.body.routineName;
        }

        // Jika user ingin mengupdate daftar latihannya
        if (req.body.exercises !== undefined) {
            updateFields.exercises = req.body.exercises;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Tidak ada data valid yang dikirim untuk diubah." });
        }

        const updated = await Routine.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate('exercises.exerciseId');

        if (!updated) return res.status(404).json({ message: "ID routine tidak ditemukan." });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Server error saat update routine.", error: error.message });
    }
};

// 5. DELETE
exports.deleteRoutine = async (req, res) => {
    try {
        const deleted = await Routine.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Routine tidak ditemukan." });
        res.status(200).json({ message: "Routine berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: "Server error saat menghapus routine.", error: error.message });
    }
};