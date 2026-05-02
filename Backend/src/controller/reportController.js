const Report = require("../models/reportModel");

exports.reportUser = async (req, res) => {
  try {
    const reporter = req.user.id;
    const { reportedUser, reason, message } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({
        message: "reportedUser and reason required"
      });
    }

    await Report.create({
      reporter,
      reportedUser,
      reason,
      message
    });

    res.status(201).json({
      message: "Report submitted"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};