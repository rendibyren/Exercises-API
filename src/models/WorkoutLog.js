const mongoose = require('mongoose');

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
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    // Deklarasi array yang bersih dan lugas agar populate path 'exercises.exerciseId' terbaca sempurna
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise', // Memastikan rujukan kuat ke model Exercise master
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 } // berat dalam kg
        }]
    }]
}, { timestamps: true });

// PROTEKSI UTAMA VERCEL: Mencegah OverwriteModelError saat fungsi serverless dicompile ulang
module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);