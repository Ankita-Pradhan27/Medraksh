const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:         { type: String, required: true },
    dosage:       { type: String, required: true }, // e.g., "1 Tablet"
    time:         { type: String, required: true }, // e.g., "08:00 AM"
    reminderSent: { type: Boolean, default: false },
    prescriptionImage: { type: String } // Path to the uploaded file
});

module.exports = mongoose.model('Medicine', MedicineSchema);