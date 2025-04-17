const express = require("express");
const { authController } = require("../../controllers/index");
const checkAdmin = require("../../middleware/chechAdmin");
const router = express.Router();

//auth User
router.post("/signup", authController.signup);
router.post("/verifyotp", authController.verifyOTP);
router.post("/login", authController.login);
router.post("/logout/:userId", checkAdmin, authController.logout);

module.exports = router;
