const mongoose = require('mongoose');

// =========================================================================
// SAFE REGISTRATION FOR VERCEL SERVERLESS
// =========================================================================
// Jika karena satu hal model 'Exercise' belum dimuat oleh container Vercel,
// kita buatkan 'placeholder schema' kosong agar Mongoose tidak memicu MissingSchemaError.
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
            ref: 'Exercise', // Merujuk ke registrasi aman di atas
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);