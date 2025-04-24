const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/authRoutes");
const eventRoutes = require("./event/eventRoutes");
const organizerRoutes = require("./organizer/organizerRoutes");
const userRoutes = require("./user/userRoutes");

//authentication
router.use("/auth", authRoutes);

//event Routes
router.use("/event", eventRoutes);

//organizer Routes
router.use("/organizer", organizerRoutes);

//user Routes
router.use("/user", userRoutes);

module.exports = router;
