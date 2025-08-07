const express = require('express');
const app = express();
require('dotenv').config();
const ScrapeInternshalaWithPuppeteer = require('./scrapper')
const connectDB = require('./DB/db')
const userDetail = require('./routes/user.routes')
const cors = require('cors')
const cronjob = require('./crons/cronjob')
const cron = require('node-cron');



app.use(cors({
    origin: "http://localhost:5173"
}));

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());


const sendEmailsToUsers = async () => {
    try {
        console.log('📧 Starting email sending process...');

        const User = require('./models/subscriber');
        const Job = require('./models/job');

        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const timestamp = now.toISOString();

        console.log(`Current time: ${currentTime} (${timestamp})`);

        const allUsers = await User.find();
        console.log(`👥 Found ${allUsers.length} total users in database`);

        if (allUsers.length === 0) {
            console.log('No users found in database!');
            return { success: false, message: 'No users in database' };
        }


        console.log('All users in database:');
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. Email: "${user.email}" (${typeof user.email}) | Time: "${user.time}" (${typeof user.time})`);
        });


        const scheduledUsers = await User.find({ time: currentTime });
        console.log(`Found ${scheduledUsers.length} users scheduled for ${currentTime}`);


        if (scheduledUsers.length > 0) {
            console.log('📅 Scheduled users:');
            scheduledUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. Email: "${user.email}" | Time: "${user.time}"`);
            });
        }


        const usersToEmail = scheduledUsers.length > 0 ? scheduledUsers : [allUsers[0]];

        if (!usersToEmail[0]) {
            console.log('No valid users to email');
            return { success: false, message: 'No valid users found' };
        }

        console.log(`Will email ${usersToEmail.length} users:`);
        usersToEmail.forEach((user, index) => {
            console.log(`   ${index + 1}. "${user.email}" at ${user.time}`);
        });

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const todaysJobs = await Job.find({
            scrapedAt: { $gte: oneDayAgo }
        }).limit(20);

        console.log(`Found ${todaysJobs.length} jobs from today`);

        if (todaysJobs.length === 0) {
            console.log('No jobs found for today, using recent jobs...');
            const recentJobs = await Job.find().sort({ scrapedAt: -1 }).limit(5);
            if (recentJobs.length === 0) {
                console.log('No jobs available in database');
                const dummyJobs = [
                    {
                        title: "MERN Stack Developer",
                        company: "Tech Corp",
                        location: "Remote",
                        stipend: "₹25,000/month",
                        link: "https://example.com/job1"
                    }
                ];
                todaysJobs.push(...dummyJobs);
                console.log('🧪 Using dummy jobs for testing');
            } else {
                todaysJobs.push(...recentJobs);
            }
        }

        console.log('🤖 Processing jobs with Gemini AI...');
        const { processJobsWithGemini } = require('./api/gemini');
        const processedContent = await processJobsWithGemini(todaysJobs);
        console.log(`📝 Gemini response length: ${processedContent.length} characters`);

        const sendEmailWithPDF = require('./mailSender/nodeMailer');
        let successCount = 0;

        for (const user of usersToEmail) {
            try {
                console.log(`Attempting to send email to: "${user.email}" (type: ${typeof user.email})`);

                if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') {
                    console.log(`Invalid email for user: ${JSON.stringify(user)}`);
                    continue;
                }

                await sendEmailWithPDF(user.email.trim(), processedContent);
                successCount++;
                console.log(`Email sent successfully to ${user.email}`);

            } catch (error) {
                console.error(`Failed to send email to ${user.email}:`, error.message);
            }
        }

        console.log(`Email sending completed: ${successCount}/${usersToEmail.length} successful`);
        return {
            success: true,
            sent: successCount,
            total: usersToEmail.length,
            currentTime: currentTime
        };

    } catch (error) {
        console.error('Error in sendEmailsToUsers:', error);
        throw error;
    }
};

app.get('/', (req, res) => {
    res.send("HELLO WORLD");
})

app.post('/test-email', async (req, res) => {
    try {
        console.log('Manual email test initiated...');
        const result = await sendEmailsToUsers();
        res.json({
            success: true,
            message: 'Test emails sent successfully to scheduled users',
            result: result
        });
    } catch (error) {
        console.error('Test email failed:', error);
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
    console.log('Running scheduled scraping job...');
    try {
        const jobs = await ScrapeInternshalaWithPuppeteer();
        console.log(`Scraping completed. Found ${jobs.length} jobs`);
    } catch (error) {
        console.error('Scraping job failed:', error);
    }
});

app.get('/debug/time', (req, res) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const hour = now.getHours();
    const minute = now.getMinutes();

    res.json({
        success: true,
        debug: {
            fullDate: now.toISOString(),
            currentTime: currentTime,
            hour: hour,
            minute: minute,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: now.getTime()
        }
    });
});

app.post('/test/gemini', async (req, res) => {
    try {
        const { processJobsWithGemini } = require('./api/gemini');

        const testJobs = [
            {
                title: "MERN Stack Developer",
                company: "Tech Corp", 
                location: "Remote",
                stipend: "₹25,000/month",
                link: "https://example.com/job1"
            },
            {
                title: "React Developer Internship",
                company: "StartupXYZ",
                location: "Bangalore", 
                stipend: "₹15,000/month",
                link: "https://example.com/job2"
            }
        ];

        console.log('Testing Gemini with sample jobs...');
        const result = await processJobsWithGemini(testJobs);

        res.json({
            success: true,
            geminiOutput: result,
            testJobsCount: testJobs.length
        });

    } catch (error) {
        console.error('Gemini test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.get('/jobs', async (req, res) => {
    console.log("Jobs Searching")
    try {
        const jobs = await ScrapeInternshalaWithPuppeteer();
        res.json({
            success: true,
            jobs: jobs,
            count: jobs.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
})

app.get('/debug/users', async (req, res) => {
    try {
        const User = require('./models/subscriber');
        const users = await User.find();

        console.log('All users in database:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: "${user.email}" | Time: "${user.time}" | Type: ${typeof user.email}`);
        });

        res.json({
            success: true,
            userCount: users.length,
            users: users.map(user => ({
                email: user.email,
                time: user.time,
                emailType: typeof user.email,
                timeType: typeof user.time,
                emailLength: user.email ? user.email.length : 0
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/debug/send-test-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email in request body: {"email": "test@example.com"}'
            });
        }

        console.log(`🧪 Testing email send to: "${email}"`);

        const testContent = `Your Daily MERN Stack Job Alert\n\nFound 2 exciting opportunities for you today!\n\n1. MERN Stack Developer\nCompany: Tech Corp\nLocation: Remote\nCompensation: ₹25,000/month\nApply: https://example.com/job1\n\n2. React Developer Internship\nCompany: StartupXYZ\nLocation: Bangalore\nCompensation: ₹15,000/month\nApply: https://example.com/job2\n\nBest of luck with your applications!\n\nThis report was generated automatically by InboxHire.`;

        const sendEmailWithPDF = require('./mailSender/nodeMailer');
        await sendEmailWithPDF(email, testContent);

        res.json({
            success: true,
            message: `Test email sent successfully to ${email}`
        });

    } catch (error) {
        console.error('Direct email test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.post('/debug/add-test-user', async (req, res) => {
    try {
        const User = require('./models/subscriber');

        const now = new Date();
        now.setMinutes(now.getMinutes() + 2);
        const testTime = now.toTimeString().slice(0, 5);

        const testUser = new User({
            email: 'test@example.com', // Change this to your real email
            time: testTime,
            createdAt: new Date()
        });

        await testUser.save();

        res.json({
            success: true,
            message: 'Test user created successfully',
            user: {
                email: testUser.email,
                time: testUser.time,
                scheduledFor: `${testTime} (in 2 minutes)`
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.use('/user', userDetail);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})