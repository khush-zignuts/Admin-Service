require("dotenv").config();
const express = require("express");
const router = express.Router();

const { AdminUserController } = require("../../../controllers/admin/index");
const checkAdmin = require("../../../middleware/checkAdmin");

router.get("/getallusers", checkAdmin, AdminUserController.getAllUsers);

module.exports = router;
