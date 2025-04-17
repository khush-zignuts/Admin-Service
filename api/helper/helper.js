// helpers/helper.js
const bcrypt = require("bcrypt");
const { OTP_EXPIRY } = require("../../config/constant");
const { v4: uuidv4 } = require("uuid");

const generateUUID = () => uuidv4();

const hashPw = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const verifyOTP = (enteredOtp, storedOtp, otpCreatedAt) => {
  const now = Math.floor(Date.now() / 1000);
  const createdAt = new Date(otpCreatedAt);
  const diffMinutes = (now - createdAt) / 1000 / 60;
  const isExpired = diffMinutes > OTP_EXPIRY.OTP_EXPIRY_MINUTES;

  return enteredOtp === storedOtp && !isExpired;
};

module.exports = {
  hashPw,
  verifyOTP,
  comparePassword,
  generateUUID,
};
