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
    },
    image: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null jika ini gerakan bawaan sistem (global)
    }
}, { timestamps: true });

module.exports = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);