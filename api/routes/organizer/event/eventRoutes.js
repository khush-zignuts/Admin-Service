const express = require("express");
const { eventController } = require("../../../controllers/organizer/index");
const checkOrganizer = require("../../middleware/checkOrganizer");
const router = express.Router();

//auth User
router
  .post("/create", checkOrganizer, eventController.createEvent)
  .get("/getAll", checkOrganizer, eventController.getAllEvents)
  .get("/getById", checkOrganizer, eventController.getEventById)
  .post("/update", checkOrganizer, eventController.updateEvent)
  .post("/delete", checkOrganizer, eventController.deleteEvent);

module.exports = router;
