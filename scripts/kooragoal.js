const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
    console.log("Fetching koora-goal.online...");
    const res = await fetch('https://www.koora-goal.online/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const matches = [];
    $('.AY_Match').each((i, el) => {
        const team1 = $(el).find('.TM1 .TM_Name').text().trim();
        const team2 = $(el).find('.TM2 .TM_Name').text().trim();
        const time = $(el).find('.MT_Time').text().trim();
        const statusText = $(el).find('.MT_Stat').text().trim();
        const status = statusText.includes('جارية') ? 'live' : 'upcoming';
        
        const logo1 = $(el).find('.TM1 img').attr('data-src') || $(el).find('.TM1 img').attr('src');
        const logo2 = $(el).find('.TM2 img').attr('data-src') || $(el).find('.TM2 img').attr('src');
        
        const link = $(el).find('a').last().attr('href');
        const infoItems = $(el).find('.MT_Info li span').map((i, span) => $(span).text().trim()).get();
        const channel = infoItems[0] || '';
        const league = infoItems[2] || '';
        
        matches.push({
            id: i + 1,
            team1,
            team2,
            logo1,
            logo2,
            time,
            status,
            statusText,
            channel,
            league,
            url: link
        });
    });
    
    console.log(`Found ${matches.length} matches. Extracting streams...`);
    
    for (let m of matches) {
        if (!m.url || m.url === '/') {
            m.embedUrl = '';
            continue;
        }
        try {
            const pageRes = await fetch(m.url);
            const pageHtml = await pageRes.text();
            const page$ = cheerio.load(pageHtml);
            const iframe = page$('iframe').first().attr('src');
            m.embedUrl = iframe || '';
            console.log(`Extracted stream for ${m.team1} vs ${m.team2}: ${m.embedUrl}`);
        } catch(e) {
            console.error(`Failed to fetch stream for ${m.url}`);
            m.embedUrl = '';
        }
    }
    
    const output = {
        lastUpdated: new Date().toISOString(),
        source: "https://www.koora-goal.online/",
        total: matches.length,
        matches: matches
    };
    
    fs.writeFileSync('./streams.json', JSON.stringify(output, null, 2));
    console.log("Successfully saved streams to streams.json!");
}

scrape().catch(console.error);
