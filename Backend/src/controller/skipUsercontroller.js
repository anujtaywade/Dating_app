const Skip = require("../models/skipModel");

exports.skipUser = async (req, res) => {
  try {
    const fromUser = req.user.id;
    const toUser = req.params.userId;

    await Skip.create({
      fromUser,
      toUser
    });

    res.status(200).json({
      message: "User skipped"
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};