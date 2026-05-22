const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 1. Konfigurasi dotenv paling atas
dotenv.config();

// Import Routes
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutLogRoutes = require('./routes/workoutLogRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 2. Middleware
app.use(express.json());
app.use('/images', express.static('public/uploads'));

// 3. Koneksi ke MongoDB Atlas (OPTIMASI SERVERLESS)
const connectDB = async () => {
    try {
        // Pengecekan koneksi: Jangan bikin koneksi baru kalau sudah ada yang aktif
        if (mongoose.connection.readyState >= 1) {
            console.log(' Menggunakan koneksi database yang sudah ada (Pool).');
            return;
        }

        console.log(' Mencoba menghubungkan ke MongoDB Atlas...');

        // Optimasi opsi koneksi untuk lingkungan Vercel
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout dalam 5 detik
            bufferCommands: false           // Matikan buffering agar tidak macet 10 detik
        });

        console.log(' Berhasil terhubung ke MongoDB Atlas!');
    } catch (err) {
        console.error(' Gagal koneksi ke database:', err.message);
    }
};

// Panggil fungsi koneksi
connectDB();

// 4. Routing
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/logs', workoutLogRoutes);

// 5. Jalankan Server
const PORT = process.env.PORT || 3000;

// Hanya jalankan app.listen jika TIDAK di lingkungan produksi (Vercel)
// Ini supaya kamu tetap bisa running 'npm run dev' di laptop (localhost)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(` Server lari di port ${PORT}`);
    });
}

// WAJIB ADA: Export app agar bisa dibaca oleh Vercel
module.exports = app;