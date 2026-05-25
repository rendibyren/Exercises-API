const mongoose = require('mongoose');

if (!mongoose.models.Exercise) {
    // Jika belum ada, buat skema minimal yang berisi field relasi agar populate tidak kosong
    const EmergencyExerciseSchema = new mongoose.Schema({
        name: { type: String, required: true },
        equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        muscles: [{
            muscleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Muscle' },
            percentage: { type: Number }
        }],
        instructions: [String],
        videoUrl: String,
        image: String
    });
    mongoose.model('Exercise', EmergencyExerciseSchema);
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
            ref: 'Exercise', // Merujuk aman ke model yang sudah dipastikan ada di atas
            required: true
        },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, default: 0 }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);