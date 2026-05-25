const mongoose = require('mongoose');

// =========================================================================
// 1. REGISTRASI SAKTI: Deklarasikan Skema Master Exercise di Sini
// =========================================================================
const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    muscles: [
        {
            muscleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Muscle',
                required: true
            },
            percentage: {
                type: Number,
                required: true,
                min: 1,
                max: 100
            }
        }
    ],
    instructions: {
        type: [String],
        default: []
    },
    videoUrl: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Ekspor/Daftarkan model Exercise secara global ke memori Mongoose
if (!mongoose.models.Exercise) {
    mongoose.model('Exercise', ExerciseSchema);
}

// =========================================================================
// 2. SKEMA UTAMA: WorkoutLogSchema
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
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);