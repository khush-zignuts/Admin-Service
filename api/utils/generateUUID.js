const { v4: uuidv4 } = require("uuid");

const generateUUID = () => {
  try {
    return uuidv4();
  } catch (error) {
    console.error("Error generating UUID:", error.message);
    return null; // Or throw error if you want to handle it higher
  }
};

module.exports = generateUUID;
