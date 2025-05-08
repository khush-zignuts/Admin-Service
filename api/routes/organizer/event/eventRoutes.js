const express = require("express");
const eventController = require("../../../controllers/organizer/event/eventController");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const router = express.Router();

//auth User
router
  .post("/create", checkOrganizer, eventController.createEvent)
  .get(
    "/getAllEventsBySearch",
    checkOrganizer,
    eventController.getAllEventsBySearch
  )
  .get("/getEventById/:id", checkOrganizer, eventController.getEventById)
  .post("/update/:id", checkOrganizer, eventController.updateEvent)
  .post("/delete/:id", checkOrganizer, eventController.deleteEvent);

module.exports = router;
