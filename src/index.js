const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // <-- 1. IMPORT CORS DI SINI

// 1. Konfigurasi dotenv paling atas
dotenv.config();

// Import Routes
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutLogRoutes = require('./routes/workoutLogRoutes');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const muscleRoutes = require('./routes/muscleRoutes');

const app = express();

// 2. Middleware Dasar & CORS
// Buka pintu gerbang agar Frontend React (localhost) bisa masuk
app.use(cors({
    origin: '*', // Mengizinkan semua domain mengakses API ini
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/images', express.static('public/uploads'));

// 3. Fungsi Koneksi MongoDB dengan Mekanisme Caching + Registrasi Model Paksa
const connectDB = async () => {
    // Jika koneksi sudah ada atau sedang menghubungkan, gunakan yang sudah ada
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    console.log('--- Membuka koneksi baru ke MongoDB Atlas ---');
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
    });

    // =========================================================================
    // SOLUSI PAMUNGKAS VERCEL: Paksa Registrasi Skema Tepat Setelah Koneksi DB Terbuka
    // Ini menjamin model terdaftar di memori global sebelum controller berjalan!
    // =========================================================================
    mongoose.model('User', require('./models/User').schema || require('./models/User'));
    mongoose.model('Muscle', require('./models/Muscle').schema || require('./models/Muscle'));
    mongoose.model('Equipment', require('./models/Equipment').schema || require('./models/Equipment'));
    mongoose.model('Exercise', require('./models/Exercise').schema || require('./models/Exercise'));
    mongoose.model('WorkoutLog', require('./models/WorkoutLog').schema || require('./models/WorkoutLog'));
    // =========================================================================
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
app.use('/api/equipments', equipmentRoutes);
app.use('/api/muscles', muscleRoutes);

// 6. Jalankan Server Lokal
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server lari di port ${PORT}`);
    });
}

// Export app untuk Vercel
module.exports = app;