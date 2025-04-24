require("dotenv").config();
const express = require("express");
const router = express.Router();

const {
  AdminOrganizerController,
} = require("../../../controllers/admin/index");
const checkAdmin = require("../../../middleware/checkAdmin");

router
  .post(
    "/deactivateOrganizer",
    checkAdmin,
    AdminOrganizerController.deactivateOrganizer
  )
  .get(
    "/getAllOrganizer",
    checkAdmin,
    AdminOrganizerController.getAllOrganizer
  );

module.exports = router;
