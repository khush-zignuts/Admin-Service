const express = require("express");

const authController = require("./auth/authController");
const eventController = require("./event/eventController");

module.exports = {
  authController,
  eventController,
};
