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

  generateUUID: () => uuidv4(),
};
