const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const Medicine = require('./models/Medicine');
const User = require('./models/User'); 
const sendEmail = require('./utils/sendEmail'); 

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");

    // Only start the server if we are not in test mode and the file is run directly
    const PORT = process.env.PORT || 5000;
    if (require.main === module) {
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
    
    // Start Scheduler ONLY after DB is connected and not in test mode
    startScheduler();
})
.catch((err) => console.log("❌ MongoDB Error:", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
// app.use('/api/caregiver', require('./routes/caregiver')); // 👨‍⚕️ Caregiver Route (Commented out: File missing)


// ============================================
//  ⏰ 24-HOUR REMINDER SCHEDULER FUNCTION
// ============================================
function startScheduler() {
    if (process.env.NODE_ENV !== 'test') {
        cron.schedule('* * * * *', async () => {
            const now = new Date();
            
            // Use 'en-GB' for 24-hour format (e.g., "14:30")
            const currentTime = now.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit'
            }); 
            
            console.log(`⏰ Checking for reminders at ${currentTime}...`);

            try {
                // Find medicines scheduled for this specific time
                const dueMedicines = await Medicine.find({ time: currentTime }).populate('user');

                if (dueMedicines.length > 0) {
                    dueMedicines.forEach(async (med) => {
                        if (med.user && med.user.email) {
                            console.log(`🔔 Sending email to ${med.user.email} for ${med.name}`);
                            
                            const message = `
                                🔔 MEDRAKSH REMINDER 🔔
                                --------------------------------
                                It is time to take your medicine:
                                💊 Name: ${med.name}
                                📝 Dosage: ${med.dosage}
                                
                                Please mark it as taken in the app.
                            `;
                            
                            // Send the actual email
                            await sendEmail(med.user.email, `Medicine Reminder: ${med.name}`, message);
                        }
                    });
                }
            } catch (err) {
                console.error("Scheduler Error:", err);
            }
        });
    }
}
// ============================================

module.exports = app;