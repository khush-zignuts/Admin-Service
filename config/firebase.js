const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./data.json");

try {
  // Initialize Firebase Admin
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
  throw error;
  // process.exit(1);
}

module.exports = firebaseAdmin;
