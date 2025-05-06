require("dotenv").config();
const express = require("express");
const router = express.Router();

const AdminUserController = require("../../../controllers/admin/user/AdminUserController");
const checkAdmin = require("../../../middleware/checkAdmin");

router
  .get("/getall", checkAdmin, AdminUserController.getAllUsers)
  .post("/deactivate", checkAdmin, AdminUserController.deactivateUser);

module.exports = router;
