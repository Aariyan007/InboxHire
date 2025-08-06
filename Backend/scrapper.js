const puppeteer = require('puppeteer');
const Job = require('./models/job');
// const ScrapeInternshalaWithPuppeteer = require('./scrapper');
const cron = require('node-cron');

async function ScrapeInternshalaWithPuppeteer() {
    let browser;
    console.log('Starting Puppeteer scraper...');
    
    try {
        console.log('📱 Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            timeout: 60000
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const url = 'https://internshala.com/internships/keywords-mern-stack/';
        console.log('🌐 Navigating to:', url);
        
        await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 60000 
        });
        
        console.log('Page loaded, waiting for content...');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            await page.waitForSelector('div[class*="internship"], .individual_internship, .job-tile', { 
                timeout: 10000,
                visible: true 
            });
            console.log(' Internship elements found');
        } catch (waitError) {
            console.log('Could not find specific internship elements, continuing anyway...');
        }
        
        const pageInfo = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                bodyLength: document.body.textContent.length,
                hasInternshipClass: document.querySelector('[class*="internship"]') ? true : false,
                allClasses: Array.from(document.querySelectorAll('*')).slice(0, 50).map(el => el.className).filter(c => c && c.includes('intern'))
            };
        });
        
        console.log('Page info:', pageInfo);
        
        console.log(' Looking for internship elements...');
        
        const jobs = await page.evaluate(() => {
            const internships = [];
            
            const selectors = [
                '.individual_internship',
                '.internship_meta', 
                '[class*="internship-meta"]',
                'div[class*="internship"]',
                '.job-tile',
                '.internship-tile',
                'div[data-internship-id]',
                '.search_results .individual_internship',
                '.container-fluid .row > div', 
                'div[class*="card"]' 
            ];
            
            console.log('Trying selectors...');
            
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                console.log(`Selector "${selector}": found ${elements.length} elements`);
                
                if (elements.length > 0) {
                    elements.forEach((el, index) => {
                        console.log(`Processing element ${index + 1}/${elements.length}`);
                        

                        const titleSelectors = [
                            '.profile .heading_4_5',
                            'h3',
                            'h4', 
                            'h2',
                            '.heading_4_5',
                            '[class*="heading"]',
                            '.profile h3',
                            '.profile h4',
                            '.job-title',
                            '.internship-title',
                            'a[class*="job_title"]',
                            '.job_title',
                            'div[class*="title"]'
                        ];
                        
                        let title = '';
                        let titleElement = null;
                        
                        for (const titleSel of titleSelectors) {
                            titleElement = el.querySelector(titleSel);
                            if (titleElement && titleElement.textContent.trim()) {
                                title = titleElement.textContent.trim();
                                console.log(`Found title with selector "${titleSel}": "${title}"`);
                                break;
                            }
                        }
                        

                        const linkSelectors = [
                            'a.view_detail_button',
                            'a[class*="view_detail"]', 
                            'a[href*="/internship/"]',
                            'a[href*="/internships/detail/"]',
                            'a.job_title',
                            'h3 a',
                            'h4 a',
                            'a'
                        ];
                        
                        let link = '';
                        let linkElement = null;
                        
                        for (const linkSel of linkSelectors) {
                            linkElement = el.querySelector(linkSel);
                            if (linkElement && (linkElement.href || linkElement.getAttribute('href'))) {
                                const href = linkElement.href || linkElement.getAttribute('href');

                                if (href.includes('/internship') || href.includes('/job')) {
                                    link = href;
                                    console.log(`Found link with selector "${linkSel}": "${link}"`);
                                    break;
                                }
                            }
                        }
                        

                        if (link && !link.startsWith('http')) {
                            link = `https://internshala.com${link}`;
                        }
                        

                        const company = el.querySelector('.company_name, [class*="company"], .employer_name')?.textContent?.trim() || '';
                        const location = el.querySelector('.location_name, [class*="location"], .job_location')?.textContent?.trim() || '';
                        const stipend = el.querySelector('.stipend, [class*="stipend"], .salary')?.textContent?.trim() || '';
                        
                        if (title && link) {
                            const jobData = { 
                                title, 
                                link, 
                                company,
                                location,
                                stipend,
                                selector 
                            };
                            
                            const keywords = [
                                'react', 'mern', 'node', 'express', 'mongodb', 
                                'javascript', 'js', 'frontend', 'backend', 
                                'fullstack', 'full-stack', 'web development',
                                'angular', 'vue', 'next', 'redux', 'typescript'
                            ];
                            const titleLower = title.toLowerCase();
                            const companyLower = company.toLowerCase();
                            
                            const hasKeyword = keywords.some(keyword => 
                                titleLower.includes(keyword) || companyLower.includes(keyword)
                            );
                            
                            if (hasKeyword) {
                                console.log(`Adding job: "${title}" (matched keywords)`);
                                internships.push(jobData);
                            } else {
                                console.log(`Skipping job: "${title}" (no matching keywords)`);

                                internships.push({...jobData, filtered: true});
                            }
                        } else {
                            console.log(`Missing data - Title: "${title}", Link: "${link}"`);
                        }
                    });
                    

                    if (internships.length > 0) {
                        console.log(`Found ${internships.length} jobs with selector: ${selector}`);
                        break;
                    }
                }
            }
            

            if (internships.length === 0) {
                console.log(' No internships found. Debug info:');
                console.log('Page title:', document.title);
                console.log('URL:', window.location.href);
                console.log('Body text preview:', document.body.textContent.substring(0, 500));
                

                const allDivs = document.querySelectorAll('div');
                console.log(`Total divs on page: ${allDivs.length}`);
                

                const errorSelectors = ['.error', '.login-required', '.no-results', '[class*="error"]', '.alert'];
                for (const errorSel of errorSelectors) {
                    const errorEl = document.querySelector(errorSel);
                    if (errorEl) {
                        console.log(`Found error element: ${errorSel} - ${errorEl.textContent.trim()}`);
                    }
                }


                if (document.title.toLowerCase().includes('blocked') || 
                    document.title.toLowerCase().includes('error') ||
                    document.body.textContent.includes('Access Denied')) {
                    console.log('Page might be blocked or showing an error');
                }
            }
            
            return internships;
        });
        
        console.log(`📊 Page evaluation completed. Found ${jobs.length} total jobs`);
        

        const validJobs = jobs.filter(job => !job.filtered);
        console.log(` Valid jobs after filtering: ${validJobs.length}`);
        
        if (validJobs.length === 0 && jobs.length > 0) {
            console.log(' No jobs matched keywords, but found jobs. Returning all for debugging:');
            jobs.forEach(job => console.log(`- ${job.title} at ${job.company}`));

            return jobs.map(job => ({
                title: job.title, 
                link: job.link, 
                company: job.company,
                location: job.location,
                stipend: job.stipend
            }));
        }
        
        // Save valid jobs to MongoDB
        if (validJobs.length > 0) {
            console.log(' Saving jobs to database...');
            let savedCount = 0;
            
            for (const job of validJobs) {
                try {
                    const result = await Job.updateOne(
                        { link: job.link },
                        { 
                            $setOnInsert: {
                                title: job.title,
                                link: job.link,
                                company: job.company,
                                location: job.location,
                                stipend: job.stipend,
                                source: 'internshala',
                                scrapedAt: new Date(),
                                keywords: ['mern', 'react']
                            }
                        },
                        { upsert: true }
                    );
                    
                    if (result.upsertedCount > 0) {
                        savedCount++;
                        console.log(`Saved new job: ${job.title}`);
                    } else {
                        console.log(`Job already exists: ${job.title}`);
                    }
                } catch (dbError) {
                    console.log('DB insert error for:', job.title, '- Error:', dbError.message);
                }
            }
            
            console.log(`Database operation completed. New jobs saved: ${savedCount}`);
        }
        
        return validJobs.map(job => ({
            title: job.title, 
            link: job.link,
            company: job.company,
            location: job.location,
            stipend: job.stipend
        }));
        
    } catch (error) {
        console.log("Error scraping with Puppeteer:", error.message);
        console.log("Full error:", error);
        return [];
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

module.exports = ScrapeInternshalaWithPuppeteer;