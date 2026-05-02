const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    maxLength: 200
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },



}, { timestamps: true });

likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
