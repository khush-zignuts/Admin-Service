const VALIDATOR = require("validatorjs");

const jwt = require("jsonwebtoken");
const {
  generateUUID,
  verifyOTP,
  comparePassword,
  hashPw,
} = require("../../../utils/utils");

const {
  HTTP_STATUS_CODES,
  TOKEN_EXPIRY,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");

const { Organizer } = require("../../../models/index");
const sendEmail = require("../../../helper/Mail/sendEmail");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = {
  signup: async (req, res) => {
    try {
      const { email, password, name, phoneNumber } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.ORGANIZER.EMAIL,
        password: VALIDATION_RULES.ORGANIZER.PASSWORD,
        name: VALIDATION_RULES.ORGANIZER.NAME,
        phoneNumber: VALIDATION_RULES.ORGANIZER.PHONE_NUMBER,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      // Check if user exists
      const existingOrganizer = await Organizer.findOne({
        where: { email, isDeleted: false },
        attributes: ["id"],
      });

      if (existingOrganizer) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "User already exists.",
          data: "",
          error: "",
        });
      }

      const hashedPassword = await hashPw(password);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const otpCreated = Math.floor(Date.now() / 1000);
      const uuid = generateUUID();

      await Organizer.create({
        id: uuid,
        email,
        password: hashedPassword,
        name,
        otp: otp,
        otpCreatedAt: otpCreated,
        phoneNumber: phoneNumber,
        createdAt: otpCreated,
        createdBy: uuid,
      });

      let otpStore = {};
      otpStore[email] = otp;

      const templateData = {
        userName: name,
        otp: otp,
        appName: "Event Management",
        year: new Date().getFullYear(),
      };

      await sendEmail(
        email,
        "Verify Your Email - OTP",
        "../../assets/templates/otp-verification-email.hbs",
        templateData
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Signup successful. Please verify your email using OTP.",
        data: { email },
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.ORGANIZER.EMAIL,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const organizer = await Organizer.findOne({
        where: { email, isDeleted: false },
        attributes: ["id", "otp", "otpCreatedAt"],
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "User not found.",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }

      const isValid = verifyOTP(otp, organizer.otp, organizer.otpCreatedAt);

      if (!isValid) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid OTP.",
          data: "",
          error: "INVALID_OTP",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Email verified successfully!",
        data: "",
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, fcmToken } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.ORGANIZER.EMAIL,
        password: VALIDATION_RULES.ORGANIZER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const organizer = await Organizer.findOne({
        where: { email, isDeleted: false },
        attributes: ["id", "name", "email", "password", "accessToken"],
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "User not found.",
          data: "",
          error: "",
        });
      }

      const valid = await comparePassword(password, organizer.password);

      if (!valid) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Invalid credentials.",
          data: "",
          error: "",
        });
      }

      const token = jwt.sign({ id: organizer.id }, process.env.SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
      });

      organizer.accessToken = token;
      organizer.fcmToken = fcmToken;
      await organizer.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Login successful.",
        data: {
          token,
          organizerId: organizer.id,
          organizerName: organizer.name,
        },
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
      const organizerId = req.organizer.id;

      const organizer = await Organizer.findOne({
        where: { id: organizerId, isDeleted: false },
        attributes: ["id", "name", "accessToken"],
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Invalid credentials",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }
      if (!organizer.accessToken) {
        return res.json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Already logged out",
          data: "",
          error: "",
        });
      }
      // Set accessToken to NULL (logout)
      await organizer.update(
        {
          accessToken: null,
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: organizerId,
          isLogin: false,
          isOnline: false,
        },
        { where: { id: organizerId, isDeleted: false } }
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Logout successful",
        data: "",
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

  changePassword: async (req, res) => {
    try {
      const organizerId = req.organizer.id;
      const { currentPassword, newPassword } = req.body;

      const validation = new VALIDATOR(req.body, {
        currentPassword: VALIDATION_RULES.ORGANIZER.PASSWORD,
        newPassword: VALIDATION_RULES.ORGANIZER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const organizer = await Organizer.findOne({
        where: { id: organizerId, isDeleted: false },
        attributes: ["id", "password"],
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "organizer not found.",
          data: "",
          error: "ORGANIZER_NOT_FOUND",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, organizer.password);

      if (!isMatch) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Current password is incorrect.",
          data: "",
          error: "INVALID_CURRENT_PASSWORD",
        });
      }

      const hashedNewPassword = await hashPw(newPassword);

      await Organizer.update(
        { password: hashedNewPassword },
        { where: { id: organizer.id } }
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Password updated successfully.",
        data: "",
        error: "",
      });
    } catch (error) {
      console.error("Change Password Error:", error.message);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Server error.",
        data: "",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.ORGANIZER.EMAIL,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const organizer = await Organizer.findOne({
        where: { email: email, isDeleted: false },
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "organizer not found.",
          data: "",
          error: "ORGANIZER_NOT_FOUND",
        });
      }

      organizer.forgetPasswordToken = generateUUID();
      organizer.forgetPasswordTokenExpiry = Math.floor(
        (Date.now() + 15 * 60 * 1000) / 1000
      );
      // 15 min expiry
      await organizer.save();

      console.log(
        "organizer.forgetPasswordToken: ",
        organizer.forgetPasswordToken
      );
      console.log(
        "organizer.forgetPasswordTokenExpiry: ",
        organizer.forgetPasswordTokenExpiry
      );

      const templateData = {
        userName: organizer.name,
        email: organizer.email,
        resetLink: `http://localhost:5173/auth/forgot-password/reset-password/${user.forgetPasswordToken}`,
        appName: "Event Management",
        year: new Date().getFullYear(),
      };

      await sendEmail(
        email,
        "Reset Your Password",
        "../../../assets/templates/reset-password-email.hbs",
        templateData
      );

      console.log("\n Send email with reset link");

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Password reset link has been sent to your email.",
        data: { email },
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.ORGANIZER.EMAIL,
        newPassword: VALIDATION_RULES.ORGANIZER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const organizer = await Organizer.findOne({
        where: {
          email,
          forgetPasswordToken: token,
          forgetPasswordTokenExpiry: { [Op.gt]: Math.floor(Date.now() / 1000) },
          // token is still valid
        },
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "organizer not found.",
          data: "",
          error: "ORGANIZER_NOT_FOUND",
        });
      }

      const hashedPassword = await hashPw(newPassword);

      await organizer.update({
        password: hashedPassword,
        forgetPasswordToken: null,
        forgetPasswordTokenExpiry: null,
      });

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Password reset successful.",
        data: "",
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },
};
