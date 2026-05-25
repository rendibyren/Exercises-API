const mongoose = require('mongoose');

// PANTING & KHUSUS VERCEL: Paksa import model Exercise di sini agar skemanya langsung terdaftar global sebelum populate dijalankan
require('./Exercise');

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
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise', // Harus cocok dengan nama model yang diekspor
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);