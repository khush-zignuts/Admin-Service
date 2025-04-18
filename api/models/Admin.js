const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { CommonFields, commonOptions } = require("./CommanFields");

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: "phone_number",
    },
    accessToken: {
      type: DataTypes.TEXT,
      field: "access_token",
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    otpCreatedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "otp_created_at",
    },
    ...CommonFields,
  },
  {
    tableName: "admin",
    freezeTableName: true,
    ...commonOptions,
  }
);

module.exports = Admin;
