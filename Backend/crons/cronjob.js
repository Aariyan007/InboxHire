const cron = require('node-cron');
const sendEmailsToUsers = require('../mailSender/sendMail');


cron.schedule('0 * * * *', async () => {
    const hour = new Date().getHours();
    console.log(`Checking for scheduled emails at ${hour}:00`);
    await sendEmailsToUsers();
});


cron.schedule('0 9 * * *', async () => {
    console.log(' Running 9 AM job batch');
    await sendEmailsToUsers();
});

cron.schedule('0 21 * * *', async () => {
    console.log('Running 9 PM job batch');
    await sendEmailsToUsers();
});

console.log('Cron jobs scheduled successfully!');
