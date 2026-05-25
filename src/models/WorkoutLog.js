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
    isCompleted: { // Pastikan field ini ada di skema kamu
        type: Boolean,
        default: false
    },
    exercises: [
        {
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId, // WAJIB BERBENTUK OBJECTID
                ref: 'Exercise', // WAJIB MERUJUK KE MODEL EXERCISE KAMU
                required: true
            },
            sets: [
                {
                    reps: { type: Number, required: true },
                    weight: { type: Number, default: 0 }
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);