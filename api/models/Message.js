const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CommonFields = require("./CommanFields");
const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.UUID,

      allowNull: false,
      field: "chat_id",
      references: {
        model: "chat",
        key: "id",
      },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id",
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "receiver_id",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "event_id",
      references: {
        model: "event",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("booked", "cancelled"),
      defaultValue: "booked",
    },

    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "delivered_at",
    },
  },
  {
    tableName: "message",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Message;
