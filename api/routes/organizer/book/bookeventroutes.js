const express = require("express");
const bookEventController = require("../../../controllers/organizer/booking/bookEventController");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const router = express.Router();

//Booking fetch
router
  .get(
    "/getAllUsersByBookingStatus",
    checkOrganizer,
    bookEventController.getAllUsersByBookingStatus
  )
  .post("/acceptuser", checkOrganizer, bookEventController.acceptUserForEvent)
  .post(
    "/declineUser",
    checkOrganizer,
    bookEventController.declineUserForEvent
  );

module.exports = router;
