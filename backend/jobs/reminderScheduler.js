    const cron = require('node-cron');
    const { sendDailyReminders } = require('../utils/reminders');

    // This function sets up and starts the scheduled job
    const initScheduledJobs = () => {
        const scheduledJob = cron.schedule('0 9 * * *', () => {
            console.log('---------------------');
            console.log('Running scheduled reminder task...');
            sendDailyReminders();
            console.log('---------------------');
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata" // Important: Set your timezone
        });

        scheduledJob.start();
        console.log('Reminder job has been scheduled to run every 5 seconds.');
    };

    module.exports = { initScheduledJobs };