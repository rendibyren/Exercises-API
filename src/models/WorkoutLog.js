const mongoose = require('mongoose');

// =========================================================================
// SOLUSI ABSOLUT VERCEL: Placeholder Registration untuk Semua Model Relasi
// =========================================================================
// Jika container Vercel amnesia dan belum memuat model-model ini, kita buatkan
// registrasi skema fleksibel kosong agar Mongoose tidak memicu MissingSchemaError.
if (!mongoose.models.Equipment) {
    mongoose.model('Equipment', new mongoose.Schema({}, { strict: false }));
}

if (!mongoose.models.Muscle) {
    mongoose.model('Muscle', new mongoose.Schema({}, { strict: false }));
}

if (!mongoose.models.Exercise) {
    mongoose.model('Exercise', new mongoose.Schema({}, { strict: false }));
}
// =========================================================================

const WorkoutLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workoutName: {
        type: String,
        default: 'Custom Workout'
    },
    duration: {
        type: Number, // Durasi latihan dalam hitungan menit
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false // Otomatis false saat mulai latihan, jadi true kalau user klik selesai
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise', // Referensi aman ke placeholder/model asli di atas
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 } // Beban dalam Kg/Lbs
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);