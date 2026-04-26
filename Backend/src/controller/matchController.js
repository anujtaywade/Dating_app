const Match = require("../models/matchModel");

exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find({
      users: userId,
      isActive: true
    })
    .populate("users", "name photos bio")
    .sort({ updatedAt: -1 });

    res.status(200).json({
      count: matches.length,
      matches
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


exports.unmatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.user.id;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found"
      });
    }

    if (!match.users.includes(userId)) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }


    match.isActive = false;
    await match.save();

    res.status(200).json({
      message: "Unmatched successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};