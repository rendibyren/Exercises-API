const express = require('express');
const router = express.Router();
const Muscle = require('../models/Muscle');
const { protect } = require('../middleware/authMiddleware');

// POST: Tambah Otot Baru
router.post('/', protect, async (req, res) => {
    try {
        const newMuscle = new Muscle({ name: req.body.name });
        const saved = await newMuscle.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Gagal input nama otot", error: err.message });
    }
});

// GET: Ambil Semua Daftar Otot
router.get('/', async (req, res) => {
    const data = await Muscle.find().sort({ name: 1 });
    res.json(data);
});

module.exports = router;