const Admin = require("./Admin");
const Booking = require("./Booking");
const Chat = require("./Chat");
const EmailQueue = require("./Emailqueue");
const Event = require("./Event");
const EventFeedback = require("./EventFeedback");
const EventReminder = require("./EventReminder");
const Message = require("./Message");
const User = require("./User");
const Notification = require("./Notification");

// ================= ASSOCIATIONS =====================

// Admin and Event
Admin.hasMany(Event, { foreignKey: "organizerId", onDelete: "CASCADE" });
Event.belongsTo(Admin, { foreignKey: "organizerId" });

// User and Booking
User.hasMany(Booking, { foreignKey: "userId", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "userId" });

// Admin and Booking
Admin.hasMany(Booking, { foreignKey: "organiserId", onDelete: "CASCADE" });
Booking.belongsTo(Admin, { foreignKey: "organiserId" });

// Event and Booking
Event.hasMany(Booking, { foreignKey: "eventId", onDelete: "CASCADE" });
Booking.belongsTo(Event, { foreignKey: "eventId" });

// Chat associations
User.hasMany(Chat, { foreignKey: "userId", onDelete: "CASCADE" });
Chat.belongsTo(User, { foreignKey: "userId" });

Admin.hasMany(Chat, { foreignKey: "adminId", onDelete: "CASCADE" });
Chat.belongsTo(Admin, { foreignKey: "adminId" });

Event.hasMany(Chat, { foreignKey: "eventId", onDelete: "CASCADE" });
Chat.belongsTo(Event, { foreignKey: "eventId" });

// Message associations
Chat.hasMany(Message, { foreignKey: "chatId", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chatId" });

// User.hasMany(Message, { foreignKey: "senderId", onDelete: "CASCADE" });
// User.hasMany(Message, { foreignKey: "receiverId", onDelete: "CASCADE" });
// Message.belongsTo(User, { foreignKey: "senderId", as: "Sender" });
// Message.belongsTo(User, { foreignKey: "receiverId", as: "Receiver" });

Event.hasMany(Message, { foreignKey: "eventId", onDelete: "CASCADE" });
Message.belongsTo(Event, { foreignKey: "eventId" });

// EventFeedback
User.hasMany(EventFeedback, { foreignKey: "userId", onDelete: "CASCADE" });
EventFeedback.belongsTo(User, { foreignKey: "userId" });

Event.hasMany(EventFeedback, { foreignKey: "eventId", onDelete: "CASCADE" });
EventFeedback.belongsTo(Event, { foreignKey: "eventId" });

// EventReminder
User.hasMany(EventReminder, { foreignKey: "userId", onDelete: "CASCADE" });
EventReminder.belongsTo(User, { foreignKey: "userId" });

Event.hasMany(EventReminder, { foreignKey: "eventId", onDelete: "CASCADE" });
EventReminder.belongsTo(Event, { foreignKey: "eventId" });

// Notification
User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });

// ================= EXPORT ALL MODELS =================

module.exports = {
  User,
  Event,
  Booking,
  Chat,
  Message,
  Admin,
  EmailQueue,
  EventFeedback,
  EventReminder,
  Notification,
};
