const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail's SMTP server
  port: 587, // Use 465 for SSL, 587 for TLS
  secure: false, // true for SSL, false for TLS
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Export transporter
module.exports = transporter;
