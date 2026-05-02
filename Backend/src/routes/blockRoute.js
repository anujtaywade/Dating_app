const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { blockUser } = require("../controller/blockController");

router.post("/block/:id", protect, blockUser);

module.exports = router;