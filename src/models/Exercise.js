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
    // Deklarasikan array exercises secara lugas dan bersih agar Mongoose tidak bingung memetakan path relasinya
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise', // WAJIB SAMA PERSIS dengan string ekspor di model Exercise.js
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);