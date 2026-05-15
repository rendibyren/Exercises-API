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

// 3. Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' Terhubung ke MongoDB Atlas!'))
    .catch((err) => {
        console.error(' Gagal koneksi ke database:');
        console.error(err.message);
    });

// 4. Routing
app.use('/api/auth', authRoutes); // Pindahkan ke atas agar rapi
app.use('/api/exercises', exerciseRoutes);
app.use('/api/logs', workoutLogRoutes);

// 5. Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server lari di port ${PORT}`);
    console.log(` Auth API: http://localhost:${PORT}/api/auth`);
});