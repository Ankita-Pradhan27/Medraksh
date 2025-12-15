const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron'); // <--- IMPORT THIS
const Medicine = require('./models/Medicine'); // <--- IMPORT THIS to search DB

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ MongoDB Error:", err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));

// ============================================
//  ⏰ THE REMINDER SCHEDULER (New Code)
// ============================================
cron.schedule('* * * * *', async () => {
    // 1. Get current time in "HH:MM AM/PM" format
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    }); 
    
    console.log(`⏰ Checking for reminders at ${currentTime}...`);

    try {
        // 2. Find medicines that match this EXACT time
        const dueMedicines = await Medicine.find({ time: currentTime });

        // 3. Send Alert (Simulation)
        if (dueMedicines.length > 0) {
            dueMedicines.forEach(med => {
                console.log(`
                🔔 DING DING! REMINDER SENT! 🔔
                --------------------------------
                💊 Medicine: ${med.name}
                📝 Dosage:   ${med.dosage}
                👤 User ID:  ${med.user}
                --------------------------------
                `);
                
                // Optional: In a real app, you would send an email/SMS here.
            });
        }
    } catch (err) {
        console.error("Scheduler Error:", err);
    }
});
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));