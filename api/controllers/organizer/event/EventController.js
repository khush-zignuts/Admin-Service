const { Event } = require("../../../models/index");
const { HTTP_STATUS_CODES } = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");
const VALIDATOR = require("validatorjs");
const moment = require("moment-timezone");

const { Sequelize, where } = require("sequelize");
const sequelize = require("../../../../config/db");

module.exports = {
  createEvent: async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        date,
        startTime,
        endTime,
        capacity,
        category,
      } = req.body;
      const organizerId = req.organizer.id;
      console.log("organizerId: ", organizerId);
      console.log("req.body: ", req.body);

      // const dateString = req.body.date;
      // const millidateseconds = new Date(dateString).getTime();

      // console.log(millidateseconds); // 👉 1750012800000

      const dateString = req.body.date; // Date string from the request body

      const istMoment = moment.tz(
        dateString + " 00:00:00",
        "YYYY-MM-DD HH:mm:ss",
        "Asia/Kolkata"
      );

      const istDate = istMoment.format("YYYY-MM-DD HH:mm:ss");
      const istMilliseconds = istMoment.valueOf();

      console.log("IST Date:", istDate);
      console.log("Milliseconds in IST:", istMilliseconds);

      const validation = new VALIDATOR(req.body, {
        title: VALIDATION_RULES.EVENT.TITLE,
        description: VALIDATION_RULES.EVENT.DESCRIPTION,
        location: VALIDATION_RULES.EVENT.LOCATION,
        date: VALIDATION_RULES.EVENT.DATE,
        startTime: VALIDATION_RULES.EVENT.START_TIME,
        endTime: VALIDATION_RULES.EVENT.END_TIME,
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
          "startTime",
          "endTime",
          "capacity",
          "organizerId",
          "category",
        ],
      });

      console.log("existingEvent: ", existingEvent);
      if (existingEvent) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Event with the same title and date already exists.",
          data: "",
          error: "Event already exists",
        });
      }

      const eventCreated = await Event.create({
        title,
        description,
        location,
        date: millidateseconds,
        startTime,
        endTime,
        capacity,
        organizerId: req.organizer.id,
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
        startTime,
        endTime,
        capacity,
        organizerId: req.organizer.id,
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
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to create event",
        data: "",
        error: error.message,
      });
    }
  },

  //get all event under this organiser
  getAllEventsBySearch: async (req, res) => {
    try {
      const id = req.query.id || null;
      const organizerId = req.organizer.id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      let replacements = { limit, offset };

      let whereClause = `WHERE e.is_deleted = false `;

      if (id) {
        console.log("first");
        whereClause += `\n AND e.id = :id `;
        replacements.id = id;
        console.log("replacements: ", replacements);
      }

      let paginationClause = `LIMIT :limit OFFSET :offset`;

      const query = `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.date,
          e.start_time,
          e.end_time,
          e.available_seats AS capacity,
          e.category
        FROM event AS e
        ${whereClause}
        ORDER BY e.date ASC
     
          `;

      const events = await sequelize.query(query, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });
      console.log("events: ", events);
      const countQuery = `
      SELECT COUNT(e.id) AS total
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
          message: "No events found matching your search.",
          data: [],
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event fetched successfully",
        data: {
          events,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Fetch Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch event",
        data: "",
        error: error.message || "Internal server error",
      });
    }
  },
  updateEvent: async (req, res) => {
    try {
      const id = req.query.id;
      console.log("id: ", id);
      const {
        title,
        description,
        location,
        date,
        startTime,
        endTime,
        capacity,
        category,
      } = req.body;

      const validation = new VALIDATOR(req.body, {
        title: VALIDATION_RULES.EVENT.TITLE,
        description: VALIDATION_RULES.EVENT.DESCRIPTION,
        location: VALIDATION_RULES.EVENT.LOCATION,
        date: VALIDATION_RULES.EVENT.DATE,
        startTime: VALIDATION_RULES.EVENT.START_TIME,
        endTime: VALIDATION_RULES.EVENT.END_TIME,
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

      const event = await Event.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
        attributes: ["id"],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found",
          data: "",
          error: "Event with the given ID does not exist",
        });
      }

      const updatedData = {};

      await event.update(
        {
          title,
          description,
          location,
          date,
          startTime,
          endTime,
          capacity,
          category,
        },
        {
          where: {
            id,
            isDeleted: false,
          },
        }
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event updated successfully",
        data: updatedData,
        error: "",
      });
    } catch (error) {
      console.error("Update Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to update event",
        data: "",
        error: error.message || "Internal server error",
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const eventId = req.query.id;
      const organizerId = req.organizer.id;

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
      event.isActive = false;
      event.deletedAt = new Date();
      event.updatedBy = req.organizer.id;
      await event.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Event deleted successfully",
        data: { id: event.id },
        error: "",
      });
    } catch (error) {
      console.error("Delete Event Error:", error);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to delete event",
        data: "",
        error: error.message,
      });
    }
  },
};
