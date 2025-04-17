const otpGenerator = require("otp-generator");
const VALIDATOR = require("validatorjs");

const jwt = require("jsonwebtoken");

const { HTTP_STATUS_CODES, TOKEN_EXPIRY } = require("../../config/constant");
const { VALIDATION_RULES } = require("../../config/validationRules");
const {
  hashPw,
  verifyOTP,
  comparePassword,
  generateUUID,
} = require("../../helper/helper");

const { User } = require("../../models/index");
const sendEmail = require("../../utils/sendEmail");

module.exports = {
  signup: async (req, res) => {
    try {
      const { email, password, name, phoneNumber } = req.body;
      console.log("req.body: ", req.body);

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.USER.EMAIL,
        password: VALIDATION_RULES.USER.PASSWORD,
        name: VALIDATION_RULES.USER.NAME,
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
      const existingUser = await User.findOne({
        where: { email },
        isDeleted: false,
        attributes: ["id"],
      });

      if (existingUser) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "User already exists.",
          data: "",
          error: "EMAIL_ALREADY_REGISTERED",
        });
      }

      const hashedPassword = await hashPw(password);

      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
      });

      const otpCreated = Math.floor(Date.now() / 1000);
      const uuid = generateUUID();

      await User.create({
        id: uuid,
        email,
        password: hashedPassword,
        name,
        otp: otp,
        otpCreatedAt: otpCreated,
        role: "admin",
        phoneNumber: phoneNumber,
        createdAt: otpCreated,
        createdBy: uuid,
      });

      let otpStore = {};

      otpStore[email] = otp;

      const html = `<h2>Your OTP is: ${otp}</h2><p>It is valid for 5 minutes.</p>`;

      await sendEmail(email, "Your OTP for Signup", html);

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
        email: VALIDATION_RULES.USER.EMAIL,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const user = await User.findOne({
        where: { email },
        isDeleted: false,
        attributes: ["id", "otp", "otpCreatedAt"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "User not found.",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }

      const isValid = verifyOTP(otp, user.otp, user.otpCreatedAt);

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
        email: VALIDATION_RULES.USER.EMAIL,
        password: VALIDATION_RULES.USER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const user = await User.findOne({
        where: { email },
        attributes: ["id", "email", "password", "accessToken"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "User not found.",
          data: "",
          error: "",
        });
      }

      const valid = await comparePassword(password, user.password);

      if (!valid) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Invalid credentials.",
          data: "",
          error: "",
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
      });

      user.accessToken = token;
      await user.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Login successful.",
        data: { token, userId: user.id },
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
      const { userId } = req.params;

      const user = await User.findOne({
        where: { id: userId, isDeleted: false },
        attributes: ["id", "name", "accessToken"],
      });

      if (!user) {
        return res.json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "invalidCredentials",
          data: "",
          error: "",
        });
      }
      if (!user.accessToken) {
        return res.json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Already logged out",
          data: "",
          error: "",
        });
      }
      // Set accessToken to NULL (logout)
      await User.update(
        {
          accessToken: null,
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: userId,
          isLogin: false,
          isOnlin: false,
        },
        { where: { id: userId, isDeleted: false } }
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
