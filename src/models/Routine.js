// models/Routine.js
const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    // Jika aplikasimu punya fitur login/user, pakai baris ini:
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    routineName: {
        type: String,
        required: true,
        trim: true
    },

    // Array latihan yang ada di dalam template ini
    exercises: [
        {
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true
            },
            // Target set default (tanpa perlu mencatat beban aktual di awal)
            targetSets: {
                type: Number,
                default: 1
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);