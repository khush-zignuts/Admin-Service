const socketIo = require("socket.io");
const { Event } = require("../api/models/index");

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

    // registration event
    socket.on("register", async (user, eventId) => {
      console.log(`${user.name} has connected with socket ID ${socket.id}`);

      const userId = user.id;

      // Fetch the event and organizerId
      const event = await Event.findOne({
        where: { id: eventId },
        attributes: ["id", "organizerId"],
      }).then((event) => {
        const organizerId = event.organizerId;

        // Store user and organizer socket mappings
        users[userId] = socket.id;
        users[organizerId] = socket.id;

        socket.emit("registered", {
          organizerId: organizerId,
          message: `${user.name} has connected with socket ID ${socket.id}`,
        });
      });
    });

    // Handle sending messages
    socket.on("sendMessage", (data) => {
      const { chatId, senderId, receiverId, message } = data;
      const messagePayload = {
        chatId,
        senderId,
        receiverId,
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
