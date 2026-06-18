const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Import mongoose untuk validasi ObjectId

// 1. REGISTER
exports.register = async (req, res) => {
    try {
        // Ekstrak properti 'name' dari request body frontend
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ message: "Nama lengkap, username, dan password wajib diisi." });
        }

        const user = new User({ name, username, password });
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
                name: user.name, // Kembalikan data nama agar bisa disimpan langsung di local storage frontend
                username: user.username
            }
        });
    } catch (error) {
        console.error("DEBUG LOGIN ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat login.", error: error.message });
    }
};

// 3. GET PROFILE (Milik user yang sedang login)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("DEBUG GET PROFILE ERROR:", error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat mengambil data profil.",
            error: error.message
        });
    }
};

// 4. SELECT ALL: Mengambil semua daftar pengguna di aplikasi
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("DEBUG SELECT ALL USERS ERROR:", error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat mengambil semua user.",
            error: error.message
        });
    }
};

// 5. SELECT BY ID: Mengambil detail satu user spesifik berdasarkan ID
exports.getUserById = async (req, res) => {
    try {
        const id = req.params.id;

        // Validasi format ID MongoDB sebelum menembak database
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format ID user tidak valid." });
        }

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("DEBUG SELECT USER BY ID ERROR:", error);
        res.status(500).json({
            message: "Terjadi kesalahan server saat mengambil data user berdasarkan ID.",
            error: error.message
        });
    }
};