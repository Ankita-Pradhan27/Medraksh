const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:         { type: String, required: true },
    dosage:       { type: String, required: true },
    time:         { type: String, required: true }, // Stored as "14:30" (24h string)
    lastTaken:    { type: Date, default: null }, 
    prescriptionImage: { type: String }
});

module.exports = mongoose.model('Medicine', MedicineSchema);