const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    muscle: {
        type: String,
        required: true
    }, // Contoh: Chest, Back, Legs
    equipment: {
        type: String,
        required: true
    }, // Contoh: Barbell, Dumbbell, Bodyweight
    instructions: {
        type: String
    }, // Penjelasan cara melakukan gerakan
    videoUrl: {
        type: String
    }, // Link video (YouTube/dll)
    image: {
        type: String
    }, // Nama file atau link gambar
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    } // Opsional: Untuk menandai siapa yang menambahkan
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);