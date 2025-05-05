const { OTP_EXPIRY } = require("../../config/constant");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// OTP verification utility
const verifyOTP = (enteredOtp, storedOtp, otpCreatedAt) => {
  try {
    if (!enteredOtp || !storedOtp || !otpCreatedAt) {
      throw new Error("Missing OTP verification data");
    }

    const now = Math.floor(Date.now() / 1000);
    const createdAt = Math.floor(new Date(otpCreatedAt).getTime() / 1000);

    const diffMinutes = (now - createdAt) / 60;
    const isExpired = diffMinutes > OTP_EXPIRY.OTP_EXPIRY_MINUTES;

    return enteredOtp === storedOtp && !isExpired;
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return false;
  }
};

// Compare plain and hashed password
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error.message);
    throw new Error("Failed to compare passwords");
  }
};

// Generate UUID
const generateUUID = () => {
  try {
    return uuidv4();
  } catch (error) {
    console.error("Error generating UUID:", error.message);
    return null;
  }
};

// Hash password
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

// Export all functions
module.exports = {
  verifyOTP,
  comparePassword,
  generateUUID,
  hashPw,
};
