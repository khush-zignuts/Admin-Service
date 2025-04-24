const express = require("express");
const { bookEventController } = require("../../../controllers/organizer");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const  router = express.Router();

//Booking fetch
router
  .get(
    "/allPendingRequest",
    checkOrganizer,
    bookEventController.getAllPendingRequest
  )
  .post("/acceptUser", checkOrganizer, bookEventController.acceptUserForEvent)
  .post(
    "/declineUser",
    checkOrganizer,
    bookEventController.declineUserForEvent
  );

module.exports = router;
