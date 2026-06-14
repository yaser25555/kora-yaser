const https = require('https');
const fs = require('fs');
const path = require('path');

const OPENFOOTBALL_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const ARABIC_NAMES_PATH = path.join(__dirname, '..', 'data', 'arabic-names.json');
const MATCHES_OUTPUT = path.join(__dirname, '..', 'matches.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'WorldCup-App/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function parseUtcOffset(timeStr) {
  const match = timeStr.match(/UTC([+-]\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function convertToAst(timeStr) {
  if (!timeStr) return { time: '--:--', label: '--' };
  const [timePart, offsetPart] = timeStr.split(' UTC');
  const [hours, minutes] = timePart.split(':').map(Number);
  const offset = offsetPart ? parseInt(offsetPart) : 0;
  const astOffset = 3;
  let astHours = hours - offset + astOffset;
  let astMinutes = minutes || 0;
  if (astHours >= 24) { astHours -= 24; }
  if (astHours < 0) { astHours += 24; }
  const h = astHours.toString().padStart(2, '0');
  const m = astMinutes.toString().padStart(2, '0');
  let label = '';
  if (astHours >= 0 && astHours < 5) label = 'فجرًا';
  else if (astHours >= 5 && astHours < 12) label = 'صباحًا';
  else if (astHours >= 12 && astHours < 13) label = 'ظهرًا';
  else if (astHours >= 13 && astHours < 17) label = 'بعد الظهر';
  else if (astHours >= 17 && astHours < 21) label = 'مساءً';
  else label = 'ليلاً';
  return { time: `${h}:${m}`, label };
}

function getStatus(match) {
  if (match.score && match.score.ft) return 'finished';
  const now = new Date();
  const matchDate = new Date(match.date + 'T' + match.time.split(' UTC')[0]);
  if (matchDate < now) return 'ongoing';
  return 'upcoming';
}

async function main() {
  console.log('Fetching openfootball data...');
  const data = await fetch(OPENFOOTBALL_URL);
  const arabicNames = JSON.parse(fs.readFileSync(ARABIC_NAMES_PATH, 'utf8'));
  const { teams, stadiums, groups } = arabicNames;

  const matches = data.matches
    .filter(m => m.team1 && m.team2 && !m.team1.startsWith('W') && !m.team1.startsWith('L'))
    .map((m, i) => {
      const ast = convertToAst(m.time);
      const status = getStatus(m);
      const score = m.score && m.score.ft ? m.score.ft : null;
      return {
        id: i + 1,
        date: m.date,
        timeAst: ast.time,
        timeLabel: ast.label,
        team1Ar: teams[m.team1] || m.team1,
        team2Ar: teams[m.team2] || m.team2,
        team1En: m.team1,
        team2En: m.team2,
        score1: score ? score[0] : null,
        score2: score ? score[1] : null,
        group: groups[m.group] || m.group?.replace('Group ', '') || '',
        stadium: stadiums[m.ground] || m.ground || '',
        status
      };
    });

  const output = {
    lastUpdated: new Date().toISOString(),
    total: matches.length,
    matches
  };

  fs.writeFileSync(MATCHES_OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Updated matches.json with ${matches.length} matches ✓`);
}

main().catch(console.error);
