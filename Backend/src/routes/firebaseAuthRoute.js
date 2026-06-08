const express = require("express");
const router = express.Router();
const {
  firebaseLogin,
} = require("../controller/firebaseAuthController");


router.post("/firebase-login", firebaseLogin);

module.exports = router;