    const cron = require('node-cron');
    const { sendDailyReminders } = require('../utils/reminders');

    const initScheduledJobs = () => {

        const scheduledJob = cron.schedule('* *9 * * *', () => {
            console.log('---------------------');
            console.log('Running scheduled reminder task...');
            sendDailyReminders();
            console.log('---------------------');
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        scheduledJob.start();
        console.log('Reminder job has been scheduled to run every 5 seconds.');
    };

    module.exports = { initScheduledJobs };
