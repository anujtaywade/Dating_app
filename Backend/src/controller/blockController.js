const Block = require("../models/blockModel");
const Match = require("../models/matchModel");

exports.blockUser = async (req, res) => {
  try {
    const blocker = req.user.id;
    const blocked = req.params.id;

    if (blocker === blocked) {
      return res.status(400).json({
        message: "You cannot block yourself"
      });
    }

    // prevent duplicate
    const existing = await Block.findOne({ blocker, blocked });
    if (existing) {
      return res.status(400).json({
        message: "User already blocked"
      });
    }

    // save block
    await Block.create({ blocker, blocked });

    // 🔥 auto unmatch
    await Match.updateMany(
      { users: { $all: [blocker, blocked] } },
      { isActive: false }
    );

    res.status(200).json({
      message: "User blocked successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};