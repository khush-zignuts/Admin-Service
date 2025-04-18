const express = require("express");
const { eventController } = require("../../controllers/index");
const checkAdmin = require("../../middleware/chechAdmin");
const router = express.Router();

//auth User
router
  .post("/create", checkAdmin, eventController.createEvent)
  .get("/getAll", checkAdmin, eventController.getAllEvents)
  .get("/getById/:id", eventController.getEventById)
  .put("/update/:id", checkAdmin, eventController.updateEvent);
// .post("/delete/:eventId", checkAdmin, eventController.deleteEvent)

module.exports = router;
