const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { reportUser } = require("../controller/reportController");

router.post("/report", protect, reportUser);

module.exports = router;