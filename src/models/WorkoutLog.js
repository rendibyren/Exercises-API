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
        type: Number, // dalam satuan menit
        default: 0
    },
    exercises: [
        {
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true
            },
            name: { // TAMBAHKAN INI agar teks nama latihan bisa ikut disimpan/muncul murni
                type: String
            },
            sets: [
                {
                    reps: { type: Number, required: true },
                    weight: { type: Number, default: 0 } // berat beban dalam kg
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);