const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    muscles: [{
        muscleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Muscle',
            required: true
        }
    }],
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    instructions: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        default: ""
    }
    // === FIELD user & image SUDAH DIHAPUS TOTAL DI SINI ===
}, { timestamps: true });

module.exports = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);