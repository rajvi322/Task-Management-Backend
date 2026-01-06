const express = require("express");

const AuthController = require("../controller/Auth");

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.get("/verify-email", AuthController.verifyEmail); // Changed to GET for link-based verification
router.post("/resend-verification-link", AuthController.resendVerificationLink);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
