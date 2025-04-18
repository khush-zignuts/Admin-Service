module.exports = {
  //? Validation Rules
  VALIDATION_RULES: {
    ADMIN: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD:
        "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",
      PHONE_NUMBER: "required|string|min:10|regex:/^[0-9]{10,}$/",
      ACCESS_TOKEN: "string",
      OTP: "string",
    },
    EVENT: {
      TITLE: "required|string|min:3|max:100",
      DESCRIPTION: "required|string|min:10",
      LOCATION: "required|string|min:2|max:100",
      DATE: "required|date",
      TIME: "required|string|min:3|max:20",
      CAPACITY: "required|integer|min:1|max:10000",
      ORGANIZER_ID: "required|string|uuid",
      CATEGORY: "required|string|min:3|max:50",
    },
  },
};
