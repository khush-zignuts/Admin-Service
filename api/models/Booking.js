const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CommonFields = require("./CommanFields");

const Booking = sequelize.define(
  "Booking",
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
      field: "user_id",
      references: {
        model: "user",
        key: "id",
      },
    },
    organiserId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "organiser_id",
      references: {
        model: "admin",
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
    status: {
      type: DataTypes.ENUM("pending", "booked", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "booking",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Booking;
