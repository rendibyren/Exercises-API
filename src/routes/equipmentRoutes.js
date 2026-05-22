const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect } = require('../middleware/authMiddleware');

// POST: Tambah Alat Baru
router.post('/', protect, async (req, res) => {
    try {
        const newEquip = new Equipment({ name: req.body.name });
        const saved = await newEquip.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Gagal input alat", error: err.message });
    }
});

// GET: Ambil Semua Daftar Alat
router.get('/', async (req, res) => {
    const data = await Equipment.find().sort({ name: 1 });
    res.json(data);
});

module.exports = router;