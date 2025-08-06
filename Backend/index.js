const express = require('express');
const app = express();
require('dotenv').config();
const ScrapeInternshalaWithPuppeteer = require('./scrapper')
const connectDB = require('./DB/db')
const userDetail = require('./routes/user.routes')
const cors = require('cors')
const cronjob = require('./crons/cronjob')
const cron = require('node-cron');
const sendEmailsToUsers = require('./mailSender/sendMail')

app.use(cors())

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());



app.get('/',(req,res)=>{
    res.send("HELLO WORLD");
})

app.post('/test-email', async (req, res) => {
    try {
        console.log('🧪 Manual email test initiated...');
        await sendEmailsToUsers();
        res.json({ 
            success: true, 
            message: 'Test emails sent successfully to scheduled users' 
        });
    } catch (error) {
        console.error('❌ Test email failed:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send test emails',
            message: error.message 
        });
    }
});

app.get('/stats', async (req, res) => {
    try {
        const Job = require('./models/job');
        const User = require('./models/subscriber');
        
        const jobCount = await Job.countDocuments();
        const userCount = await User.countDocuments();
        const recentJobs = await Job.countDocuments({
            scrapedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        res.json({
            success: true,
            stats: {
                totalJobs: jobCount,
                totalUsers: userCount,
                jobsToday: recentJobs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

cron.schedule('0 */6 * * *', async () => {
    console.log('🕷️ Running scheduled scraping job...');
    try {
        const jobs = await ScrapeInternshalaWithPuppeteer();
        console.log(`✅ Scraping completed. Found ${jobs.length} jobs`);
    } catch (error) {
        console.error('❌ Scraping job failed:', error);
    }
});

app.get('/jobs',async(req,res)=>{
    console.log("Jobs Searching")
    const jobs = await ScrapeInternshalaWithPuppeteer();
    res.json(jobs);
})

app.use('/user',userDetail);


app.listen(PORT,()=>{
    console.log(`Running on ${PORT}`)
})
