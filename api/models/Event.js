const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { CommonFields, commonOptions } = require("./CommanFields");
const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER, // 100 limit
      allowNull: false,
      field: "available_seats",
    },
    organizerId: {
      type: DataTypes.UUID, // adminId
      allowNull: false,
      field: "organizer_id",
      references: {
        model: "admin",
        key: "id",
      },
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ...CommonFields,
  },
  {
    tableName: "event",
    freezeTableName: true,
    ...commonOptions,
  }
);

module.exports = Event;
