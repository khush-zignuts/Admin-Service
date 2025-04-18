const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/authRoutes");
const eventRoutes = require("./event/eventRoutes");

//authentication
router.use("/auth", authRoutes);

//event Routes
router.use("/event", eventRoutes);

module.exports = router;
