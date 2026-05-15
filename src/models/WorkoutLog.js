const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workoutName: { type: String, default: "Morning Workout" },
    date: { type: Date, default: Date.now },
    duration: { type: Number }, // dalam menit
    exercises: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        name: { type: String }, // Backup nama jika exerciseId dihapus
        sets: [{
            reps: { type: Number },
            weight: { type: Number },
            isCompleted: { type: Boolean, default: false }
        }]
    }]
});

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);