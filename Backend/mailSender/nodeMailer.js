const nodemailer = require('nodemailer');
const generatePDF = require('../pdf/pdfkit');
const path = require('path');
const fs = require('fs').promises;

const sendEmailWithPDF = async (toEmail, content) => {
  try {
    const timestamp = Date.now();
    const filePath = path.join(__dirname, `jobs-${timestamp}.pdf`);
    
    console.log(`Generating PDF for ${toEmail}...`);
    await generatePDF(content, filePath);
    
    console.log(`Sending email to ${toEmail}...`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
      }
    });
    

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: toEmail,
      subject: `🚀 Your MERN Stack Jobs for ${today}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your Daily Job Alert is Here! </h2>
          <p>Hi there!</p>
          <p>We've found some exciting MERN stack opportunities for you today. Check out the attached PDF for detailed information about each position.</p>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            💡 <strong>Tip:</strong> Apply early to increase your chances of getting noticed!
          </p>
          <p>Happy job hunting!</p>
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The JobSync Team
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `MERN-Jobs-${new Date().toISOString().split('T')[0]}.pdf`,
          path: filePath
        }
      ]
    };
    
    await transporter.sendMail(mailOptions);
    
    await fs.unlink(filePath);
    
    console.log(`Email sent successfully to ${toEmail}`);
    
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
    throw error;
  }
};

module.exports = sendEmailWithPDF;