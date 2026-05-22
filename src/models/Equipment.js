const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Mencegah nama alat ganda (misal 'Dumbbell' dua kali)
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', EquipmentSchema);