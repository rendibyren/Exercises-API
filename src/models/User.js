const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// Middleware sebelum simpan ke database
userSchema.pre('save', async function () {
    // 1. Cek apakah password dimodifikasi (saat register atau ganti password)
    if (!this.isModified('password')) return;

    // 2. Hash password tanpa perlu memanggil next()
    this.password = await bcrypt.hash(this.password, 10);

    // Di Mongoose modern, cukup sampai sini jika menggunakan async function
});

module.exports = mongoose.model('User', userSchema);