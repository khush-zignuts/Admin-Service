const { v4: uuidv4 } = require("uuid");

module.exports = {
  //? HTTP Status Codes
  HTTP_STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
  OTP_EXPIRY: {
    OTP_EXPIRY_MINUTES: "10d",
  },

  TOKEN_EXPIRY: {
    ACCESS_TOKEN: "5d",
  },
  VALIDATE_PASSWORD:
    "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",

  BOOKING_STATUS: {
    PENDING: "pending",
    BOOKED: "booked",
    CANCELLED: "cancelled",
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },
};
