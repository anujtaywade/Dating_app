const admin = require("../config/firebaseAdmin");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.firebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    const decoded = await admin
      .auth()
      .verifyIdToken(firebaseToken);

    const uid = decoded.uid;

    let user = await User.findOne({
      firebaseUid: uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        phone: decoded.phone_number,
        email: decoded.email,
        authProvider: decoded.phone_number
          ? "phone"
          : "google",
        isVerified: true,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Invalid Firebase Token",
    });
  }
};