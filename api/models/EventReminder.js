const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CommonFields = require("./CommanFields");

const EventReminder = sequelize.define(
  "EventReminder",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "user",
        key: "id",
      },
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "eventreminder",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = EventReminder;
