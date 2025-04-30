const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./data.json");

// Initialize Firebase Admin
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Export the messaging service
module.exports = firebaseAdmin;
