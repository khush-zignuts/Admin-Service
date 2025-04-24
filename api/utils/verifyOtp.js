const { OTP_EXPIRY } = require("../../config/constant");

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

module.exports = verifyOTP;
