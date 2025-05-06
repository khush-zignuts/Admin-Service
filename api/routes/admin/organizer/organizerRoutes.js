require("dotenv").config();
const express = require("express");
const router = express.Router();

const AdminOrganizerController = require("../../../controllers/admin/organizer/AdminOrganizerController");
const checkAdmin = require("../../../middleware/checkAdmin");

router
  .post("/deactivate", checkAdmin, AdminOrganizerController.deactivateOrganizer)
  .get("/getAll", checkAdmin, AdminOrganizerController.getAllOrganizer);

module.exports = router;
