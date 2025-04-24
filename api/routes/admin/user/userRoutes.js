require("dotenv").config();
const express = require("express");
const router = express.Router();

const {
  AdminAuthController,
} = require("../../../controllers/admin/auth/AdminAuthController");
const checkAdmin = require("../../middleware/Admin/checkAdmin");

router.post("/deactivateuser", checkAdmin, deactivateUser);

module.exports = router;
