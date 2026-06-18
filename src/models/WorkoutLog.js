const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
    // === KUNCI PERBAIKAN: Aktifkan field user agar diakui oleh Mongoose ===
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // 1. KUNCI RELASI: Referensi ke Template Routine (Bisa null kalau latihan bebas)
    routineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine',
        default: null
    },

    // 2. Nama Sesi Latihan Aktual
    workoutName: {
        type: String,
        required: true,
        default: 'Active Workout'
    },

    // 3. Durasi nyata saat stopwatch berjalan (dalam detik)
    duration: {
        type: Number,
        default: 0
    },

    // 4. Status apakah latihan ini diselesaikan
    isCompleted: {
        type: Boolean,
        default: false
    },

    // 5. KENYATAAN LATIHAN: Menyimpan beban dan repetisi ASLI
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
                    weight: { type: Number, default: 0 },
                    isCompleted: { type: Boolean, default: false }
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);