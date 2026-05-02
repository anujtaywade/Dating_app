const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, "please enter a valid phone number"],
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    googleId: {
      type: String,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["phone", "google"],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    name: String,

    dob: Date,

    gender: {
      type: String,
      enum: ["male", "female"],
    },

    intrestedIn: {
      type: String,
      enum: ["male", "female"],
    },

    bio: String,

    photos: [String],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
      city: String,
    },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
