const mongoose = require('mongoose');

const MuscleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Mencegah nama otot ganda (misal 'Chest' dua kali)
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Muscle', MuscleSchema);