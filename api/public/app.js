require("dotenv").config();
// Your Firebase config

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Request permission and get FCM token
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      const token = await messaging.getToken({
        vapidKey:
          "BCbG0VBa8sugqayaF25cfdRZSPn06DUvgCPa9cDZT9bCf-tdiECrTaZR7Fr-E8dEfwtU7QzM-w2BIKzE20RA-dM", // Get this from Firebase Console > Project Settings > Cloud Messaging
      });

      if (token) {
        console.log("FCM Token:", token);
        // 👉 Send this token to your backend to store it for push notifications
      } else {
        console.warn("No registration token available.");
      }
    } else {
      console.warn("Permission not granted.");
    }
  } catch (err) {
    console.error("Error getting permission or token", err);
  }
}

// Optional: handle messages when the page is open
messaging.onMessage((payload) => {
  console.log("Message received in foreground:", payload);
  const { title, body } = payload.notification;

  new Notification(title, {
    body,
  });
});
