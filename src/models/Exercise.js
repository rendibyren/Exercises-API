const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bodyPart: { type: String, required: true }, // Contoh: Chest, Back
    equipment: { type: String, required: true }, // Contoh: Dumbbell, Machine
    target: { type: String }, // Otot spesifik: Triceps, Lats
    gifUrl: { type: String }, // Link gambar/animasi gerakan
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Siapa yang buat (opsional)
});

module.exports = mongoose.model('Exercise', exerciseSchema);