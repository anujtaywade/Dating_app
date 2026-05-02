const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { profileCompleteCheck } = require("../middleware/profileMiddleware");

const { skipUser } = require("../controller/skipUsercontroller");

// ✅ skip user
router.post(
  "/skip/:userId",
  protect,
  profileCompleteCheck,
  skipUser
);

module.exports = router;