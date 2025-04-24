const Admin = require("./Admin");
const Booking = require("./Booking");
const Chat = require("./Chat");
const EmailQueue = require("./Emailqueue");
const Event = require("./Event");
const EventFeedback = require("./EventFeedback");
const Message = require("./Message");
const User = require("./User");
const Notification = require("./Notification");
const Organizer = require("./Organizer");

// ================= ASSOCIATIONS =====================

// Admin.sync({ force: true, alter: true });
// Booking.sync({ force: true, alter: true });
// Chat.sync({ force: true, alter: true });
// EmailQueue.sync({ force: true, alter: true });
// Event.sync({ force: true, alter: true });
// EventFeedback.sync({ force: true, alter: true });
// Message.sync({ force: true, alter: true });
// User.sync({ force: true, alter: true });
// Notification.sync({ force: true, alter: true });
// Organizer.sync({ force: true, alter: true });

//organizer
//organizer and Chat associations
Organizer.hasMany(Chat, { foreignKey: "organizerId", onDelete: "CASCADE" });
Chat.belongsTo(Organizer, { foreignKey: "organizerId" });

// Event belongs to Organizer
Organizer.hasMany(Event, { foreignKey: "organizerId", onDelete: "CASCADE" });
Event.belongsTo(Organizer, { foreignKey: "organizerId" });

//event

// Event and Booking
Event.hasMany(Booking, { foreignKey: "eventId", onDelete: "CASCADE" });
Booking.belongsTo(Event, { foreignKey: "eventId" });

//event and  eventfreedback
Event.hasMany(EventFeedback, { foreignKey: "eventId", onDelete: "CASCADE" });
EventFeedback.belongsTo(Event, { foreignKey: "eventId" });

// Event - Notification
Event.hasMany(Notification, { foreignKey: "eventId" });
Notification.belongsTo(Event, { foreignKey: "eventId" });

//User

// User and Booking
User.hasMany(Booking, { foreignKey: "userId", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "userId" });

//user and chat
User.hasMany(Chat, { foreignKey: "userId", onDelete: "CASCADE" });
Chat.belongsTo(User, { foreignKey: "userId" });

//User and  Notification
User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });

// EventFeedback
User.hasMany(EventFeedback, { foreignKey: "userId", onDelete: "CASCADE" });
EventFeedback.belongsTo(User, { foreignKey: "userId" });

//chat
// Message associations
Chat.hasMany(Message, { foreignKey: "chatId", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

// ================= EXPORT ALL MODELS =================

module.exports = {
  User,
  Event,
  Booking,
  Chat,
  Message,
  Organizer,
  Admin,
  EmailQueue,
  EventFeedback,
  Notification,
};
