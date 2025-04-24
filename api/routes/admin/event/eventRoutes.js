const express = require("express");
const { AdminEventController } = require("../../../controllers/admin/index");
const checkAdmin = require("../../../middleware/checkAdmin");
const router = express.Router();

//auth User
router.get("/getAll", checkAdmin, AdminEventController.getAllEvents);

module.exports = router;
