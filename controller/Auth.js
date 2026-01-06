const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../helpers/utils");
const transporter = require("../helpers/mailer");
const OTP = require("../models/otpModel");
const user = require("../models/user");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await User.findOne({ email: email });
    if (userFound) {
      // Check if email is verified
      if (!userFound.isVerified) {
        return res.status(403).json({
          message: "Please verify your email address before logging in. Check your inbox for the verification link.",
          status: 0,
          requiresVerification: true,
        });
      }

      bcrypt.compare(password, userFound.password, function (err, same) {
        if (same) {
          const accessToken = jwt.sign(
            { id: userFound._id },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          const refreshToken = jwt.sign(
            {
              id: userFound._id,
              email: userFound.email,
            },
            process.env.JWT_REFRESH_SECRET,
            {
              expiresIn: "7d",
            }
          );
          return res.status(200).json({
            message: "Login sucessfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            status: 1,
          });
        } else {
          return res.status(400).json({
            message: "Password does not match. Please try again",
            status: 0,
          });
        }
      });
    } else {
      return res.status(404).json({
        message: "user not found",
        status: 0,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      status: 0,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });

    if (userFound) {
      return res.status(409).json({
        message: "The user already exists",
        status: 0,
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        message: "Password is required",
        status: 0,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create user first (we'll verify email via link)
    const newUser = await new User({
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      isVerified: false, // User needs to verify email
    }).save();

    // Generate verification token (JWT)
    const verificationToken = jwt.sign(
      { 
        userId: newUser._id,
        email: newUser.email,
        type: "email-verification"
      },
      process.env.JWT_SECRET || process.env.JWT_VERIFICATION_SECRET || "verification-secret",
      {
        expiresIn: "24h", // Link valid for 24 hours
      }
    );

    // Create verification link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: "Verify Your Email Address",
      text: `Welcome! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1976d2;">Welcome to Productivity App!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <p>Click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    // Send verification email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {
          console.error("Error sending verification email:", err);
          // Delete the user if email fails to send
          await User.findByIdAndDelete(newUser._id);
          return res.status(500).json({
            message: "Failed to send verification email. Please check your email configuration or try again later.",
            error: process.env.NODE_ENV === "development" ? err.message : "Email service unavailable",
            status: 0,
          });
        }

        try {
          console.log("Verification email sent:", info.response);
          return res.status(201).json({
            message: "Sign up successful. Please check your email and click the verification link to activate your account.",
            status: 1,
            requiresVerification: true,
          });
        } catch (dbError) {
          console.error("Error after email sent:", dbError);
          return res.status(500).json({
            message: "Account creation failed. Please try again.",
            error: dbError.message,
            status: 0,
          });
        }
      });
    });
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({
      error: e.message,
      status: 0,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userFound = await User.findOne({ email: email });
    console.log(email, "email===>>>>>", userFound);
    if (userFound) {
      const newOtp = generateOTP(4);
      console.log(newOtp, "otp==>>>>");
      await OTP.findOneAndUpdate(
        { email: email },
        { email: email, otp: newOtp },
        { upsert: true, new: true }
      );
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${newOtp}. This OTP is valid for 10 minutes.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          return res.status(500).json({
            message: "Failed to send OTP email",
            status: 0,
          });
        }
        console.log("Email sent:", info.response);
        return res.status(200).json({
          message: "OTP sent successfully",
          status: 1,
        });
      });
    } else {
      return res.status(404).json({
        message: "User not found",
        status: 0,
      });
    }
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      status: 0,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query; // Get token from query parameter (for GET request)
    
    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
        status: 0,
      });
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || process.env.JWT_VERIFICATION_SECRET || "verification-secret"
      );
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(400).json({
          message: "Verification link has expired. Please sign up again to receive a new link.",
          status: 0,
        });
      }
      return res.status(400).json({
        message: "Invalid verification token.",
        status: 0,
      });
    }

    // Check if token is for email verification
    if (decoded.type !== "email-verification") {
      return res.status(400).json({
        message: "Invalid verification token type.",
        status: 0,
      });
    }

    // Find and verify the user
    const userFound = await User.findById(decoded.userId);

    if (!userFound) {
      return res.status(404).json({
        message: "User not found",
        status: 0,
      });
    }

    // Check if already verified
    if (userFound.isVerified) {
      return res.status(200).json({
        message: "Email is already verified. You can log in now.",
        status: 1,
        alreadyVerified: true,
      });
    }

    // Verify the user's email
    await User.findByIdAndUpdate(decoded.userId, { isVerified: true });

    return res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      status: 1,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again later.",
      status: 0,
    });
  }
};

exports.resendVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        status: 0,
      });
    }

    const userFound = await User.findOne({ email });
    
    if (!userFound) {
      return res.status(404).json({
        message: "User not found",
        status: 0,
      });
    }

    if (userFound.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        status: 0,
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { 
        userId: userFound._id,
        email: userFound.email,
        type: "email-verification"
      },
      process.env.JWT_SECRET || process.env.JWT_VERIFICATION_SECRET || "verification-secret",
      {
        expiresIn: "24h", // Link valid for 24 hours
      }
    );

    // Create verification link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email Address",
      text: `Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1976d2;">Email Verification</h2>
          <p>Click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending verification email:", err);
        return res.status(500).json({
          message: "Failed to send verification email",
          status: 0,
        });
      }
      console.log("Verification email sent:", info.response);
      return res.status(200).json({
        message: "Verification link sent successfully. Please check your email.",
        status: 1,
      });
    });
  } catch (error) {
    console.error("Error resending verification link:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again later.",
      status: 0,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { otp, password, email } = req.body;
    const otpFound = await OTP.findOne({ email, otp });

    if (!otpFound) {
      return res.status(404).json({
        error: "Incorrect OTP or the OTP has expired. Please try again.",
        status: 0,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userFound = await user.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!userFound) {
      return res.status(404).json({
        error: "User not found.",
        status: 0,
      });
    }

    await OTP.deleteOne({ otp });

    return res.status(200).json({
      message: "Password updated successfully!",
      status: 1,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again later.",
      status: 0,
    });
  }
};
