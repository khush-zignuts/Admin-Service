require("dotenv").config();
const express = require("express");
const router = express.Router();

const {
  AdminOrganizerController,
} = require("../../../controllers/admin/index");
const checkAdmin = require("../../middleware/Admin/checkAdmin");

router .post(
  "/deactivateorganizer",
  checkAdmin,
  AdminOrganizerController.deactivateOrganizer
).post(
  "/getallorganizer",
  checkAdmin,
  AdminOrganizerController.getAllOrganizer
);

module.exports = router;
