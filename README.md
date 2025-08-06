🎯 JobPulse
Automated AI-Powered Job Aggregator with Email Delivery
JobPulse is an intelligent job scheduling system that automatically scrapes internship listings, uses AI to refine and summarize them, converts the data into a clean PDF format, and delivers it via email to subscribed users—every few hours.

📌 Features
🔍 Real-time Job Scraping
Scrapes job listings from Internshala using Puppeteer.
🤖 AI-Based Job Summarization
Uses Gemini API to summarize and highlight job details intelligently.
📄 PDF Generation
Creates a structured and branded PDF document for easy viewing.
📧 Automated Email Delivery
Sends the curated jobs list directly to users' inboxes.
⏰ Scheduled Cron Jobs
Automatically fetches and updates listings every 6 hours.
🚀 Tech Stack
Backend: Node.js, Express.js
Web Scraping: Puppeteer
AI Integration: Gemini API
Email Service: Nodemailer
PDF Generation: pdfkit
Database: MongoDB
Scheduler: node-cron


🛠️ Setup Instructions

# Clone the repository
git clone https://github.com/yourusername/jobpulse.git
cd jobpulse

# Install dependencies
npm install

# Create a .env file and add:
# PORT=5000
# MONGO_URI=your_mongo_connection_string
# GEMINI_API_KEY=your_gemini_api_key
# EMAIL_USER=your_email
# EMAIL_PASS=your_email_password

# Run the server
node index.js



📂 Project Structure
.
├── DB/
│   └── db.js
├── crons/
│   └── cronjob.js
├── routes/
│   └── user.routes.js
├── scrapper.js
├── utils/
│   ├── generatePdf.js
│   └── sendEmail.js
├── index.js
├── .env
└── package.json


📬 Output Example
Each user receives a PDF with:
Job Title
Company Name
Direct Application Link
Summary (AI-generated)
🔒 Security & Privacy
API keys and credentials are managed via .env
Emails are sent only to subscribed users
No data is stored unnecessarily
📈 Future Improvements
Dashboard for tracking applied jobs
User authentication and preferences
Support for more job portals (LinkedIn, Indeed)
🧑‍💻 Author
S.Aariyan
Computer Science Engineer & MERN Developer
📧 [aariyansunu28@gmail.com]
