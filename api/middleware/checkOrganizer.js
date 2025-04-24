require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Organizer } = require("../models/index");
const { HTTP_STATUS_CODES } = require("../../config/constant");

const checkOrganizer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized access. Token missing .",
        data: "",
        error: "",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Access denied. No token provided.",
        data: "",
        error: "",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const organizer = await Organizer.findOne({
      where: { id: decoded.id },
      attributes: ["id", "accessToken"],
    });

    if (!organizer) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Organizer not found.",
        data: "",
        error: "",
      });
    }

    if (organizer.accessToken !== token) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Invalid or expired token.",
        data: "",
        error: "",
      });
    }

    // Set organizer on request object
    req.organizer = organizer;

    next(); // Proceed if organizer
  } catch (error) {
    return res.json({
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized access.",
      data: "",
      error: error.message,
    });
  }
};

module.exports = checkOrganizer;
