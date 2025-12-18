const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Medicine = require('../models/Medicine');
const multer = require('multer');
const Tesseract = require('tesseract.js'); // Import OCR
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// GET all medicines
router.get('/', auth, async (req, res) => {
    try {
        const medicines = await Medicine.find({ user: req.user.id });
        res.json(medicines);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST new medicine with OCR
router.post('/', [auth, upload.single('prescriptionImage')], async (req, res) => {
    let { name, dosage, time } = req.body;
    
    try {
        // OCR Logic: If image exists but name/dosage is missing, try to read it
        if (req.file && (!name || !dosage)) {
            console.log("🔍 Scanning image for text...");
            const imagePath = path.join(__dirname, '../', req.file.path);
            
            const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
            console.log("📄 Extracted Text:", text);

            // Simple Heuristic: First line is name, Second is dosage (You can improve this regex later)
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (!name && lines.length > 0) name = lines[0];
            if (!dosage && lines.length > 1) dosage = lines[1];
        }

        const newMedicine = new Medicine({
            user: req.user.id,
            name: name || 'Unknown Medicine',
            dosage: dosage || 'As prescribed',
            time,
            prescriptionImage: req.file ? req.file.path : ''
        });

        const medicine = await newMedicine.save();
        res.json(medicine);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// DELETE, PUT (Keep your existing delete/put routes here...)
// ... (Paste your previous DELETE and PUT routes here)
router.delete('/:id', auth, async (req, res) => { /* ... */ });
router.put('/:id/taken', auth, async (req, res) => { /* ... */ });

module.exports = router;