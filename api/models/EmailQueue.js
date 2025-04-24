const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CommonFields = require("./CommanFields");
const EmailQueue = sequelize.define(
  "EmailQueue",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "user",
        key: "email",
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "emailqueue",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = EmailQueue;
