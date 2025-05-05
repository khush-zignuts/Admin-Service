const cron = require("node-cron");
const moment = require("moment-timezone");
const sequelize = require("../../../config/db");
const sendEmail = require("../Mail/sendEmail");
const { QueryTypes } = require("sequelize");

const startEventReminderJob = () => {
  cron.schedule("* * * * * *", async () => {
    console.log("startEventReminderJob running every second");
    try {
      const nowIST = moment().tz("Asia/Kolkata");
      console.log(
        "Current IST DateTime:",
        nowIST.format("YYYY-MM-DD, HH:mm:ss")
      );

      // Add 24 hours
      const after24HoursIST = nowIST.clone().add(24, "hours");

      // Extract date and time separately
      const formatted = after24HoursIST.format("YYYY-MM-DD, HH:mm:ss");
      console.log("IST DateTime after 24 hours:", formatted);

      // Extract date and time components
      const extractedDate = after24HoursIST.format("YYYY-MM-DD");
      const extractedTime = after24HoursIST.format("HH:mm:ss");

      const istMoment = moment.tz(
        extractedDate + " 00:00:00",
        "YYYY-MM-DD HH:mm:ss",
        "Asia/Kolkata"
      );

      const istDate = istMoment.format("YYYY-MM-DD HH:mm:ss");
      const istMilliseconds = istMoment.valueOf();

      const eventQuery = `
        SELECT id, title, date, start_time, organizer_id, location
        FROM event
        WHERE date = :istMilliseconds
        AND start_time = :extractedTime;
      `;
      const events = await sequelize.query(eventQuery, {
        replacements: { istMilliseconds, extractedTime },
        type: QueryTypes.SELECT,
      });

      for (const event of events) {
        const bookingQuery = `
          SELECT b.user_id AS "userId", b.organizer_id, u.name AS "userName", u.email AS "userEmail", o.name AS "organizerName"
          FROM booking b
          JOIN "user" u ON u.id = b.user_id
          JOIN organizer o ON o.id = b.organizer_id
          WHERE b.event_id = :eventId AND b.status = 'booked';
        `;
        const bookings = await sequelize.query(bookingQuery, {
          replacements: { eventId: event.id },
          type: QueryTypes.SELECT,
        });

        for (const booking of bookings) {
          const to = booking.userEmail;
          const subject = `Reminder: Your event "${event.title}" is starting soon`;
          const templatePath =
            "../../assets/templates/event-reminder-email.hbs";
          const templateData = {
            eventTitle: event.title,
            eventDate: extractedDate,
            eventStartTime: event.start_time,
            eventVenue: event.location,
            organizerName: booking.organizerName,
            userName: booking.userName,
          };

          await sendEmail(to, subject, templatePath, templateData);
          console.log(
            `Email sent to user ${booking.userName} for event: ${event.id}`
          );
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
      throw error;
    }
  });
};
module.exports = startEventReminderJob;
