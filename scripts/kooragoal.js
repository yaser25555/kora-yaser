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
        const link = $(el).find('a').last().attr('href');
        
        matches.push({ team1, team2, url: link });
    });
    
    console.log(`Found ${matches.length} matches. Extracting streams...`);
    
    for (let m of matches) {
        if (!m.url || m.url === '/') {
            m.embedUrl2 = '';
            continue;
        }
        try {
            const pageRes = await fetch(m.url);
            const pageHtml = await pageRes.text();
            const page$ = cheerio.load(pageHtml);
            const iframe = page$('iframe').first().attr('src');
            m.embedUrl2 = iframe || '';
            console.log(`Extracted kooragoal stream for ${m.team1} vs ${m.team2}: ${m.embedUrl2}`);
        } catch(e) {
            m.embedUrl2 = '';
        }
    }
    
    // Merge with existing streams.json
    try {
        const existingData = JSON.parse(fs.readFileSync('./streams.json', 'utf8'));
        let updatedCount = 0;
        
        for (let existing of existingData.matches) {
            // Find a match by team name similarity
            const kgMatch = matches.find(m => 
                (m.team1.includes(existing.team1) || existing.team1.includes(m.team1)) &&
                (m.team2.includes(existing.team2) || existing.team2.includes(m.team2))
            );
            
            if (kgMatch && kgMatch.embedUrl2) {
                existing.embedUrl2 = kgMatch.embedUrl2;
                updatedCount++;
            }
        }
        
        fs.writeFileSync('./streams.json', JSON.stringify(existingData, null, 2));
        console.log(`Successfully merged ${updatedCount} backup streams into streams.json!`);
    } catch(err) {
        console.error("Could not merge with streams.json:", err.message);
    }
}

scrape().catch(console.error);
