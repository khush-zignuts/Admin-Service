const express = require("express");
const router = express.Router();
const authRoutes = require("../organizer/auth/authRoutes");
const eventRoutes = require("../organizer/event/eventRoutes");
const bookeventRoutes = require("../organizer/book/bookeventroutes");
const chatRoutes = require("../organizer/chat/chatRoutes");
const messageRoutes = require("../organizer/message/messageRoutes");

//authentication
router.use("/auth", authRoutes);

//event Routes
router.use("/event", eventRoutes);

//booking Routes
router.use("/book", bookeventRoutes);

//chat Routes
router.use("/chat", chatRoutes);

//message Routes
router.use("/message", messageRoutes);


module.exports = router;
