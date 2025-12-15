const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Medicine = require("../models/Medicine");
const multer = require("multer");

// Setup File Upload Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// GET all medicines for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user.id });
    res.json(medicines);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// POST a new medicine (with optional image)
router.post(
  "/",
  [auth, upload.single("prescriptionImage")],
  async (req, res) => {
    const { name, dosage, time } = req.body;
    try {
      const newMedicine = new Medicine({
        user: req.user.id,
        name,
        dosage,
        time,
        prescriptionImage: req.file ? req.file.path : "", // Save file path if uploaded
      });

      const medicine = await newMedicine.save();
      res.json(medicine);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
);

// DELETE a medicine
router.delete("/:id", auth, async (req, res) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ msg: "Medicine not found" });

    // Ensure user owns this medicine
    if (medicine.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ msg: "Medicine removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// MARK AS TAKEN (Updated for History)
router.put("/:id/taken", auth, async (req, res) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ msg: "Medicine not found" });

    const now = new Date();

    // Update lastTaken AND push to history array
    medicine.lastTaken = now;
    medicine.history.push(now);

    await medicine.save();
    res.json(medicine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
