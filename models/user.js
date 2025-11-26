const mongoose = require("mongoose");

const userschema = mongoose.Schema({
  firstName: {
    type: String,
    // require: true,
    maxLength: 100,
  },
  lastName: {
    type: String,
    // require: true,
    maxLength: 100,
  },
  email: {
    type: String,
    require: true,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    require: true,
    minLength: 8,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"], // customize as needed
    required: true,
    default: "active",
  },
});

module.exports = mongoose.model("User", userschema);
