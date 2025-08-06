const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processJobsWithGemini(jobs) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const jobsText = jobs.map((job, index) => 
            `${index + 1}. ${job.title} at ${job.company || 'Company Not Listed'}
            Location: ${job.location || 'Not specified'}
            Stipend: ${job.stipend || 'Not mentioned'}
            Link: ${job.link}`
        ).join('\n\n');
        
        const prompt = `
        You are a career advisor. Format these MERN stack job opportunities in a professional, engaging way:

        ${jobsText}

        Please provide:
        1. A brief introduction about today's opportunities
        2. For each job, explain what the role might involve based on the title
        3. Highlight why each opportunity could be valuable for a MERN developer
        4. Keep descriptions concise but informative
        5. Use professional yet friendly tone
        6. Add encouraging closing remarks

        Format it as a clean, readable report that would look good in a PDF.
        `;
        
        console.log('🤖 Calling Gemini API...');
        const result = await model.generateContent(prompt);
        const response = result.response.text().trim();
        
        console.log('Gemini processing completed');
        return response;
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        return formatJobsFallback(jobs);
    }
}


function formatJobsFallback(jobs) {
    console.log('Using fallback formatting...');
    
    let content = `Your Daily MERN Stack Job Alert\n\n`;
    content += `Found ${jobs.length} exciting opportunities for you today!\n\n`;
    
    jobs.forEach((job, index) => {
        content += `${index + 1}. ${job.title}\n`;
        content += `Company: ${job.company || 'Not specified'}\n`;
        content += `Location: ${job.location || 'Remote/Not specified'}\n`;
        content += `Compensation: ${job.stipend || 'Competitive'}\n`;
        content += `Apply: ${job.link}\n\n`;
    });
    
    content += `Best of luck with your applications! \n\n`;
    content += `This report was generated automatically by JobSync.`;
    
    return content;
}

module.exports = { processJobsWithGemini };
