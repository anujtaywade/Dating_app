const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { json } = require("express");

exports.login = async (req, res) => {
  try {
    const { phone, googleId } = req.body;

    if (!phone && !googleId) {
      return res
        .status(400)
        .json({ message: "Phone or google login required" });
    }

    let authUser;

    if (phone) {
      authUser = await User.findOne({ phone });

      if (!authUser) {
        authUser = await User.create({
          phone,
          authProvider: "phone",
          isVerified: true,
        });
      }
    }

    if (googleId) {
      authUser = await User.findOne({ googleId });

      if (!authUser) {
        authUser = await User.create({
          googleId,
          authProvider: "google",
          isVerified: true,
        });
      }
    }
    const token = jwt.sign({ id: authUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ message: "Login Sucessfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.authMe =async (req,res) => {
  try {
    const currUser = await User.findById(req.userId)

    if (!currUser){
      return res.status(401).json({message : "User not found"})
    }

    res.status(200).json({
      success : true,
      currUser
    })
  } catch (error) {
    res.status(500).json({message : "internal Server Error"})
  }
}

exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internl Server Error" });
  }
};
