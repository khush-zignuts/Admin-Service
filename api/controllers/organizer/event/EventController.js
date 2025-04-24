const { Event } = require("../../models/index");
const { HTTP_STATUS_CODES } = require("../../../config/constant");
const { VALIDATION_RULES } = require("../../../config/validationRules");
const VALIDATOR = require("validatorjs");

const { Sequelize, where } = require("sequelize");
const sequelize = require("../../../config/db");

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
          "organiserId",
          "category",
        ],
      });

      if (existingEvent) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUESTESTESTEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUESTESTEST,
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
        organiserId: req.organizer.id,
        category,
        createdBy: req.organizer.id,
        updatedBy: req.organizer.id,
      });

      const event = {
        id: eventCreated.id,
        title,
        description,
        location,
        date,
        time,
        capacity,
        organiserId: req.organizer.id,
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
      const organizerId = req.organizer.id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const replacements = { limit, offset, organizerId };

      let whereClause = `WHERE e.is_deleted = false AND e.organiser_id = :organizerId`;
      let paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.date,
          e.time,
          e.available_seats AS capacity,
          e.category
        FROM event AS e
        ${whereClause}
        ORDER BY e.date ASC, e.time ASC
        ${paginationClause};
      `;

      const events = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const countQuery = `
        SELECT COUNT(id) AS total
        FROM event e
        ${whereClause}
        ${paginationClause};
      `;

      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      if (!events || events.length === 0) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "No events found for this organizer.",
          data: [],
          error: "NO_EVENTS_FOUND",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Events fetched successfully.",
        data: {
          events,
          totalRecords,
        },
        error: null,
      });
    } catch (error) {
      console.error("Error fetching events:", error.message);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch events.",
        data: [],
        error: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  },
  //get all event under this organiser
  getEventById: async (req, res) => {
    try {
      const id = req.query.id;
      const organizerId = req.organizer.id;

      const query = `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.date,
          e.time,
          e.available_seats AS capacity,
          e.category
        FROM event AS e
        WHERE e.id = :eventId AND e.organiser_id = :organizerId AND e.is_deleted = false
        LIMIT 1;
      `;

      const [event] = await sequelize.query(query, {
        replacements: { eventId: id, organizerId },
        type: Sequelize.QueryTypes.SELECT,
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          success: false,
          statusCode: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: null,
          error:
            "Event with the given ID does not exist or does not belong to this organizer",
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
      const id = req.query.id;
      console.log("id: ", id);

      const event = await Event.findOne({
        where: {
          id: id,
        },
        attributes: ["id"],
      });

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

      if (req.body.title) {
        updatedData.title = req.body.title;
      }
      if (req.body.description) updatedData.description = req.body.description;
      if (req.body.date) updatedData.date = req.body.date;
      if (req.body.location) updatedData.location = req.body.location;
      if (req.body.capacity) updatedData.capacity = req.body.capacity;

      // Only update the event if there are fields to be updated
      if (Object.keys(updatedData).length > 0) {
        updatedData.updatedBy = req.organizer.id;
        await event.update(updatedData);
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        statusCode: HTTP_STATUS_CODES.OK,
        message: "Event updated successfully",
        data: updatedData,
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
      const eventId = req.query.id;

      const event = await Event.findOne({
        where: {
          id: eventId,
        },
        attributes: ["id"],
      });
      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: "",
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
