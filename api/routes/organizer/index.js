const express = require("express");
const router = express.Router();
const authRoutes = require("../organizer/auth/authRoutes");
const eventRoutes = require("../organizer/event/eventRoutes");
const bookeventRoutes = require("../organizer/book/bookeventroutes");

//authentication
router.use("/auth", authRoutes);

//event Routes
router.use("/event", eventRoutes);

//booking Routes
router.use("/book", bookeventRoutes);

module.exports = router;
