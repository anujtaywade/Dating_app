const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // },

   lastMessage: {
      type: String,
      default: ""
    },

    lastMessageAt: {
      type: Date
    },


  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);