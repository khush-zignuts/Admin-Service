const authController = require("./auth/AuthController");
const eventController = require("./event/EventController");
const bookEventController = require("./booking/BookEventController");
const chatController = require("./chat/ChatController");
const messageController = require("./message/MessageController");

module.exports = {
  authController,
  eventController,
  bookEventController,
  chatController,
  messageController
};
