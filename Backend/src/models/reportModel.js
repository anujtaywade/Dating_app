const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reason: {
    type: String,
    enum: ["spam", "abuse", "fake", "other"],
    required: true
  },
  message: String
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);