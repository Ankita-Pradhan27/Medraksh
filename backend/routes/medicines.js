const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Medicine = require('../models/Medicine');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');

// Setup File Upload Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// GET all medicines for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        // Sort by time so they appear in order
        const medicines = await Medicine.find({ user: req.user.id }).sort({ time: 1 });
        res.json(medicines);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST a new medicine (with OCR)
router.post('/', [auth, upload.single('prescriptionImage')], async (req, res) => {
    let { name, dosage, time } = req.body;
    
    try {
        // OCR Logic
        if (req.file && (!name || !dosage)) {
            console.log("🔍 Scanning image for text...");
            const imagePath = path.join(__dirname, '../', req.file.path);
            
            const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
            console.log("📄 Extracted Text:", text);

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

// DELETE a medicine
router.delete('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        
        if (!medicine) {
            return res.status(404).json({ msg: 'Medicine not found' });
        }

        // Check user authorization
        if (medicine.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this medicine' });
        }

        await Medicine.findByIdAndDelete(req.params.id);
        
        console.log(`🗑️ Medicine deleted: ${req.params.id}`);
        res.json({ msg: 'Medicine removed' });
    } catch (err) {
        console.error("Delete Error:", err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Medicine not found' });
        }
        res.status(500).send('Server Error');
    }
});

// PUT Mark as Taken
router.put('/:id/taken', auth, async (req, res) => {
    try {
        let medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ msg: 'Medicine not found' });

        // Update lastTaken to NOW
        medicine.lastTaken = new Date();
        
        await medicine.save();
        
        console.log(`✅ Marked as taken: ${medicine.name}`);
        res.json(medicine);
    } catch (err) {
        console.error("Mark Taken Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;