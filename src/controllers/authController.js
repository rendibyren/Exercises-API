const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. REGISTER
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username dan password wajib diisi." });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: "User berhasil didaftarkan!" });
    } catch (error) {
        console.error("DEBUG REGISTER ERROR:", error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Username sudah digunakan, silakan pilih yang lain." });
        }

        res.status(400).json({
            message: "Gagal register",
            error: error.message
        });
    }
};

// 2. LOGIN 
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username dan password wajib diisi." });
        }

        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Konfigurasi server (JWT_SECRET) hilang." });
        }

        // Buat token JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login berhasil!",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error("DEBUG LOGIN ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat login.", error: error.message });
    }
};