const bcrypt = require("bcrypt");

const hashPw = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error in hashing password:", error.message);
    throw new Error("Failed to hash password");
  }
};

module.exports = hashPw;
