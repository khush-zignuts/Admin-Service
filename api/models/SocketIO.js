const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { CommonFields, commonOptions } = require("./CommanFields");

const SocketIO = sequelize.define(
  "SocketIO",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id",
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "socket_id",
    },

    ...CommonFields,
  },
  {
    tableName: "socketio",
    freezeTableName: true,
    ...commonOptions,
  }
);

module.exports = SocketIO;
