const User = require("../models/userModel");
const Like = require("../models/likeModel");
const Match = require("../models/matchModel");
const Skip = require("../models/skipModel")
const Block = require("../models/blockModel");


exports.getDiscoverUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await User.findById(userId);

    if (!currentUser.location || !currentUser.location.coordinates) {
  return res.status(400).json({
    message: "Please update your location"
  });
}

    // 🧠 DAILY LIMIT (10 users/day)
    const today = new Date().toDateString();
    const lastDay = currentUser.lastDiscoverDate
      ? currentUser.lastDiscoverDate.toDateString()
      : null;

    if (today !== lastDay) {
      currentUser.likesSentToday = 0;
    }

    if (currentUser.likesSentToday >= 10) {
      return res.status(429).json({
        message: "Daily discover limit reached"
      });
    }

    // 🔍 Get exclusions
    const likes = await Like.find({ fromUser: userId });
    const matches = await Match.find({ users: userId });
    const skips = await Skip.find({ fromUser: userId });
    const blocks = await Block.find({$or: [
    { blocker: userId },
    { blocked: userId }
  ]
});

    const likedUserIds = likes.map(l => l.toUser.toString());
    const matchedUserIds = matches.flatMap(m =>
      m.users.map(u => u.toString()));
    const skippedIds = skips.map(s => s.toUser.toString());
    const blockedIds = blocks.map(b =>
  b.blocker.toString() === userId
    ? b.blocked.toString()
    : b.blocker.toString()
);
    

    const excludeIds = [
      userId,
      ...likedUserIds,
      ...matchedUserIds,
      ...skippedIds,
      ...blockedIds,
    ];

    // 🎯 Fetch users
    let users = await User.find({
      _id: { $nin: excludeIds },
      profileCompleted: true,

      gender: currentUser.interestedIn,
      interestedIn: currentUser.gender,

    location: {
    $near: {
      $geometry: currentUser.location,
      $maxDistance: 50000 // 50km
    }
  }
    }).limit(50);

    // 🧠 Ranking logic
    users = users.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // same city boost
      if (a.location?.city === currentUser.location?.city) scoreA += 5;
      if (b.location?.city === currentUser.location?.city) scoreB += 5;

      // active users
      scoreA += (Date.now() - new Date(a.lastActive)) < 86400000 ? 3 : 0;
      scoreB += (Date.now() - new Date(b.lastActive)) < 86400000 ? 3 : 0;

      // new users boost
      scoreA += (Date.now() - new Date(a.createdAt)) < 3 * 86400000 ? 2 : 0;
      scoreB += (Date.now() - new Date(b.createdAt)) < 3 * 86400000 ? 2 : 0;

      return scoreB - scoreA;
    });

    const finalUsers = users.slice(0, 10);

    // update discover tracking
    currentUser.lastDiscoverDate = new Date();
    currentUser.likesSentToday += finalUsers.length;
    await currentUser.save();

    res.status(200).json({
      count: finalUsers.length,
      users: finalUsers
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};