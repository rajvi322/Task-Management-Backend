const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Verify email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASSWORD not set in environment variables.");
  console.warn("   Email functionality will not work. Please configure your .env file.");
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com", // Gmail's SMTP server
  port: parseInt(process.env.EMAIL_PORT) || 587, // Use 465 for SSL, 587 for TLS
  secure: process.env.EMAIL_SECURE === "true" || false, // true for SSL (port 465), false for TLS (port 587)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
  // Additional options for better compatibility
  tls: {
    rejectUnauthorized: false, // For development only - set to true in production
  },
});

// Verify transporter configuration (optional, for debugging)
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ Email transporter verification failed:", error.message);
      console.error("   Make sure you're using an App Password for Gmail:");
      console.error("   1. Go to https://myaccount.google.com/apppasswords");
      console.error("   2. Generate an app password for 'Mail'");
      console.error("   3. Use that password in EMAIL_PASSWORD");
    } else {
      console.log("✅ Email transporter configured successfully");
    }
  });
}

// Export transporter
module.exports = transporter;
