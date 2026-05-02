
  const router = require("express").Router();

  const { getMatches, unmatch } = require("../controller/matchController");
  const { protect } = require("../middleware/authMiddleware");
  const { profileCompleteCheck } = require("../middleware/profileMiddleware");

  router.get("/", protect, profileCompleteCheck, getMatches);
  router.delete("/:id", protect, profileCompleteCheck, unmatch);

  module.exports = router;