const express = require("express");
const { authController } = require("../../../controllers/organizer/index");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const router = express.Router();

//auth User
router
  .post("/signup", authController.signup)
  .post("/verifyotp", authController.verifyOTP)
  .post("/login", authController.login)
  .post("/logout", checkOrganizer, authController.logout);

module.exports = router;
