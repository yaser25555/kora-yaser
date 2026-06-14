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

  // Filter only World Cup matches that are live or upcoming
  const activeMatches = matches.filter(m => m.league.includes('كأس العالم') && m.status !== 'finished');

  // Extract embed URLs for active matches
  console.log('جلب روابط المشغل المباشر...');
  for (const m of activeMatches) {
    try {
      const html = await fetch(m.url);
      const $page = cheerio.load(html);
      let iframeSrc = $page('iframe').first().attr('src') || '';
      // Fallback: construct from channel name
      if (!iframeSrc && m.channel) {
        const ch = m.channel.toLowerCase();
        const num = ch.match(/max\s*(\d+)/i);
        if (num) iframeSrc = 'https://tops.poiy.online/albaplayer/max' + num[1] + '/';
      }
      m.embedUrl = iframeSrc;
      if (iframeSrc) {
        try {
          const embedHtml = await fetch(iframeSrc);
          const m3u8Match = embedHtml.match(/['"]?([^'"]+\.m3u8)['"]?/i);
          if (m3u8Match) m.m3u8 = m3u8Match[1];
        } catch (e) { /* ignore */ }
      }
    } catch (e) {
      m.embedUrl = '';
      console.log('  ⚠️ فشل جلب المشغل لـ ' + m.team1 + ' vs ' + m.team2);
    }
  }

  const output = {
    lastUpdated: new Date().toISOString(),
    source: SOURCE_URL,
    total: activeMatches.length,
    matches: activeMatches
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  console.log('✓ تم حفظ ' + activeMatches.length + ' مباراة من كأس العالم في streams.json');
}

scrape().catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
