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
        type: Number, // Durasi latihan dalam hitungan menit
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false // Otomatis false saat mulai latihan
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise', // Referensi murni ke model master Exercise
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 } // Beban dalam Kg/Lbs
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);