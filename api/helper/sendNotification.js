const FCM = require("../../config/firebase");

// Function to send a single message
const sendMessage = async (message) => {
  const response = FCM.messaging().send(message);
  return response;
};

// Export the functions
module.exports = {
  sendMessage,
};
