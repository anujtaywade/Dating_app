const Message = require("../models/messageModel");
const Match = require("../models/matchModel");

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const matchId = req.params.matchId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Message text required"
      });
    }

    const match = await Match.findById(matchId);

    if (!match || !match.isActive) {
      return res.status(404).json({
        message: "Match not found"
      });
    }

    const isUserInMatch = match.users.some(
      (id) => id.toString() === userId
    );

    if (!isUserInMatch) {
      return res.status(403).json({
        message: "Not authorized to chat"
      });
    }

    const message = await Message.create({
      matchId,
      sender: userId,
      text
    });


    match.lastMessage = text;
    match.lastMessageAt = new Date();
    await match.save();

    res.status(201).json({
      message: "Message sent",
      data: message
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const matchId = req.params.matchId;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found"
      });
    }

    const isUserInMatch = match.users.some(
      (id) => id.toString() === userId
    );

    if (!isUserInMatch) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      count: messages.length,
      messages
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};