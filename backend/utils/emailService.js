const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Create Transporter (Using Gmail as an example)
    // For production, use SendGrid, Mailgun, or an App Password for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Add this to your .env file
        pass: process.env.EMAIL_PASS, // Add this to your .env file
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

module.exports = sendEmail;
