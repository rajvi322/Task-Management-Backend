const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  name: { type: String, required: true },
  priority: { type: String, enum: ["low", "high", "medium"] },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  description: { type: String },
  assignedTo: { type: String },
  dueDate: { type: String },
});

module.exports = mongoose.model("Tasks", taskSchema);
