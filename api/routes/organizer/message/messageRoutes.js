const express = require("express");
const messageController = require("../../../controllers/organizer/message/messageController");
const checkOrganizer = require("../../../middleware/checkOrganizer");

const router = express.Router();

// Send a message
router.post("/send", checkOrganizer, messageController.sendMessage);

// Get all messages between two users
// router.get("get/:chatId", checkOrganizer, messageController.getMessages);

module.exports = router;
