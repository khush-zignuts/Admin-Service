const socketIo = require("socket.io");
const { Event, User, Organizer } = require("../api/models/index");

let io;
let users = {};
const socketSetup = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // socket.on("userRegistered", (data) => {
    //   const { userId } = data;
    //   users[userId] = socket.id;
    //   console.log("Organizer registered:", users);
    // });

    // registration event
    socket.on("registered", async (data) => {
      const { userId, eventId } = data;

      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "name", "email"],
      });

      const userName = user.name;

      // Fetch the event and organizerId
      const event = await Event.findOne({
        where: { id: eventId },
        attributes: ["id", "organizerId"],
      });

      const organizerId = event.organizerId;

      const organizer = await Organizer.findOne({
        where: { id: organizerId },
        attributes: ["id", "name", "email"],
      });

      const organizerName = organizer.name;

      // Store user and organizer socket mappings
      users[organizerId] = socket.id;
      console.log("users: ", users);

      socket.emit("registered", {
        organizerId: organizerId,
        organizerName: organizerName,
        userName: userName,
        message: `${user.name} has connected with socket ID ${socket.id}`,
      });
    });

    // Handle sending messages
    socket.on("sendMessage", (data) => {
      const { chatId, senderId, receiverId, eventId, message } = data;
      console.log("data: ", data);
      const messagePayload = {
        chatId,
        senderId,
        receiverId,
        eventId,
        message,
      };

      // Emit message to the sender and receiver
      if (users[receiverId]) {
        io.to(users[receiverId]).emit("message", messagePayload);
      }

      if (users[senderId]) {
        io.to(users[senderId]).emit("message", messagePayload);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      // You can remove userId/organizerId mappings here if needed
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          break;
        }
      }
    });
  });
};

module.exports = { socketSetup };
