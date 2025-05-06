const express = require("express");
const authController = require("../../../controllers/organizer/auth/authController");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const router = express.Router();

//auth User
router
  .post("/signup", authController.signup)
  .post("/verifyOtp", authController.verifyOTP)
  .post("/login", authController.login)
  .post("/logOut", checkOrganizer, authController.logout)
  .post("/change-password", checkOrganizer, authController.changePassword),
  // .post("/forgot-password", authController.forgotPassword)
  // .post("/reset-password", authController.resetPassword);

  (module.exports = router);
