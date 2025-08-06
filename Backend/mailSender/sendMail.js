const User = require('../models/subscriber');
const Job = require('../models/job');
const { processJobsWithGemini } = require('../api/gemini');
const sendEmailWithPDF = require('./nodeMailer');

const sendEmailsToUsers = async () => {
    try {
        console.log('🚀 Starting email sending process...');
        

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const todaysJobs = await Job.find({
            scrapedAt: { $gte: oneDayAgo }
        }).limit(20); 
        
        console.log(`📊 Found ${todaysJobs.length} jobs from today`);
        
        if (todaysJobs.length === 0) {
            console.log('No jobs found for today, using recent jobs...');

            const recentJobs = await Job.find().sort({ scrapedAt: -1 }).limit(10);
            if (recentJobs.length === 0) {
                console.log('No jobs available in database');
                return { success: false, message: 'No jobs available' };
            }
            todaysJobs.push(...recentJobs);
        }
        

        console.log('🤖 Processing jobs with Gemini AI...');
        const processedContent = await processJobsWithGemini(todaysJobs);
        

        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); 
        

        const allUsers = await User.find();
        console.log(`📧 Found ${allUsers.length} total users in database`);
        

        const scheduledUsers = await User.find({ time: currentTime });
        console.log(`⏰ Found ${scheduledUsers.length} users scheduled for ${currentTime}`);
        

        const usersToEmail = scheduledUsers.length > 0 ? scheduledUsers : allUsers.slice(0, 1);
        console.log(`📬 Sending emails to ${usersToEmail.length} users`);
        

        let successCount = 0;
        for (const user of usersToEmail) {
            try {
                await sendEmailWithPDF(user.email, processedContent);
                successCount++;
                console.log(`Email sent to ${user.email}`);
            } catch (error) {
                console.error(`Failed to send email to ${user.email}:`, error.message);
            }
        }
        
        console.log(`Successfully sent ${successCount}/${usersToEmail.length} emails`);
        return { success: true, sent: successCount, total: usersToEmail.length };
        
    } catch (error) {
        console.error('Error in sendEmailsToUsers:', error);
        throw error;
    }
};

module.exports = sendEmailsToUsers;
