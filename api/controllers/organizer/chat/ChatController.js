const { Op } = require("sequelize");
const { Chat } = require("../../../models/index");
const { HTTP_STATUS_CODES } = require("../../../../config/constant");

// POST /api/chats/get-or-create
const getorcreate = async (req, res) => {
  const { user1Id, user2Id, eventId } = req.body;

  try {
    let chat = await Chat.findOne({
      where: {
        userId: user2Id,
        organizerId: user1Id,
        eventId: eventId,
      },
      attributes: ["id"],
    });

    if (!chat) {
      chat = await Chat.create({
        userId: user2Id,
        organizerId: user1Id,
        eventId: eventId,
        createdBy: user1Id,
      });

      console.log("Chat created successfully.");
      return res.status(HTTP_STATUS_CODES.CREATED).json({
        status: HTTP_STATUS_CODES.CREATED,
        message: "Chat created successfully.",
        data: chat,
        error: "",
      });
    } else {
      console.log("Chat fetched successfully.");
      console.log("chat: ", chat.id);

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Chat fetched successfully.",
        data: chat.id,
        error: "",
      });
    }
  } catch (error) {
    console.error("Chat get-or-create error:", error);
    return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.SERVER_ERROR,
      message: "Failed to get or create chat",
      data: "",
      error: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getorcreate,
};
