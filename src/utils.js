export const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
export const GROUP_NAMES = {
    'A':'المجموعة A','B':'المجموعة B','C':'المجموعة C','D':'المجموعة D',
    'E':'المجموعة E','F':'المجموعة F','G':'المجموعة G','H':'المجموعة H',
    'I':'المجموعة I','J':'المجموعة J','K':'المجموعة K','L':'المجموعة L'
};

export const TZ_LIST = [
    { label: '🇸🇦 الرياض (المملكة)', offset: 180, iana: 'Asia/Riyadh', city: 'Riyadh' },
    { label: '🇰🇼 الكويت',           offset: 180, iana: 'Asia/Kuwait', city: 'Kuwait' },
    { label: '🇶🇦 الدوحة (قطر)',     offset: 180, iana: 'Asia/Qatar', city: 'Doha' },
    { label: '🇮🇶 بغداد (العراق)',   offset: 180, iana: 'Asia/Baghdad', city: 'Baghdad' },
    { label: '🇦🇪 دبي (الإمارات)',   offset: 240, iana: 'Asia/Dubai', city: 'Dubai' },
    { label: '🇮🇷 طهران (إيران)',    offset: 210, iana: 'Asia/Tehran', city: 'Tehran' },
    { label: '🇪🇬 القاهرة (مصر)',    offset: 120, iana: 'Africa/Cairo', city: 'Cairo' },
    { label: '🇱🇧 بيروت (لبنان)',    offset: 120, iana: 'Asia/Beirut', city: 'Beirut' },
    { label: '🇯🇴 عمان (الأردن)',    offset: 120, iana: 'Asia/Amman', city: 'Amman' },
    { label: '🇸🇾 دمشق (سوريا)',     offset: 120, iana: 'Asia/Damascus', city: 'Damascus' },
    { label: '🇵🇸 القدس (فلسطين)',   offset: 120, iana: 'Asia/Hebron', city: 'Hebron' },
    { label: '🇹🇷 إسطنبول (تركيا)',  offset: 180, iana: 'Europe/Istanbul', city: 'Istanbul' },
    { label: '🇸🇩 الخرطوم (السودان)', offset: 120, iana: 'Africa/Khartoum', city: 'Khartoum' },
    { label: '🇾🇪 عدن (اليمن)',      offset: 180, iana: 'Asia/Aden', city: 'Aden' },
    { label: '🇲🇦 الدار البيضاء (المغرب)', offset: 60, iana: 'Africa/Casablanca', city: 'Casablanca' },
    { label: '🇩🇿 الجزائر',          offset: 60,  iana: 'Africa/Algiers', city: 'Algiers' },
    { label: '🇹🇳 تونس',             offset: 60,  iana: 'Africa/Tunis', city: 'Tunis' },
    { label: '🇬🇧 لندن (بريطانيا)',  offset: 60,  iana: 'Europe/London', city: 'London' },
    { label: '🇩🇪 برلين (ألمانيا)',  offset: 120, iana: 'Europe/Berlin', city: 'Berlin' },
    { label: '🇫🇷 باريس (فرنسا)',    offset: 120, iana: 'Europe/Paris', city: 'Paris' },
    { label: '🇮🇹 روما (إيطاليا)',   offset: 120, iana: 'Europe/Rome', city: 'Rome' },
    { label: '🇪🇸 مدريد (إسبانيا)',  offset: 120, iana: 'Europe/Madrid', city: 'Madrid' },
    { label: '🇺🇸 نيويورك',          offset: -240, iana: 'America/New_York', city: 'New York' },
    { label: '🇺🇸 واشنطن',           offset: -240, iana: 'America/New_York', city: 'Washington' },
    { label: '🇨🇦 تورونتو',          offset: -240, iana: 'America/Toronto', city: 'Toronto' },
    { label: '🇺🇸 شيكاغو',           offset: -300, iana: 'America/Chicago', city: 'Chicago' },
    { label: '🇺🇸 دنفر',             offset: -360, iana: 'America/Denver', city: 'Denver' },
    { label: '🇺🇸 لوس أنجلوس',       offset: -420, iana: 'America/Los_Angeles', city: 'Los Angeles' },
    { label: '🇧🇷 ساو باولو (البرازيل)', offset: -180, iana: 'America/Sao_Paulo', city: 'Sao Paulo' },
    { label: '🇦🇷 بوينس آيرس (الأرجنتين)', offset: -180, iana: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires' },
    { label: '🇦🇺 سيدني (أستراليا)', offset: 660, iana: 'Australia/Sydney', city: 'Sydney' },
    { label: '🇯🇵 طوكيو (اليابان)',  offset: 540, iana: 'Asia/Tokyo', city: 'Tokyo' },
    { label: '🇨🇳 بكين (الصين)',     offset: 480, iana: 'Asia/Shanghai', city: 'Shanghai' },
    { label: '🇮🇳 نيودلهي (الهند)',  offset: 330, iana: 'Asia/Kolkata', city: 'Kolkata' },
];

export const TEAM_NAMES = {
    'Saudi Arabia':'السعودية','Argentina':'الأرجنتين','Uruguay':'أوروغواي','Spain':'إسبانيا',
    'Cape Verde':'الرأس الأخضر','Portugal':'البرتغال','Mexico':'المكسيك','Italy':'إيطاليا',
    'Morocco':'المغرب','USA':'أمريكا','Japan':'اليابان','South Korea':'كوريا الجنوبية',
    'Brazil':'البرازيل','France':'فرنسا','Germany':'ألمانيا','England':'إنجلترا',
    'Netherlands':'هولندا','Belgium':'بلجيكا','Croatia':'كرواتيا','Denmark':'الدنمارك',
    'Switzerland':'سويسرا','Senegal':'السنغال','Cameroon':'الكاميرون','Nigeria':'نيجيريا',
    'Ghana':'غانا','Tunisia':'تونس','Algeria':'الجزائر','Egypt':'مصر',
    'Australia':'أستراليا','Iran':'إيران','Ecuador':'الإكوادور','Canada':'كندا',
    'Poland':'بولندا','Serbia':'صربيا','Colombia':'كولومبيا','New Zealand':'نيوزيلندا',
    'Iraq':'العراق','Paraguay':'باراغواي'
};
export const STADIUM_NAMES = {
    'King Fahd International Stadium':'استاد الملك فهد الدولي',
    'King Abdullah Sports City':'مدينة الملك عبدالله الرياضية',
    'Prince Faisal bin Fahd Stadium':'استاد الأمير فيصل بن فهد',
    'Al-Janoub Stadium':'استاد الجنوب','Al-Bayt Stadium':'استاد البييت',
    'Al-Thumama Stadium':'استاد الثمامة','Education City Stadium':'استاد المدينة التعليمية',
    'Khalifa International Stadium':'استاد خليفة الدولي',
    'Lusail Stadium':'استاد لوسيل','Ahmad bin Ali Stadium':'استاد أحمد بن علي',
    'Stadium 974':'استاد 974'
};

const TZ_KEY = 'kora_tz';
const FAV_KEY = 'kora_favs';
const NOTIFY_MIN_KEY = 'kora_notify_min';
const NOTIFIED_KEY = 'kora_notified';
const REPORTS_KEY = 'kora_src_reports';
const THEME_KEY = 'kora_theme';

export function getUserTz() {
    try { const s = localStorage.getItem(TZ_KEY); return s ? JSON.parse(s) : TZ_LIST[0]; }
    catch(e) { return TZ_LIST[0]; }
}
export function saveUserTz(tz) { localStorage.setItem(TZ_KEY, JSON.stringify(tz)); }
export function getTodayStr(tzIana) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzIana || getUserTz().iana,
        year: 'numeric', month: 'numeric', day: 'numeric'
    });
    const parts = formatter.formatToParts(now);
    const p = {};
    parts.forEach(part => { p[part.type] = part.value; });
    return p.year + '-' + String(p.month).padStart(2, '0') + '-' + String(p.day).padStart(2, '0');
}
export function astToUser(astTime, astDate, userOffset) {
    if (!astTime || !astDate) return { time: astTime || '--:--', label: '', date: astDate || '' };
    const diff = userOffset - 180;
    if (diff === 0) {
        const h = parseInt(astTime);
        const lbl = h >= 0 && h < 5 ? 'فجراً' : h < 12 ? 'صباحاً' : h < 13 ? 'ظهراً' : h < 17 ? 'بعد الظهر' : h < 21 ? 'مساءً' : 'ليلاً';
        return { time: astTime, label: lbl, date: astDate };
    }
    const [h, m] = astTime.split(':').map(Number);
    let newH = h + diff;
    let dayOff = 0;
    if (newH >= 24) { newH -= 24; dayOff = 1; }
    if (newH < 0) { newH += 24; dayOff = -1; }
    const lbl = newH >= 0 && newH < 5 ? 'فجراً' : newH < 12 ? 'صباحاً' : newH < 13 ? 'ظهراً' : newH < 17 ? 'بعد الظهر' : newH < 21 ? 'مساءً' : 'ليلاً';
    let newDate = astDate;
    if (dayOff !== 0) {
        const dp = astDate.split('-').map(Number);
        const d = new Date(Date.UTC(dp[0], dp[1] - 1, dp[2] + dayOff));
        newDate = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
    }
    return { time: String(newH).padStart(2, '0') + ':' + String(m).padStart(2, '0'), label: lbl, date: newDate };
}
export function dm(m) {
    if (!m._dm) {
        const tz = getUserTz();
        m._dm = astToUser(m.timeAst, m.dateAst || m.date, tz.offset);
        m._dm.id = m.id;
        m._dm.score1 = m.score1;
        m._dm.score2 = m.score2;
        m._dm.team1 = m.team1;
        m._dm.team2 = m.team2;
        m._dm.group = m.group;
        m._dm.stadium = m.stadium;
        m._dm.dateAst = m.dateAst;
        m._dm.timeAst = m.timeAst;
    }
    return m._dm;
}
export function clearDmCache() { allMatchesCache.forEach(m => delete m._dm); }
let allMatchesCache = [];
export function setAllMatches(m) { allMatchesCache = m; }
export function getAllMatches() { return allMatchesCache; }
export function to12h(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const ampm = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + ampm;
}
export function getStatus(score1, score2, date, timeAst, dateAst) {
    if (score1 !== null && score2 !== null) return 'finished';
    try {
        const dp = (dateAst || date || '').split('-').map(Number);
        const tp = (timeAst || '00:00').split(':').map(Number);
        const matchDate = new Date(Date.UTC(dp[0], dp[1]-1, dp[2], tp[0], tp[1]));
        const now = new Date();
        const diff = (now - matchDate) / 1000 / 60;
        if (diff >= 125) return 'finished';
        if (diff >= -10 && diff < 125) return 'ongoing';
    } catch(e) {}
    return 'upcoming';
}
export function isToday(m) {
    const d = dm(m);
    return d.date === getTodayStr();
}
export function todayMatches(matches) { return matches.filter(m => isToday(m)); }

export function countdownText(dateStr, timeAst) {
    try {
        const dp = (dateStr || '').split('-').map(Number);
        const tp = (timeAst || '00:00').split(':').map(Number);
        const matchDate = new Date(Date.UTC(dp[0], dp[1]-1, dp[2], tp[0], tp[1]));
        const now = new Date();
        const diff = (matchDate - now) / 1000 / 60;
        if (diff <= 0 || diff > 14400) return '';
        const h = Math.floor(diff / 60);
        const m = Math.floor(diff % 60);
        return h > 0 ? `بعد ${h} ساعة و ${m} دقيقة` : `بعد ${m} دقيقة`;
    } catch(e) { return ''; }
}

export function getGroupStandings(group) {
    const matches = allMatchesCache.filter(m => m.group === group && m.score1 !== null && m.score2 !== null);
    const teams = {};
    const add = (name, gf, ga) => {
        if (!teams[name]) teams[name] = { teamAr: TEAM_NAMES[name] || name, teamEn: name, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, pts:0 };
        const t = teams[name];
        t.played++; t.gf += gf; t.ga += ga;
        if (gf > ga) { t.won++; t.pts += 3; }
        else if (gf === ga) { t.drawn++; t.pts++; }
        else t.lost++;
    };
    matches.forEach(m => { add(m.team1, m.score1, m.score2); add(m.team2, m.score2, m.score1); });
    return Object.values(teams).map(t => ({ ...t, gd: t.gf - t.ga })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}
export function getFlag(team) {
    const map = {
        'Saudi Arabia':'🇸🇦','Argentina':'🇦🇷','Uruguay':'🇺🇾','Spain':'🇪🇸','Cape Verde':'🇨🇻',
        'Portugal':'🇵🇹','Mexico':'🇲🇽','Italy':'🇮🇹','Morocco':'🇲🇦','USA':'🇺🇸',
        'Japan':'🇯🇵','South Korea':'🇰🇷','Brazil':'🇧🇷','France':'🇫🇷','Germany':'🇩🇪',
        'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Netherlands':'🇳🇱','Belgium':'🇧🇪','Croatia':'🇭🇷','Denmark':'🇩🇰',
        'Switzerland':'🇨🇭','Senegal':'🇸🇳','Cameroon':'🇨🇲','Nigeria':'🇳🇬','Ghana':'🇬🇭',
        'Tunisia':'🇹🇳','Algeria':'🇩🇿','Egypt':'🇪🇬','Australia':'🇦🇺','Iran':'🇮🇷',
        'Ecuador':'🇪🇨','Canada':'🇨🇦','Poland':'🇵🇱','Serbia':'🇷🇸','Colombia':'🇨🇴',
        'New Zealand':'🇳🇿','Iraq':'🇮🇶','Paraguay':'🇵🇾'
    };
    return map[team] || '🏳️';
}
export function formatDate(dateStr) {
    if (!dateStr) return '';
    const months = ['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليو','أغشت','شتنبر','أكتوبر','نونبر','دجنبر'];
    const p = dateStr.split('-').map(Number);
    return p[2] + ' ' + months[p[1]-1];
}

export function parseOpenfootball(data) {
    if (!data) return [];
    // NEW flat format: { name: "...", matches: [...] }
    if (data.matches && Array.isArray(data.matches) && !data.rounds) {
        return data.matches.reduce((acc, m) => {
            const team1 = m.team1 || '';
            const team2 = m.team2 || '';
            if (!team1 || !team2 || isKnockoutSlot(team1) || isKnockoutSlot(team2)) return acc;
            const g = (m.group || '').match(/Group\s*([A-L])/i);
            const group = g ? g[1].toUpperCase() : '';
            const date = m.date || '';
            const time = m.time || '';
            const ast = astFromUtc(time, date);
            const s = m.score;
            const score1 = s && s.ft ? s.ft[0] : null;
            const score2 = s && s.ft ? s.ft[1] : null;
            acc.push({ id: acc.length + 1, team1, team2, group, stadium: (m.ground || m.venue || ''), date, time, timeAst: ast.time, dateAst: ast.date || date, score1, score2 });
            return acc;
        }, []);
    }
    // OLD format: { rounds: [{ name: "Group A", matches: [...] }] }
    if (data.rounds) {
        return data.rounds.reduce((acc, round) => {
            const g = round.name ? round.name.match(/Group\s*([A-L])/) : null;
            const group = g ? g[1] : 'G';
            (round.matches || []).forEach(m => {
                const team1 = m.team1 || (m.teams ? m.teams[0] : '');
                const team2 = m.team2 || (m.teams ? m.teams[1] : '');
                if (!team1 || !team2 || isKnockoutSlot(team1) || isKnockoutSlot(team2)) return;
                const date = m.date || '';
                const time = m.time || '';
                const ast = astFromUtc(time, date);
                acc.push({ id: acc.length + 1, team1, team2, group, stadium: (m.venue || m.stadium || ''), date, time, timeAst: ast.time, dateAst: ast.date || date, score1: m.score1, score2: m.score2 });
            });
            return acc;
        }, []);
    }
    return [];
}
export function isKnockoutSlot(name) {
    return name.startsWith('W') || name.startsWith('L') || /^\d/.test(name);
}
export function astFromUtc(timeStr, dateStr) {
    if (!timeStr) return { time: '', date: dateStr, label: '' };
    const tzMatch = timeStr.match(/UTC([+-]\d+)/);
    const tzOffset = tzMatch ? parseInt(tzMatch[1]) : 0;
    const cleanTime = timeStr.replace(/UTC[+-]\d+/g, '').trim();
    const [h, m] = cleanTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return { time: cleanTime, date: dateStr, label: '' };
    let astH = h + (3 - tzOffset);
    let dayOff = 0;
    if (astH >= 24) { astH -= 24; dayOff = 1; }
    if (astH < 0) { astH += 24; dayOff = -1; }
    let newDate = dateStr;
    if (dayOff !== 0 && dateStr) {
        const dp = dateStr.split('-').map(Number);
        const d = new Date(Date.UTC(dp[0], dp[1]-1, dp[2] + dayOff));
        newDate = d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0');
    }
    return { time: String(astH).padStart(2, '0') + ':' + String(m).padStart(2, '0'), date: newDate, label: '' };
}
export function getStatusText(status) {
    return { finished: 'انتهت', ongoing: '⚡مباشر', upcoming: 'قادمة' }[status] || status;
}

export function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch(e) { return []; }
}
export function saveFavorites(favs) { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); }
export function toggleFavorite(teamEn) {
    const favs = getFavorites();
    const idx = favs.indexOf(teamEn);
    if (idx >= 0) { favs.splice(idx, 1); saveFavorites(favs); return false; }
    else { favs.push(teamEn); saveFavorites(favs); return true; }
}
export function isFavorite(teamEn) { return getFavorites().includes(teamEn); }

export function getNotifyMin() {
    try { return parseInt(localStorage.getItem(NOTIFY_MIN_KEY)) || 30; } catch(e) { return 30; }
}
export function setNotifyMin(min) { localStorage.setItem(NOTIFY_MIN_KEY, min); }
export function getNotifiedIds() {
    try { return JSON.parse(localStorage.getItem(NOTIFIED_KEY)) || []; } catch(e) { return []; }
}
export function markNotified(id) {
    const ids = getNotifiedIds();
    if (!ids.includes(id)) { ids.push(id); localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids)); }
}
export function requestNotifyPerm() {
    if ('Notification' in window && Notification.permission === 'default') { Notification.requestPermission(); }
}

export function getSourceReports() {
    try { return JSON.parse(localStorage.getItem(REPORTS_KEY)) || {}; } catch(e) { return {}; }
}
export function reportSource(mi, sk) {
    const reports = getSourceReports();
    const key = mi + '-' + sk;
    reports[key] = (reports[key] || 0) + 1;
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    return reports[key];
}
export function getSourceReportCount(mi, sk) {
    return getSourceReports()[mi + '-' + sk] || 0;
}

export function renderStandingsHtml(standings) {
    if (!standings || standings.length === 0) return '';
    let html = `<div class="standings-wrap"><table class="standings-table"><thead><tr><th>#</th><th>المنتخب</th><th>لعب</th><th>فاز</th><th>ت</th><th>خسر</th><th>له</th><th>عليه</th><th>الفرق</th><th>النقاط</th></tr></thead><tbody>`;
    standings.forEach((t, i) => {
        const posClass = i === 0 ? 'pos-1' : i === 1 ? 'pos-2' : '';
        html += `<tr class="${posClass}"><td>${i+1}</td><td class="team-cell"><span class="flag">${getFlag(t.teamEn)}</span> ${t.teamAr}</td><td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td><td>${t.gf}</td><td>${t.ga}</td><td class="gd-cell ${t.gd>0?'pos':t.gd<0?'neg':''}">${t.gd>0?'+':''}${t.gd}</td><td class="pts-cell"><strong>${t.pts}</strong></td></tr>`;
    });
    html += `</tbody></table></div>`;
    return html;
}
export function renderStandingsCards(standings) {
    if (!standings || standings.length === 0) return '';
    let html = `<div class="standings-cards">`;
    standings.forEach((t, i) => {
        const colors = i === 0 ? 'rgba(255,215,0,0.1)' : i === 1 ? 'rgba(79,195,247,0.1)' : 'transparent';
        const border = i === 0 ? '#FFD700' : i === 1 ? '#4FC3F7' : 'transparent';
        html += `<div class="standings-card" style="background:${colors};border-color:${border};"><span class="sc-pos">${i+1}</span><span class="sc-flag flag">${getFlag(t.teamEn)}</span><span class="sc-team">${t.teamAr}</span><span class="sc-stat">لعب ${t.played}</span><span class="sc-stat">${t.won}-${t.drawn}-${t.lost}</span><span class="sc-stat">${t.gf}:${t.ga}</span><span class="sc-gd gd-cell ${t.gd>0?'pos':t.gd<0?'neg':''}">${t.gd>0?'+':''}${t.gd}</span><span class="sc-pts">${t.pts}</span></div>`;
    });
    html += `</div>`;
    return html;
}

export function srcBtnHtml(mi, sk, label, extraCls, extraSty, streamsData) {
    const m = streamsData && streamsData[mi];
    const fmap = {'1':'src1_ok','2':'src2_ok','3':'src3_ok','4':'src4_ok','5':'src5_ok','m3u8':'m3u8_ok','m3u82':'m3u82_ok','m3u83':'m3u83_ok'};
    const f = fmap[sk];
    const ind = f && m && m[f] !== undefined ? (m[f] ? ' <span class="src-ok">✓</span>' : ' <span class="src-fail">✗</span>') : '';
    const btn = `<button class="stream-btn${extraCls?' '+extraCls:''}"${extraSty?' style="'+extraSty+'"':''} data-index="${mi}" data-source="${sk}">▶ ${label}${ind}</button>`;
    const cnt = getSourceReportCount(mi, sk);
    const rpt = `<button class="report-btn" onclick="event.stopPropagation();">🚫${cnt>0?' '+cnt:''}</button>`;
    return `<div class="source-item">${btn}${rpt}</div>`;
}

export function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved === 'light' || (!saved && !prefersDark) ? 'light' : 'dark';
}
export function setTheme(t) {
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : '');
}
export function toggleThemeValue(t) { return t === 'light' ? 'dark' : 'light'; }

export function shareMatchData(m) {
    const d = dm(m);
    let text = `⚽ ${TEAM_NAMES[m.team1]||m.team1} ${m.score1!==null?m.score1+' - '+m.score2:''} ${TEAM_NAMES[m.team2]||m.team2}\n`;
    text += `🕐 ${d.time} ${d.date} (${getUserTz().city})\n`;
    if (m.stadium) text += `🏟️ ${STADIUM_NAMES[m.stadium]||m.stadium}\n`;
    text += `📲 تابع المباراة على: https://kora-yaser.web.app`;
    return text;
}
