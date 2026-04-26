const Like = require("../models/likeModel");
const User = require("../models/userModel");
const Match = require("../models/matchModel");


exports.sendLike = async (req, res) => {
//   console.log("BODY:", req.body);
// console.log("HEADERS:", req.headers);
  try {
    const fromUserId = req.user.id;
    const toUserId = req.params.userId;
    const { message } = req.body;


    if (fromUserId === toUserId) {
      return res.status(400).json({
        message: "You cannot like yourself"
      });
    }

  
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



exports.getRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Like.find({
      toUser: userId,
      status: "pending"
    })
    .populate("fromUser", "name photos bio")
    .sort({ createdAt: -1 });

    return res.status(200).json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



exports.acceptLike = async (req, res) => {
  try {
    const likeId = req.params.id;
    const userId = req.user.id;

    const like = await Like.findById(likeId);

    if (!like) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    // 🚫 Only receiver can accept
    if (like.toUser.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    // 🚫 Already handled
    if (like.status !== "pending") {
      return res.status(400).json({
        message: "Request already handled"
      });
    }

    // ✅ Accept
    like.status = "accepted";
    await like.save();

    // 🔥 Create match
    const match = await Match.create({
      users: [like.fromUser, like.toUser]
    });

    return res.status(200).json({
      message: "Match created successfully",
      match
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



exports.rejectLike = async (req, res) => {
  try {
    const likeId = req.params.id;
    const userId = req.user.id;

    const like = await Like.findById(likeId);

    if (!like) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    if (like.toUser.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (like.status !== "pending") {
      return res.status(400).json({
        message: "Already handled"
      });
    }

    like.status = "rejected";
    await like.save();

    return res.status(200).json({
      message: "Request rejected"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};