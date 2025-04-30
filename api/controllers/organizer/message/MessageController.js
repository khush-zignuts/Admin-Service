const { Message } = require("../../../models/index");
const { HTTP_STATUS_CODES } = require("../../../../config/constant");
const { Op } = require("sequelize");

const saveMessage = async (req, res) => {
  try {
    // console.log("req.body: ", req.body);
    const { chatId, senderId, receiverId, message, eventId } = req.body;
    console.log("User Enter in save message : ");

    // Save message to DB
    const savedMessage = await Message.create({
      chatId,
      senderId,
      receiverId,
      content: message,
      eventId: eventId,
      deliveredAt: Math.floor(Date.now() / 1000) * 1000,
    });

    console.log("Message sent successfully.");
    return res.status(HTTP_STATUS_CODES.CREATED).json({
      status: HTTP_STATUS_CODES.CREATED,
      message: "Message sent successfully.",
      data: savedMessage,
      error: "",
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.SERVER_ERROR,
      message: "Failed to send message.",
      data: "",
      error: error.message || "Internal server error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    console.log("chatId: ", chatId);
    const senderId = req.user.id;
    console.log("senderId: ", senderId);

    const limit = parseInt(req.query.limit) || 20;
    const before = req.query.before ? new Date(req.query.before) : new Date();

    const messages = await Message.findAll({
      where: {
        chatId,
        createdAt: { [Op.lt]: before },
      },
      order: [["createdAt", "DESC"]],
      limit,
    });

    return res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: "Messages fetched successfully.",
      data: messages,
      error: "",
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.SERVER_ERROR,
      message: "Failed to fetch messages.",
      data: "",
      error: err.message || "Internal server error",
    });
  }
};

// const getMessagesByChatId = async (req, res) => {
//   try {
//     const { chatId } = req.params;

//     const messages = await Message.findAll({
//       where: { chatId },
//       order: [["createdAt", "ASC"]], // oldest to newest
//     });

//     return res.status(200).json({
//       status: 200,
//       message: "Messages fetched successfully.",
//       data: messages,
//     });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Failed to fetch messages.",
//       error: error.message,
//     });
//   }
// };

// const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const { userId, deleteForEveryone } = req.body;

//     const message = await Message.findByPk(messageId);

//     if (!message) {
//       return res.status(404).json({
//         status: false,
//         message: "Message not found",
//         error: "MESSAGE_NOT_FOUND",
//       });
//     }

//     if (deleteForEveryone) {
//       // Only sender can delete for everyone
//       if (message.senderId !== userId) {
//         return res.status(403).json({
//           status: false,
//           message: "Unauthorized",
//           error: "ONLY_SENDER_CAN_DELETE_FOR_EVERYONE",
//         });
//       }

//       message.isDeletedForEveryone = true;
//       await message.save();

//       return res.status(200).json({
//         status: true,
//         message: "Message deleted for everyone",
//       });
//     } else {
//       if (!message.deletedFor.includes(userId)) {
//         message.deletedFor.push(userId);
//         await message.save();
//       }

//       return res.status(200).json({
//         status: true,
//         message: "Message deleted for you",
//       });
//     }
//   } catch (error) {
//     console.error("deleteMessage error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

module.exports = {
  saveMessage,
  getMessages,
  // deleteMessage,
};
