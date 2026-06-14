const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SOURCE_URL = 'https://www.livehd7sport.com/';
const OUTPUT = path.join(__dirname, '..', 'streams.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrape() {
  console.log('جلب البيانات من livehd7sport.com...');
  const html = await fetch(SOURCE_URL);
  const $ = cheerio.load(html);

  const matches = [];

  $('.AY_Match').each((i, el) => {
    const cls = $(el).attr('class') || '';

    let status = 'upcoming';
    if (cls.includes('finished')) status = 'finished';
    else if (cls.includes('live')) status = 'live';
    else if (cls.includes('comming-soon')) status = 'coming';

    const team1 = $('.MT_Team.TM1 .TM_Name', el).text().trim();
    const team2 = $('.MT_Team.TM2 .TM_Name', el).text().trim();
    if (!team1 || !team2) return;

    const logo1 = $('.MT_Team.TM1 .TM_Logo img', el).attr('data-src') || '';
    const logo2 = $('.MT_Team.TM2 .TM_Logo img', el).attr('data-src') || '';
    const time = $('.MT_Time', el).text().trim();
    const goals = $('.RS-goals', el);
    const score1 = goals.length >= 1 ? goals.eq(0).text().trim() : null;
    const score2 = goals.length >= 2 ? goals.eq(1).text().trim() : null;
    const statusText = $('.MT_Stat', el).text().trim();

    const infoItems = [];
    $('.MT_Info ul li span', el).each((j, span) => {
      infoItems.push($(span).text().trim());
    });

    const streamLink = $('a[href]', el).attr('href') || '';

    matches.push({
      id: i + 1,
      team1,
      team2,
      logo1,
      logo2,
      time,
      score1: score1 || null,
      score2: score2 || null,
      status,
      statusText,
      channel: infoItems[0] || '',
      league: infoItems[2] || '',
      url: streamLink
    });
  });

  // Filter only World Cup matches
  const worldCupMatches = matches.filter(m => m.league.includes('كأس العالم'));

  const output = {
    lastUpdated: new Date().toISOString(),
    source: SOURCE_URL,
    total: worldCupMatches.length,
    matches: worldCupMatches
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  console.log('✓ تم حفظ ' + worldCupMatches.length + ' مباراة من كأس العالم في streams.json');
}

scrape().catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
