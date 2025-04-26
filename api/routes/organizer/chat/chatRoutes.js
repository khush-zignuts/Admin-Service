const express = require("express");

const { chatController } = require("../../../controllers/organizer/index");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const router = express.Router();

//booking create
router.post("/getOrCreateChatId", chatController.getorcreate);

module.exports = router;
