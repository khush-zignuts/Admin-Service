const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CommonFields = require("./CommanFields");

const Chat = sequelize.define(
  "Chat",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id", // participant
      references: {
        model: "user",
        key: "id",
      },
    },
    organizerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "organizer_id", //  event organiser
      references: {
        model: "organizer",
        key: "id",
      },
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
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "chat",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Chat;
