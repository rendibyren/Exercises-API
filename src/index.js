const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 1. Konfigurasi dotenv paling atas
dotenv.config();

// =========================================================================
// REGISTRASI MASAL MODEL MONGOOSE (SOLUSI MUTLAK UNTUK SERVERLESS POPULATE)
// =========================================================================
// Dengan me-require semua skema di file entri utama, Mongoose akan mengunci
// blueprint model ke memori global Vercel sebelum request API diproses.
require('./models/User');
require('./models/Muscle');
require('./models/Equipment');
require('./models/Exercise');
require('./models/WorkoutLog');
// =========================================================================

// Import Routes
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutLogRoutes = require('./routes/workoutLogRoutes');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes'); // Import Rute Equipment
const muscleRoutes = require('./routes/muscleRoutes');       // Import Rute Muscle

const app = express();

// 2. Middleware Dasar
app.use(express.json());
app.use('/images', express.static('public/uploads'));

// 3. Fungsi Koneksi MongoDB dengan Mekanisme Caching (Standar Serverless)
const connectDB = async () => {
    // Jika koneksi sudah ada atau sedang menghubungkan, gunakan yang sudah ada
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    console.log('--- Membuka koneksi baru ke MongoDB Atlas ---');
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000, // Memberikan waktu 8 detik untuk jabat tangan jaringan
    });
};

// 4. Middleware Kunci: Memaksa Vercel menunggu koneksi DB selesai sebelum masuk ke rute API
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Koneksi Serverless gagal ditunggu:', err.message);
        res.status(500).json({
            message: "Gagal terhubung ke database cloud.",
            error: err.message
        });
    }
});

// 5. Routing
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/logs', workoutLogRoutes);
app.use('/api/equipments', equipmentRoutes); // Daftarkan Rute Master Alat
app.use('/api/muscles', muscleRoutes);       // Daftarkan Rute Master Otot

// 6. Jalankan Server Lokal
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(` Server lari di port ${PORT}`);
    });
}

// WAJIB ADA: Export app untuk Vercel
module.exports = app;