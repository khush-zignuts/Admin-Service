require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Admin } = require("../models/index");
const { HTTP_STATUS_CODES } = require("../../config/constant");

const checkAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized access. Token missing or malformed.",
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

    const admin = await Admin.findOne({
      where: { id: decoded.id },
      attributes: ["id", "accessToken"],
    });

    if (!admin) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Admin not found.",
        data: "",
        error: "",
      });
    }

    if (admin.accessToken !== token) {
      return res.json({
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "Invalid or expired token.",
        data: "",
        error: "",
      });
    }

    // Set admin on request object
    req.admin = admin;

    next(); // Proceed if admin
  } catch (error) {
    return res.json({
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized access.",
      data: "",
      error: error.message,
    });
  }
};

module.exports = checkAdmin;
