const cron = require("node-cron");
const moment = require("moment-timezone");
const { Op } = require("sequelize");
const { Event, Booking, User, Organizer } = require("../models/index");
const { sendEmail } = require("../helper/sendEmail");

const startEventReminderJob = () => {
  cron.schedule("* * * * * *", async () => {
    console.log("startEventReminderJob running every second");
    try {
      console.log("In cron job");
      const now = moment();
      const twentyFourHoursLater = now.clone().add(24, "hours");

      // Convert twentyFourHoursLater to a BIGINT timestamp in milliseconds
      const timestamp = twentyFourHoursLater.valueOf();

      // Fetch events happening exactly 24 hours from now
      const events = await Event.findAll({
        where: {
          // Check if the event's date (BIGINT) matches 24 hours from now
          date: {
            [Op.eq]: timestamp, // This assumes 'date' is stored as a BIGINT
          },
          start_time: {
            [Op.eq]: twentyFourHoursLater.format("HH:mm:ss"),
          },
        },
        attributes: [
          "id",
          "title",
          "date",
          "start_time",
          "organizerId",
          "location",
        ],
      });

      console.log("events: ", events);

      for (const event of events) {
        const bookings = await Booking.findAll({
          where: { eventId: event.id, status: "booked" },
          attributes: ["userId", "organizerId"],
        });

        for (const booking of bookings) {
          const user = await User.findOne({
            where: { id: booking.userId },
            attributes: ["name", "email", "phone"],
          });

          const organizer = await Organizer.findOne({
            where: { id: booking.organizerId },
            attributes: ["name"],
          });

          const to = user.email;
          const subject = `Reminder: Your event "${event.title}" is starting soon`;
          const templatePath = "emails/eventReminder";
          const templateData = {
            eventTitle: event.title,
            eventDate: moment(event.date).format("YYYY-MM-DD"),
            eventStartTime: event.start_time,
            eventVenue: event.location,
            organizerName: organizer.name,
            userName: user.name,
          };

          console.log("email data: ", templateData);

          await sendEmail(to, subject, templatePath, templateData);
          console.log(`Email sent to user ${user.id} for event: ${event.id}`);
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

module.exports = startEventReminderJob;
