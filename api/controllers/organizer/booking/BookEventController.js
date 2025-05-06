const {
  HTTP_STATUS_CODES,
  BOOKING_STATUS,
  PAGINATION,
} = require("../../../../config/constant");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../../../../config/db");
const {
  Event,
  Booking,
  User,
  Notification,
  Organizer,
} = require("../../../models/index");
const { formatDate } = require("../../../helper/Date/formattedDate");
const sendEmail = require("../../../helper/Mail/sendEmail");
const {
  sendMessage,
} = require("../../../helper/Notification/sendNotification");

module.exports = {
  getAllUsersByBookingStatus: async (req, res) => {
    try {
      const organizerId = req.organizer.id;
      const status = req.query.status?.toLowerCase() || "pending"; // default to 'pending'
      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      if (!["pending", "booked", "cancelled"].includes(status)) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message:
            "Invalid status type. Must be 'pending', 'booked', or 'cancelled'.",
          data: [],
          error: "INVALID_STATUS",
        });
      }
      const replacements = { organizerId, limit, offset, status };

      const whereClause = `
      WHERE b.organizer_id = :organizerId AND b.status = :status
    `;
      const paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
      SELECT
        b.id AS "bookingId",
        u.name AS "userName",
        u.email AS "userEmail",
        b.user_id AS "userId",
        b.event_id AS "eventId",
        e.title AS "eventTitle",
        e.date AS "eventDate",
        e.start_time AS "eventStartTime",
        e.end_time AS "eventEndTime",
        e.location AS "eventLocation",
        b.status
      FROM booking AS b
      INNER JOIN "user" AS u ON u.id = b.user_id
      INNER JOIN event AS e ON e.id = b.event_id
      ${whereClause}
      ORDER BY e.date ASC, e.start_time ASC
      ${paginationClause};
    `;

      const users = await sequelize.query(rawQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const countQuery = `
        SELECT COUNT(id) AS total
        FROM booking AS b
        ${whereClause};
      `;

      const countResult = await sequelize.query(countQuery, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

      const totalRecords = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalRecords / limit);

      if (totalRecords === 0) {
        return res.status(HTTP_STATUS_CODES.OK).json({
          status: HTTP_STATUS_CODES.OK,
          message: `No users found with status '${status}'.`,
          data: {
            users: [],
            pagination: {
              totalRecords: 0,
            },
          },
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: `${
          status[0].toUpperCase() + status.slice(1)
        } booking users fetched successfully.`,
        data: {
          users,
          pagination: {
            totalRecords,
          },
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching users by booking status:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch users by status.",
        data: [],
        error: error.message || "SERVER_ERROR",
      });
    }
  },

  acceptUserForEvent: async (req, res) => {
    try {
      const { userId, eventId, fcmToken } = req.body;
      // const organizerId = req.organizer.id;

      const booked = await Booking.findOne({
        where: {
          userId,
          eventId,
          status: BOOKING_STATUS.BOOKED,
        },
        attributes: ["id", "status"],
      });

      if (booked) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "This user has already booked the event.",
          data: "",
          error: "BOOKING_ALREADY_EXISTS",
        });
      }

      // Update booking status
      await Booking.update(
        { status: BOOKING_STATUS.BOOKED },
        {
          where: {
            userId: userId,
            eventId: eventId,
          },
        }
      );

      // Fetch event details
      const event = await Event.findOne({
        where: {
          id: eventId,
        },
        attributes: [
          "id",
          "title",
          "date",
          "startTime",
          "organizerId",
          "endTime",
          "location",
        ],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found.",
          data: [],
          error: "EVENT_NOT_FOUND",
        });
      }

      const organizer = await Organizer.findOne({
        where: { id: event.organizerId, isDeleted: false },
        attributes: ["id", "name", "email"],
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Organizer not found.",
          data: "",
          error: "",
        });
      }

      const user = await User.findOne({
        where: { id: userId, isDeleted: false },
        attributes: ["id", "name", "email", "phoneNumber"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "User not found.",
          data: "",
          error: "",
        });
      }

      // Format the event date
      const formattedDate = formatDate(event.date);

      //  Send the email using Handlebars template
      const emailTemplateData = {
        userName: user.name,
        eventTitle: event.title,
        eventDate: formattedDate,
        eventStartTime: event.startTime,
        organizerName: organizer.name,
        eventVenue: event.location,
        userPhone: user.phoneNumber,
      };

      await sendEmail(
        user.email,
        "You have been accepted for the event!",
        "../../assets/templates/event-acceptance-email.hbs",
        emailTemplateData
      );

      // Create and send push notification
      const title = ` Congratulations, ${user.name}!`;
      const body = `You've been accepted for the event: ${event.title} on ${event.date} at ${event.startTime}.  
                    If you have any questions, 
                    feel free to reach out to the organizer, 
                    ${organizer.name}, via the chat button provided.
`;

      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          eventId,
          userId,
        },
      };

      await sendMessage(message);

      // Save in Notification model
      await Notification.create({
        userId: userId,
        eventId: eventId,
        title: title,
        message: body,
        type: "event", // from ENUM
      });

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "User accepted, added to event, and email sent.",
        data: "",
        error: "",
      });
    } catch (error) {
      console.error("Error accepting user for event:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to accept user for event.",
        data: [],
        error: error || "SERVER_ERROR",
      });
    }
  },

  declineUserForEvent: async (req, res) => {
    try {
      const { userId, eventId, fcmToken } = req.body;

      // Update booking status to cancelled
      await Booking.update(
        { status: BOOKING_STATUS.CANCELLED },
        {
          where: {
            userId: userId,
            eventId: eventId,
            status: BOOKING_STATUS.PENDING,
          },
        }
      );

      // Fetch event details
      const event = await Event.findOne({
        where: {
          id: eventId,
        },
        attributes: ["id", "title", "date", "startTime", "organizerId"],
      });

      if (!event) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Event not found.",
          data: [],
          error: "EVENT_NOT_FOUND",
        });
      }

      const organizer = await Organizer.findOne({
        where: { id: event.organizerId, isDeleted: false },
        attributes: ["id", "name", "email", "phoneNumber"],
      });

      if (!organizer) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Organizer not found.",
          data: "",
          error: "",
        });
      }

      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "name", "email"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "User not found.",
          data: [],
          error: "USER_NOT_FOUND",
        });
      }

      // Send the email using Handlebars template for decline
      const emailTemplateData = {
        userName: user.name,
        eventTitle: event.title,
        eventDate: event.date,
        eventStartTime: event.startTime,
        organizerName: organizer.name,
        organizerPhonenumber: organizer.phoneNumber,
      };

      await sendEmail(
        user.email,
        "Unfortunately, you have been declined for the event.",
        "../../assets/templates/event-decline-email.hbs",
        emailTemplateData
      );

      // Create and send push notification for decline
      const title = `We're sorry, ${user.name}.`;
      const body = `Unfortunately, you have been declined for the event: 
                    ${event.title} on ${event.date} at ${event.time}
                   If you have any questions, 
                    feel free to reach out to the organizer, 
                    ${organizer.name}, via the chat button provided.
`;

      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          eventId,
          userId,
        },
      };

      await sendMessage(message);

      await Notification.create({
        userId: userId,
        eventId: eventId,
        title: title,
        message: body,
        type: "event", // assuming you're using ENUM
      });

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "User booking declined successfully.",
        data: [],
        error: "",
      });
    } catch (error) {
      console.error("Error declining user for event:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to decline user for event.",
        data: [],
        error: error.message || "SERVER_ERROR",
      });
    }
  },
};
