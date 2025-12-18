const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: String, required: true },

  // Tracks the most recent time taken
  lastTaken: { type: Date, default: null },

  // NEW: Stores a complete history of all dates/times taken for analytics
  history: [{ type: Date }],

  prescriptionImage: { type: String },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
