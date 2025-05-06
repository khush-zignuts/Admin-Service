const { VALIDATE_PASSWORD } = require("./constant");

module.exports = {
  //? Validation Rules
  VALIDATION_RULES: {
    ADMIN: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD: VALIDATE_PASSWORD,
      ACCESS_TOKEN: "string",
    },
    USER: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD: VALIDATE_PASSWORD,
      PHONE_NUMBER: "string|min:10|regex:/^[0-9]{10,}$/",
      ACCESS_TOKEN: "string",
      OTP: "string|min:4|max:6",
    },

    ORGANIZER: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD: VALIDATE_PASSWORD,
      PHONE_NUMBER: "string|min:10|regex:/^[0-9]{10,}$/",
      ACCESS_TOKEN: "string",
      OTP: "string|min:4|max:6",
    },
    EVENT: {
      TITLE: "required|string|min:3|max:100",
      DESCRIPTION: "required|string|min:10",
      LOCATION: "required|string|min:2|max:100",
      DATE: "required|date",
      CAPACITY: "required|integer|min:1|max:10000",
      ORGANIZER_ID: "required|string",
      CATEGORY: "required|string|min:3|max:50",
      START_TIME: "required",
      END_TIME: "required",
    },

    BOOKING: {
      USER_ID: "required|string",
      ORGANIZER_ID: "required|string",
      EVENT_ID: "required|string",
      STATUS: "string|in:pending,booked,cancelled",
    },

    CHAT: {
      USER_ID: "required|string",
      ORGANIZER_ID: "required|string",
      EVENT_ID: "required|string",
      LAST_MESSAGE: "string",
    },

    EMAIL_QUEUE: {
      TO: "required|email",
      SUBJECT: "required|string|min:1|max:100",
      BODY: "required|string|min:1",
      IS_SENT: "boolean",
    },

    EVENT_REMINDER: {
      EVENT_ID: "required|string",
      USER_ID: "required|string",
      IS_SENT: "boolean",
      SENT_AT: "date",
    },

    EVENT_FEEDBACK: {
      EVENT_ID: "required|string",
      USER_ID: "required|string",
      RATING: "required|numeric|min:1|max:5",
      COMMENT: "string",
    },

    MESSAGE: {
      CHAT_ID: "required|string",
      SENDER_ID: "required|string",
      RECEIVER_ID: "required|string",
      CONTENT: "required|string|min:1",
      EVENT_ID: "required|string",
      DELIVERED_AT: "date",
    },

    NOTIFICATION: {
      USER_ID: "required|string",
      TITLE: "required|string|min:1|max:100",
      MESSAGE: "required|string|min:1",
      TYPE: "string|in:event,announcement,reminder",
    },
  },
};
