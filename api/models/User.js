const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const CommonFields = require("./CommanFields");

const User = sequelize.define(
  "User",
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
      unique: true,
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
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
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
    tableName: "user",
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = User;
