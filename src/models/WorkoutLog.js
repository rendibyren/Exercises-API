const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
    // Referensi ke pengguna (aktifkan kalau fitur login/auth sudah jalan)
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // 1. KUNCI RELASI: Referensi ke Template Routine (Bisa null kalau latihan bebas)
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine',
        default: null
    },

    // 2. Nama Sesi Latihan Aktual (Biasanya menyalin nama Routine, tapi user bisa ubah misal: "Push Day (Lagi Capek)")
    workoutName: {
        type: String,
        required: true,
        default: 'Active Workout'
    },

    // 3. Durasi nyata saat stopwatch berjalan (dalam detik/menit)
    duration: {
        type: Number,
        default: 0
    },

    // 4. Status apakah latihan ini diselesaikan atau dibatalkan di tengah jalan
    isCompleted: {
        type: Boolean,
        default: false
    },

    // 5. KENYATAAN LATIHAN: Di sini kita simpan beban dan repetisi ASLI yang diangkat hari itu
    exercises: [
        {
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true
            },
            sets: [
                {
                    reps: { type: Number, default: 0 },
                    weight: { type: Number, default: 0 }, // Beban aktual (Lbs/Kg)
                    isCompleted: { type: Boolean, default: false } // Apakah set ini dicentang hijau
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);