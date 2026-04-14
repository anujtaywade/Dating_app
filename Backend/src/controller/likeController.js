const Like = require("../models/likeModel");
const User = require("../models/userModel");

exports.sendLike = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = req.params.userId;
    const { message } = req.body;

    // 🚫 cannot like yourself
    if (fromUserId === toUserId) {
      return res.status(400).json({
        message: "You cannot like yourself"
      });
    }

    // ✅ check receiver exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🚫 prevent duplicate like
    const alreadyLiked = await Like.findOne({
      fromUser: fromUserId,
      toUser: toUserId
    });

    if (alreadyLiked) {
      return res.status(400).json({
        message: "You already sent a request"
      });
    }

    // 🧠 DAILY LIMIT LOGIC
    const fromUser = await User.findById(fromUserId);

    const today = new Date().toDateString();
    const lastLikeDay = fromUser.lastLikeDate
      ? fromUser.lastLikeDate.toDateString()
      : null;

    // reset if new day
    if (today !== lastLikeDay) {
      fromUser.likesSentToday = 0;
    }

    const DAILY_LIMIT = 10;

    if (fromUser.likesSentToday >= DAILY_LIMIT) {
      return res.status(429).json({
        message: "Daily like limit reached"
      });
    }

    // increment count
    fromUser.likesSentToday += 1;
    fromUser.lastLikeDate = new Date();
    await fromUser.save();

    // ❤️ create like
    const like = await Like.create({
      fromUser: fromUserId,
      toUser: toUserId,
      message
    });

    // 🔔 (optional) notification placeholder
    // TODO: integrate push notification later

    return res.status(201).json({
      message: "Request sent successfully",
      like
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};