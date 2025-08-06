🎯 InboxHire
Automated AI-Powered Internship Aggregator with Email Delivery
InboxHire is a smart job-scraping and delivery system that automatically collects internship listings from job portals, summarizes them using AI, formats the results into a clean PDF, and emails them to subscribed users every few hours. It’s designed for students and early professionals who want curated opportunities delivered straight to their inbox—without the noise.

📌 Features
🔍 Real-Time Internship Scraping
Collects fresh internship listings from Internshala using Puppeteer.

🤖 AI-Powered Summarization
Uses Gemini API to distill job descriptions into digestible summaries, highlighting the key info.

📄 Clean PDF Output
Automatically generates a structured and visually clean PDF containing job data.

📧 Automated Email Delivery
Sends the PDF to user inboxes on a schedule using Nodemailer.

⏰ Background Scheduler
Uses cron jobs to trigger scraping and emailing every 6 hours.

🚀 Tech Stack
Backend: Node.js, Express
Scraping: Puppeteer
AI Integration: Gemini API
PDF Generation: pdfkit
Emailing: Nodemailer
Database: MongoDB
Scheduler: node-cron

🛠️ Setup

Clone the repository
git clone https://github.com/yourusername/inboxhire.git
cd inboxhire
Install dependencies
npm install
Create a .env file with the following environment variables:
PORT=5000
MONGO_URI=your_mongo_connection_string
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
Start the server
node index.js

📬 What Users Receive
A clean, concise PDF with:
Internship Title
Company Name
Direct Application Link
AI-Generated Summary

🔐 Privacy and Security
Environment variables handle sensitive data
User emails are securely stored
No spam or data misuse—ever

📈 Roadmap
Web dashboard with login/authentication
More job platforms (LinkedIn, Naukri, etc.)
User-specific filters and notification preferences
Analytics for opens, clicks, and applications

🧑‍💻 Author
S. Aariyan
Computer Science Engineer & MERN Stack Developer
aariyansunu28@gmail.com

