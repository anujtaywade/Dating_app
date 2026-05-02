const User = require("../models/userModel");

exports.rateLimitLikes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    const today = new Date().toDateString();
    const lastLikeDay = user.lastLikeDate
      ? user.lastLikeDate.toDateString()
      : null;

    // 🔄 reset daily count
    if (today !== lastLikeDay) {
      user.likesSentToday = 0;
    }

    const DAILY_LIMIT = 10;

    if (user.likesSentToday >= DAILY_LIMIT) {
      return res.status(429).json({
        message: "Daily like limit reached"
      });
    }

    // ✅ increment count
    user.likesSentToday += 1;
    user.lastLikeDate = new Date();
    await user.save();

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};