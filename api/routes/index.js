const express = require("express");
const router = express.Router();
const organizerRoutes = require("./organizer/index");
const adminRoutes = require("./admin/index");

//admin Routes
router.use("/admin", adminRoutes);
//organizer
router.use("/organizer", organizerRoutes);


module.exports = router;
