const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // REFERENSI KE TABEL MUSCLE + PERSENTASE
    muscles: [
        {
            muscleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Muscle',
                required: true
            },
            percentage: {
                type: Number,
                required: true
            }
        }
    ],
    // REFERENSI KE TABEL EQUIPMENT (Cukup ambil ID-nya saja)
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    instructions: { type: String },
    videoUrl: { type: String },
    image: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Exercise', ExerciseSchema);