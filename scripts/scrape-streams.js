const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SOURCE_URL = 'https://www.livehd7sport.com/';
const OUTPUT = path.join(__dirname, '..', 'streams.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      res.setEncoding('utf8');
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

  // Extract embed URLs for active matches (up to 3 sources)
  console.log('جلب روابط المشغل المباشر...');
  for (const m of activeMatches) {
    try {
      const html = await fetch(m.url);
      const $page = cheerio.load(html);

      // Collect all unique iframe sources from the match page
      const iframeSources = [];
      $page('iframe').each((j, iframe) => {
        const src = $page(iframe).attr('src');
        if (src && src.trim() && !iframeSources.includes(src.trim())) {
          iframeSources.push(src.trim());
        }
      });

      // Function to extract real sources from albaplayer page
      async function extractAlbaSources(pageUrl) {
        const result = { m3u8s: [], iframes: [] };
        if (!pageUrl) return result;

        // Fetch the albaplayer page (serv=1 / default)
        function extractFromHtml(html) {
          // Clappr player: source:"URL"
          const clappr = html.match(/source\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
          if (clappr && !result.m3u8s.includes(clappr[1])) result.m3u8s.push(clappr[1]);

          // AlbaPlayerControl('base64','hls') — decode base64
          const b64Re = /AlbaPlayerControl\s*\(\s*['"]([A-Za-z0-9+/=]+)['"]/g;
          let bm;
          while ((bm = b64Re.exec(html)) !== null) {
            try {
              const dec = Buffer.from(bm[1], 'base64').toString();
              if (dec.includes('.m3u8') && !result.m3u8s.includes(dec)) result.m3u8s.push(dec);
            } catch(e) {}
          }

          // Bitmovin: source = {'hls':'URL'}
          const bit = html.match(/['"]hls['"]\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i);
          if (bit && !result.m3u8s.includes(bit[1])) result.m3u8s.push(bit[1]);

          // iframes
          const $s = cheerio.load(html);
          $s('iframe').each((j, ifr) => {
            const src = $s(ifr).attr('src');
            if (src && src.trim() && !result.iframes.includes(src.trim())) result.iframes.push(src.trim());
          });
        }

        try {
          const mainHtml = await fetch(pageUrl);
          extractFromHtml(mainHtml);

          // Parse server menu for additional servers
          const $m = cheerio.load(mainHtml);
          const serverUrls = [];
          $m('.aplr-menu a').each((j, a) => {
            const href = $m(a).attr('href');
            if (href && !serverUrls.includes(href)) serverUrls.push(href);
          });

          // Fetch up to 5 other servers for more sources
          for (const sUrl of serverUrls) {
            if (result.m3u8s.length + result.iframes.length >= 6) break;
            if (sUrl.includes('serv=1')) continue;

            try {
              const sHtml = await fetch(sUrl);
              extractFromHtml(sHtml);
            } catch(e) { /* skip failed server */ }
          }
        } catch(e) { /* page not albaplayer, keep original sources */ }

        return result;
      }

      // Get primary embed URL from match page
      const primaryUrl = iframeSources[0] || '';

      // Fallback: construct albaplayer URL from channel name
      let channelUrl = '';
      if (!primaryUrl && m.channel) {
        const numMatch = m.channel.toLowerCase().match(/max\s*(\d+)/i);
        if (numMatch) {
          channelUrl = 'https://tops.poiy.online/albaplayer/max' + numMatch[1] + '/';
        }
      }

      // Extract real sources from albaplayer page
      const albaSources = await extractAlbaSources(primaryUrl || channelUrl);

      // Combine all unique sources: m3u8 first (preferred), then iframes
      const allRealSources = [...albaSources.m3u8s, ...albaSources.iframes, ...iframeSources];
      const uniqueSources = [...new Set(allRealSources)];

      // Assign sources 1, 2, 3 and m3u8
      m.embedUrl = uniqueSources[0] || primaryUrl || '';
      if (uniqueSources[1]) m.embedUrl2 = uniqueSources[1];
      if (uniqueSources[2]) m.embedUrl3 = uniqueSources[2];
      if (uniqueSources[3]) m.embedUrl4 = uniqueSources[3];
      if (uniqueSources[4]) m.embedUrl5 = uniqueSources[4];
      m.m3u8 = albaSources.m3u8s[0] || '';
      m.m3u82 = albaSources.m3u8s[1] || '';
      m.m3u83 = albaSources.m3u8s[2] || '';

      console.log(`  ✓ ${m.team1} vs ${m.team2}: ${m.embedUrl2 ? '3 مصادر' : m.embedUrl ? 'مصدر واحد' : 'بدون مصدر'}`);
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
