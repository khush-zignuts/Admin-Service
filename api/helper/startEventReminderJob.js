const cron = require('node-cron');
const moment = require('moment-timezone');
const { Op, Sequelize } = require('sequelize');
const { Event } = require('../models/index'); 
const { sendEmail } = require('../helper/sendEmail'); 

const startEventReminderJob = () => {
    cron.schedule('* * * * *', async () => {
        try {
          const now = moment(); // current time
          const twentyFourHoursLater = now.clone().add(24, 'hours');
      
          // Format to match your DB (ISO or with timezone)
          const startCheckTime = twentyFourHoursLater.format('YYYY-MM-DD HH:mm:ss');
      
          // Fetch events happening exactly 24 hours from now
          const events = await Event.findAll({
            where: {
              date: {
                [Op.eq]: twentyFourHoursLater.format('YYYY-MM-DD') // Adjust based on your DB query
              },
              start_time: {
                [Op.eq]: twentyFourHoursLater.format('HH:mm:ss')
              }
            }
          });
      
          for (const event of events) {
            await sendEmail(event); // Call your function
            console.log(`Email sent for event: ${event.id}`);
          }
      
        } catch (error) {
          console.error('Cron Job Error:', error);
        }
      });
};

module.exports = startEventReminderJob;
