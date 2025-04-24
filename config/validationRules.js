module.exports = {
  //? Validation Rules
  VALIDATION_RULES: {
    ADMIN: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD:
        "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",
      ACCESS_TOKEN: "string",
    },
    USER: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD:
        "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",
      PHONE_NUMBER: "string|min:10|regex:/^[0-9]{10,}$/",
      ACCESS_TOKEN: "string",
      OTP: "string|min:4|max:6",
    },

    ORGANIZER: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD:
        "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",
      PHONE_NUMBER: "string|min:10|regex:/^[0-9]{10,}$/",
      ACCESS_TOKEN: "string",
      OTP: "string|min:4|max:6",
    },

    EVENT: {
      TITLE: "required|string|min:3|max:100",
      DESCRIPTION: "required|string|min:10",
      LOCATION: "required|string|min:2|max:100",
      DATE: "required|date",
      TIME: "required|string|min:3|max:20",
      CAPACITY: "required|integer|min:1|max:10000",
      ORGANISER_ID: "required|string|uuid",
      CATEGORY: "required|string|min:3|max:50",
    },

    BOOKING: {
      USER_ID: "required|string|uuid",
      ORGANISER_ID: "required|string|uuid",
      EVENT_ID: "required|string|uuid",
      STATUS: "string|in:pending,booked,cancelled",
    },

    CHAT: {
      USER_ID: "required|string|uuid",
      ORGANIZER_ID: "required|string|uuid",
      EVENT_ID: "required|string|uuid",
      LAST_MESSAGE: "string",
    },

    EMAIL_QUEUE: {
      TO: "required|email",
      SUBJECT: "required|string|min:1|max:100",
      BODY: "required|string|min:1",
      IS_SENT: "boolean",
    },

    EVENT_REMINDER: {
      EVENT_ID: "required|string|uuid",
      USER_ID: "required|string|uuid",
      IS_SENT: "boolean",
      SENT_AT: "date",
    },

    EVENT_FEEDBACK: {
      EVENT_ID: "required|string|uuid",
      USER_ID: "required|string|uuid",
      RATING: "required|integer|min:1|max:5",
      COMMENT: "string",
    },

    MESSAGE: {
      CHAT_ID: "required|string|uuid",
      SENDER_ID: "required|string|uuid",
      RECEIVER_ID: "required|string|uuid",
      CONTENT: "required|string|min:1",
      EVENT_ID: "required|string|uuid",
      DELIVERED_AT: "date",
    },

    NOTIFICATION: {
      USER_ID: "required|string|uuid",
      TITLE: "required|string|min:1|max:100",
      MESSAGE: "required|string|min:1",
      TYPE: "string|in:event,announcement,reminder",
    },
  },
};
