const FCM = require("../../../config/firebase");

// Function to send a single message
const sendMessage = async (message) => {
  try {
    const response = await FCM.messaging().send(message);
    console.log("Push notification sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error.message);
    throw new Error("Failed to send push notification");
  }
};

// Export the functions
module.exports = {
  sendMessage,
};
