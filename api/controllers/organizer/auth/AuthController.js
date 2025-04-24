const otpGenerator = require("otp-generator");
const VALIDATOR = require("validatorjs");

const jwt = require("jsonwebtoken");
const generateUUID = require("../../../utils/generateUUID");
const verifyOTP = require("../../../utils/verifyOtp");
const hashPw = require("../../../utils/hashPw");
const comparePassword = require("../../../utils/comparePassword");
const {
  HTTP_STATUS_CODES,
  TOKEN_EXPIRY,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");

const { Organizer } = require("../../../models/index");
const sendEmail = require("../../../helper/sendEmail");

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

      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
      });

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
      console.log("otp: ", otp);

      const templateData = {
        userName: name,
        otp: otp,
        appName: "Event Management",
        year: new Date().getFullYear(),
      };

      console.log("templateData: ", templateData);
      await sendEmail(
        email,
        "Verify Your Email - OTP",
        "../../assets/templates/otp-verification-email.handlebars",
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
      const { email, password } = req.body;

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
        attributes: ["id", "email", "password", "accessToken"],
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
      await organizer.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Login successful.",
        data: { token, organizerId: organizer.id },
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
        return res.json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "invalidCredentials",
          data: "",
          error: "",
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
          isOnlin: false,
        },
        { where: { id: organizerId, isDeleted: false } }
      );
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
