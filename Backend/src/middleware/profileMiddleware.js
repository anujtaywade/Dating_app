const User = require("../models/userModel");

exports.profileCompleteCheck = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!user.profileCompleted) {
      return res.status(403).json({
        message: "Complete your profile to use this feature"
      });
    }

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};