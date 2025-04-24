const VALIDATOR = require("validatorjs");
const jwt = require("jsonwebtoken");

const comparePassword = require("../../../utils/comparePassword");
const {
  HTTP_STATUS_CODES,
  TOKEN_EXPIRY,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");

const { Admin } = require("../../../models/index");

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.ADMIN.EMAIL,
        password: VALIDATION_RULES.ADMIN.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const admin = await Admin.findOne({
        where: { email, isDeleted: false, isActive: true },
        attributes: ["id", "email", "password", "accessToken"],
      });

      if (!admin) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "User not found.",
          data: "",
          error: "",
        });
      }

      const valid = await comparePassword(password, admin.password);

      if (!valid) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Invalid credentials.",
          data: "",
          error: "",
        });
      }

      const token = jwt.sign({ id: admin.id }, process.env.SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
      });

      admin.accessToken = token;
      await admin.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Login successful.",
        data: { token, adminId: admin.id },
        error: "",
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: error.message,
      });
    }
  },

  logout: async (req, res) => {
    try {
      const adminId = req.admin.id;

      const admin = await Admin.findOne({
        where: { id: adminId, isDeleted: false, isActive: true },

        attributes: ["id", "name", "accessToken"],
      });

      if (!admin) {
        return res.json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "invalidCredentials",
          data: "",
          error: "",
        });
      }
      if (!admin.accessToken) {
        return res.json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Already logged out",
          data: "",
          error: "",
        });
      }
      // Set accessToken to NULL (logout)
      await admin.update(
        {
          accessToken: null,
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: adminId,
        },
        { where: { id: adminId, isDeleted: false } }
      );

      console.log("first");
      return res.json({
        status: HTTP_STATUS_CODES.OK,
        message: "logout",
        data: "",
        error: "",
      });
    } catch (error) {
      return res.json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "serverError",
        data: "",
        error: error.message,
      });
    }
  },
};
