const { Event } = require("../../models/index");
const { HTTP_STATUS_CODES } = require("../../../config/constant");
const { VALIDATION_RULES } = require("../../../config/validationRules");
const VALIDATOR = require("validatorjs");

module.exports = {
  createEvent: async (req, res) => {
    try {
      const { title, description, location, date, time, capacity, category } =
        req.body;
      console.log("req.body: ", req.body);

      const validation = new VALIDATOR(req.body, {
        title: VALIDATION_RULES.EVENT.TITLE,
        description: VALIDATION_RULES.EVENT.DESCRIPTION,
        location: VALIDATION_RULES.EVENT.LOCATION,
        date: VALIDATION_RULES.EVENT.DATE,
        time: VALIDATION_RULES.EVENT.TIME,
        capacity: VALIDATION_RULES.EVENT.CAPACITY,
        category: VALIDATION_RULES.EVENT.CATEGORY,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }
      const existingEvent = await Event.findOne({
        where: {
          title: title,
          isDeleted: false,
        },
        attributes: [
          "title",
          "description",
          "location",
          "date",
          "time",
          "capacity",
          "organizerId",
          "category",
        ],
      });

      if (existingEvent) {
        return res.status(HTTP_STATUS_CODES.CONFLICT).json({
          status: HTTP_STATUS_CODES.CONFLICT,
          message: "Event with the same title and date already exists.",
          data: "",
          error: "Event already exists",
        });
      }

      const eventCreated = await Event.create({
        title,
        description,
        location,
        date,
        time,
        capacity,
        organizerId: req.admin.id,
        category,
        createdBy: req.admin.id,
        updatedBy: req.admin.id,
      });

      const event = {
        id: eventCreated.id,
        title,
        description,
        location,
        date,
        time,
        capacity,
        organizerId: req.admin.id,
        category,
      };

      return res.status(HTTP_STATUS_CODES.CREATED).json({
        status: HTTP_STATUS_CODES.CREATED,
        message: "Event created successfully",
        data: event,
        error: "",
      });
    } catch (error) {
      console.error("Create Event Error:", error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create event",
        data: "",
        error: error.message,
      });
    }
  },
  getAllEvents: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: events } = await Event.findAndCountAll({
        limit,
        offset,
        order: [
          ["date", "ASC"],
          ["time", "ASC"],
        ],
      });

      return res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        statusCode: HTTP_STATUS_CODES.OK,
        message: "Events fetched successfully",
        data: {
          events,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
          },
        },
        error: "",
      });
    } catch (error) {
      console.error("Fetch Events Error:", error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch events",
        data: null,
        error: error.message || "Internal server error",
      });
    }
  },

  getEventById: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          statusCode: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: null,
          error: "Event with the given ID does not exist",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        statusCode: HTTP_STATUS_CODES.OK,
        message: "Event fetched successfully",
        data: event,
        error: "",
      });
    } catch (error) {
      console.error("Fetch Event Error:", error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch event",
        data: null,
        error: error.message || "Internal server error",
      });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const { id } = req.params.id;

      const event = await Event.findByPk(id);

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          statusCode: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: null,
          error: "Event with the given ID does not exist",
        });
      }

      const updatedData = {};

      if (req.body.title) updatedData.title = req.body.title;
      if (req.body.description) updatedData.description = req.body.description;
      if (req.body.date) updatedData.date = req.body.date;
      if (req.body.location) updatedData.location = req.body.location;
      if (req.body.capacity) updatedData.capacity = req.body.capacity;

      updatedData.updatedBy = req.user.id;

      // Only update the event if there are fields to be updated
      if (Object.keys(updatedData).length > 0) {
        await event.update(updatedData);
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        statusCode: HTTP_STATUS_CODES.OK,
        message: "Event updated successfully",
        data: event,
        error: "",
      });
    } catch (error) {
      console.error("Update Event Error:", error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to update event",
        data: null,
        error: error.message || "Internal server error",
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params.id;

      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: null,
          error: "No event with the provided ID",
        });
      }

      event.isDeleted = true;
      event.deletedAt = new Date();
      event.updatedBy = req.user.id;
      await event.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event deleted successfully",
        data: { id: event.id },
        error: "",
      });
    } catch (error) {
      console.error("Delete Event Error:", error);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to delete event",
        data: "",
        error: error.message,
      });
    }
  },
};
