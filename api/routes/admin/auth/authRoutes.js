const express = require("express");
const { AdminAuthController } = require("../../../controllers/admin/index");
const checkAdmin = require("../../../middleware/checkAdmin");
const router = express.Router();

//auth User
router
  .post("/login", AdminAuthController.login)
  .post("/logout", checkAdmin, AdminAuthController.logout);

module.exports = router;
