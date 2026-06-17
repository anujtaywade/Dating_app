const admin = require("../config/firebaseAdmin");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.firebaseLogin = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: "firebaseToken is required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    const uid = decoded.uid;

    let user = await User.findOne({
      firebaseUid: uid,
    });

  if (!user) {
  const userData = {
    firebaseUid: uid,
    email: decoded.email,
    authProvider: decoded.phone_number ? "phone" : "google",
    isVerified: true,
  };

  // ONLY add phone if it exists
  if (decoded.phone_number) {
    userData.phone = decoded.phone_number;
  }

  user = await User.create(userData);
}

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
      console.log("========== FIREBASE ERROR ==========");
  console.log(error?.message || error);
  console.log("===================================");
    res.status(401).json({
      message: "Invalid Firebase Token",
    });
  }
};
