const bcrypt = require("bcrypt");

const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error.message);
    throw new Error("Failed to compare passwords");
  }
};

module.exports = comparePassword;
