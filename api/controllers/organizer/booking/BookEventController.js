const { HTTP_STATUS_CODES } = require("../../../../config/constant");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../../../../config/db");
const {
  Event,
  Booking,
  User,
  Notification,
  Organizer,
} = require("../../../models/index");
const { formatDate } = require("../../../helper/formattedDate");
const sendEmail = require("../../../helper/sendEmail");
const { sendMessage } = require("../../../helper/sendNotification");

module.exports = {
  getAllPendingRequest: async (req, res) => {
    try {
      const organizerId = req.organizer.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const replacements = { organizerId, limit, offset };

      const whereClause = `
        WHERE b.organizer_id = :organizerId AND b.status = 'pending'
      `;
      const paginationClause = `LIMIT :limit OFFSET :offset`;

      const rawQuery = `
        SELECT
          b.id AS "bookingId",
          u.name AS "userName",
          b.user_id AS "userId",
          b.event_id AS "eventId",
          e.title AS eventTitle,
          b.status
        FROM booking AS b
        INNER JOIN "user" AS u ON u.id = b.user_id
        INNER JOIN event AS e ON e.id = b.event_id
        ${whereClause}
        ORDER BY e.date ASC, e.start_time ASC
        ${paginationClause};
      `;

      const pendingRequests = await sequelize.query(rawQuery, {
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

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Pending booking requests fetched successfully.",

        data: {
          requests: pendingRequests,
          totalRecords,
        },
        error: "",
      });
    } catch (error) {
      console.error("Error fetching pending requests:", error.message);
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Failed to fetch pending requests.",
        data: [],
        error: error.message || "SERVER_ERROR",
      });
    }
  },

  acceptUserForEvent: async (req, res) => {
    try {
      console.log("first");
      const { userId, eventId, fcmToken } = req.body;
      // const organizerId = req.organizer.id;
      console.log("req.body: ", req.body);

      const booked = await Booking.findOne({
        where: {
          userId,
          eventId,
          status: "booked",
        },
        attributes: ["id", "status"],
      });
      console.log("booked: ", booked);

      if (booked) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "This user has already booked the event.",
          data: "",
          error: "BOOKING_ALREADY_EXISTS",
        });
      }
      console.log("first");

      // Update booking status
      await Booking.update(
        { status: "booked" },
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
      console.log("event: ", event);

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
      const body = `You've been accepted for the event: ${event.title} on ${event.date} at ${event.time}.  
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
        { status: "cancelled" },
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
        attributes: ["id"],
      });
      console.log("event: ", event);

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
        where: {
          id: userId,
        },
        attributes: ["id"],
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
        eventTime: event.time,
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
