const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, require: true, unique: true },
    description: { type: String },
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    color: {
      type: String,
      require: true,
      enum: [
        "pastel-red",
        "pastel-orange",
        "pastel-yellow",
        "pastel-green",
        "pastel-blue",
        "pastel-purple",
        "pastel-pink",
        "pastel-violet",
        "pastel-cyan",
        "pastel-peach",
        "black",
      ],
    },
    order: { type: Number },
  },
  {
    timestamps: true,
  }
);

// const colorMap = {
//   pastel_red: "#FFB3BA",
//   pastel_orange: "#FFDFBA",
//   pastel_yellow: "#FFFFBA",
//   pastel_green: "#BAFFC9",
//   pastel_blue: "#BAE1FF",
//   pastel_purple: "#E3BFFF",
//   pastel_pink: "#FFCCE5",
//   pastel_violet: "#D9B3FF",
//   pastel_cyan: "#B3E5FC",
//   pastel_peach: "#FAD6A5",
//   black: "#000000",
// };

module.exports = mongoose.model("Group", groupSchema);
