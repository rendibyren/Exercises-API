const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// 1. Konfigurasi dotenv paling atas
dotenv.config();

// Import Routes
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutLogRoutes = require('./routes/workoutLogRoutes');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const muscleRoutes = require('./routes/muscleRoutes');
const routineRoutes = require('./routes/routineRoutes'); // <--- TAMBAHAN 1: Import Routine Routes

const app = express();

// 2. Middleware Dasar & CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/images', express.static('public/uploads'));

// 3. Fungsi Koneksi MongoDB dengan Mekanisme Caching + Registrasi Model Paksa
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    console.log('--- Membuka koneksi baru ke MongoDB Atlas ---');
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
    });

    // =========================================================================
    // SOLUSI PAMUNGKAS VERCEL
    // =========================================================================
    mongoose.model('User', require('./models/User').schema || require('./models/User'));
    mongoose.model('Muscle', require('./models/Muscle').schema || require('./models/Muscle'));
    mongoose.model('Equipment', require('./models/Equipment').schema || require('./models/Equipment'));
    mongoose.model('Exercise', require('./models/Exercise').schema || require('./models/Exercise'));
    mongoose.model('WorkoutLog', require('./models/WorkoutLog').schema || require('./models/WorkoutLog'));
    mongoose.model('Routine', require('./models/Routine').schema || require('./models/Routine')); // <--- TAMBAHAN 2: Daftarkan Model Routine
    // =========================================================================
};

// 4. Middleware Kunci: Memaksa Vercel menunggu koneksi DB
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
app.use('/api/routines', routineRoutes); // <--- TAMBAHAN 3: Daftarkan Endpoint /api/routines

// 6. Jalankan Server Lokal
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server lari di port ${PORT}`);
    });
}

// Export app untuk Vercel
module.exports = app;