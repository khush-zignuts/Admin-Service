module.exports = {
  //? Validation Rules
  VALIDATION_RULES: {
    USER: {
      NAME: "required|string|min:1|max:30",
      EMAIL: "required|email",
      PASSWORD:
        "required|min:8|max:16|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/",
      PHONE_NUMBER: "required|string|min:10|regex:/^[0-9]{10,}$/",
      ACCESS_TOKEN: "string",
      ROLE: "required|string|in:ADMIN,USER",
    },
  },
};
