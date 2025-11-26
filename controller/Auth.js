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
        status: 1,
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        message: "Password is required",
        status: 0,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const response = await new User({
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    }).save();

    return res.status(201).json({
      message: "Sign up successful",
      status: 1,
    });
  } catch (e) {
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

      transporter.jsonMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error jsoning email:", err);
          return res.status(500).json({
            message: "Failed to json OTP email",
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
