const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        // Create a transporter (Use your own Gmail credentials or Ethereal for testing)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Set this in .env
                pass: process.env.EMAIL_PASS  // Set this in .env (App Password, not login password)
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('❌ Email Error:', error);
    }
};

module.exports = sendEmail;