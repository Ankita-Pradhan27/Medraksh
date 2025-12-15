const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron"); // <--- IMPORT THIS
const Medicine = require("./models/Medicine"); // <--- IMPORT THIS to search DB
const User = require("./models/User"); // Import User model
const sendEmail = require("./utils/emailService");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/medicines", require("./routes/medicines"));

// ============================================
//  ⏰ UPDATED REMINDER SCHEDULER (With Email)
// ============================================
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  console.log(`⏰ Checking reminders for ${currentTime}...`);

  try {
    // Populate the 'user' field to access the email
    const dueMedicines = await Medicine.find({ time: currentTime }).populate(
      "user"
    );

    if (dueMedicines.length > 0) {
      dueMedicines.forEach(async (med) => {
        // Check if user and email exist
        if (med.user && med.user.email) {
          const emailContent = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                            <h2 style="color: #0061f2;">🔔 Medicine Reminder</h2>
                            <p>Hello,</p>
                            <p>It's time to take your medicine:</p>
                            <table style="width: 100%; text-align: left;">
                                <tr><th>Medicine:</th><td><strong>${med.name}</strong></td></tr>
                                <tr><th>Dosage:</th><td>${med.dosage}</td></tr>
                                <tr><th>Time:</th><td>${med.time}</td></tr>
                            </table>
                            <p>Please log in to your dashboard to mark it as taken.</p>
                            <a href="http://localhost:3000" style="background: #0061f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                        </div>
                    `;

          await sendEmail(
            med.user.email,
            `REMINDER: Take ${med.name}`,
            emailContent
          );
        }
      });
    }
  } catch (err) {
    console.error("Scheduler Error:", err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
