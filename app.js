
        const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
        const GROUP_NAMES = {
            'A':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© A','B':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© B','C':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© C','D':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© D',
            'E':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© E','F':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© F','G':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© G','H':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© H',
            'I':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© I','J':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© J','K':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© K','L':'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© L'
        };

        let allMatches = [];
        let activeFilter = 'today';

        // === Timezone ===
        const TZ_LIST = [
            { label: 'ðŸ‡¸ðŸ‡¦ Ø§Ù„Ø±ÙŠØ§Ø¶ (Ø§Ù„Ù…Ù…Ù„ÙƒØ©)', offset: 180, iana: 'Asia/Riyadh', city: 'Riyadh' },
            { label: 'ðŸ‡°ðŸ‡¼ Ø§Ù„ÙƒÙˆÙŠØª',           offset: 180, iana: 'Asia/Kuwait', city: 'Kuwait' },
            { label: 'ðŸ‡¶ðŸ‡¦ Ø§Ù„Ø¯ÙˆØ­Ø© (Ù‚Ø·Ø±)',     offset: 180, iana: 'Asia/Qatar', city: 'Doha' },
            { label: 'ðŸ‡®ðŸ‡¶ Ø¨ØºØ¯Ø§Ø¯ (Ø§Ù„Ø¹Ø±Ø§Ù‚)',   offset: 180, iana: 'Asia/Baghdad', city: 'Baghdad' },
            { label: 'ðŸ‡¦ðŸ‡ª Ø¯Ø¨ÙŠ (Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª)',   offset: 240, iana: 'Asia/Dubai', city: 'Dubai' },
            { label: 'ðŸ‡®ðŸ‡· Ø·Ù‡Ø±Ø§Ù† (Ø¥ÙŠØ±Ø§Ù†)',    offset: 210, iana: 'Asia/Tehran', city: 'Tehran' },
            { label: 'ðŸ‡ªðŸ‡¬ Ø§Ù„Ù‚Ø§Ù‡Ø±Ø© (Ù…ØµØ±)',    offset: 120, iana: 'Africa/Cairo', city: 'Cairo' },
            { label: 'ðŸ‡±ðŸ‡§ Ø¨ÙŠØ±ÙˆØª (Ù„Ø¨Ù†Ø§Ù†)',    offset: 120, iana: 'Asia/Beirut', city: 'Beirut' },
            { label: 'ðŸ‡¯ðŸ‡´ Ø¹Ù…Ø§Ù† (Ø§Ù„Ø£Ø±Ø¯Ù†)',    offset: 120, iana: 'Asia/Amman', city: 'Amman' },
            { label: 'ðŸ‡¸ðŸ‡¾ Ø¯Ù…Ø´Ù‚ (Ø³ÙˆØ±ÙŠØ§)',     offset: 120, iana: 'Asia/Damascus', city: 'Damascus' },
            { label: 'ðŸ‡µðŸ‡¸ Ø§Ù„Ù‚Ø¯Ø³ (ÙÙ„Ø³Ø·ÙŠÙ†)',   offset: 120, iana: 'Asia/Hebron', city: 'Hebron' },
            { label: 'ðŸ‡¹ðŸ‡· Ø¥Ø³Ø·Ù†Ø¨ÙˆÙ„ (ØªØ±ÙƒÙŠØ§)',  offset: 180, iana: 'Europe/Istanbul', city: 'Istanbul' },
            { label: 'ðŸ‡¸ðŸ‡© Ø§Ù„Ø®Ø±Ø·ÙˆÙ… (Ø§Ù„Ø³ÙˆØ¯Ø§Ù†)', offset: 120, iana: 'Africa/Khartoum', city: 'Khartoum' },
            { label: 'ðŸ‡¾ðŸ‡ª Ø¹Ø¯Ù† (Ø§Ù„ÙŠÙ…Ù†)',      offset: 180, iana: 'Asia/Aden', city: 'Aden' },
            { label: 'ðŸ‡²ðŸ‡¦ Ø§Ù„Ø¯Ø§Ø± Ø§Ù„Ø¨ÙŠØ¶Ø§Ø¡ (Ø§Ù„Ù…ØºØ±Ø¨)', offset: 60, iana: 'Africa/Casablanca', city: 'Casablanca' },
            { label: 'ðŸ‡©ðŸ‡¿ Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±',          offset: 60,  iana: 'Africa/Algiers', city: 'Algiers' },
            { label: 'ðŸ‡¹ðŸ‡³ ØªÙˆÙ†Ø³',             offset: 60,  iana: 'Africa/Tunis', city: 'Tunis' },
            { label: 'ðŸ‡¬ðŸ‡§ Ù„Ù†Ø¯Ù† (Ø¨Ø±ÙŠØ·Ø§Ù†ÙŠØ§)',  offset: 60,  iana: 'Europe/London', city: 'London' },
            { label: 'ðŸ‡ªðŸ‡º Ø¨Ø±Ù„ÙŠÙ† (Ø£Ù„Ù…Ø§Ù†ÙŠØ§)',  offset: 120, iana: 'Europe/Berlin', city: 'Berlin' },
            { label: 'ðŸ‡«ðŸ‡· Ø¨Ø§Ø±ÙŠØ³ (ÙØ±Ù†Ø³Ø§)',    offset: 120, iana: 'Europe/Paris', city: 'Paris' },
            { label: 'ðŸ‡®ðŸ‡¹ Ø±ÙˆÙ…Ø§ (Ø¥ÙŠØ·Ø§Ù„ÙŠØ§)',   offset: 120, iana: 'Europe/Rome', city: 'Rome' },
            { label: 'ðŸ‡ªðŸ‡¸ Ù…Ø¯Ø±ÙŠØ¯ (Ø¥Ø³Ø¨Ø§Ù†ÙŠØ§)',  offset: 120, iana: 'Europe/Madrid', city: 'Madrid' },
            { label: 'ðŸ‡ºðŸ‡¸ Ù†ÙŠÙˆÙŠÙˆØ±Ùƒ',          offset: -240, iana: 'America/New_York', city: 'New York' },
            { label: 'ðŸ‡ºðŸ‡¸ ÙˆØ§Ø´Ù†Ø·Ù†',           offset: -240, iana: 'America/New_York', city: 'Washington' },
            { label: 'ðŸ‡¨ðŸ‡¦ ØªÙˆØ±ÙˆÙ†ØªÙˆ',          offset: -240, iana: 'America/Toronto', city: 'Toronto' },
            { label: 'ðŸ‡ºðŸ‡¸ Ø´ÙŠÙƒØ§ØºÙˆ',           offset: -300, iana: 'America/Chicago', city: 'Chicago' },
            { label: 'ðŸ‡ºðŸ‡¸ Ø¯Ù†ÙØ±',             offset: -360, iana: 'America/Denver', city: 'Denver' },
            { label: 'ðŸ‡ºðŸ‡¸ Ù„ÙˆØ³ Ø£Ù†Ø¬Ù„ÙˆØ³',       offset: -420, iana: 'America/Los_Angeles', city: 'Los Angeles' },
            { label: 'ðŸ‡§ðŸ‡· Ø³Ø§Ùˆ Ø¨Ø§ÙˆÙ„Ùˆ (Ø§Ù„Ø¨Ø±Ø§Ø²ÙŠÙ„)', offset: -180, iana: 'America/Sao_Paulo', city: 'Sao Paulo' },
            { label: 'ðŸ‡¦ðŸ‡· Ø¨ÙˆÙŠÙ†Ø³ Ø¢ÙŠØ±Ø³ (Ø§Ù„Ø£Ø±Ø¬Ù†ØªÙŠÙ†)', offset: -180, iana: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires' },
            { label: 'ðŸ‡¦ðŸ‡º Ø³ÙŠØ¯Ù†ÙŠ (Ø£Ø³ØªØ±Ø§Ù„ÙŠØ§)', offset: 660, iana: 'Australia/Sydney', city: 'Sydney' },
            { label: 'ðŸ‡¯ðŸ‡µ Ø·ÙˆÙƒÙŠÙˆ (Ø§Ù„ÙŠØ§Ø¨Ø§Ù†)',  offset: 540, iana: 'Asia/Tokyo', city: 'Tokyo' },
            { label: 'ðŸ‡¨ðŸ‡³ Ø¨ÙƒÙŠÙ† (Ø§Ù„ØµÙŠÙ†)',     offset: 480, iana: 'Asia/Shanghai', city: 'Shanghai' },
            { label: 'ðŸ‡®ðŸ‡³ Ù†ÙŠÙˆØ¯Ù„Ù‡ÙŠ (Ø§Ù„Ù‡Ù†Ø¯)',  offset: 330, iana: 'Asia/Kolkata', city: 'Kolkata' },
        ];
        const TZ_KEY = 'kora_tz';

        function getUserTz() {
            try { const s = localStorage.getItem(TZ_KEY); return s ? JSON.parse(s) : TZ_LIST[0]; }
            catch(e) { return TZ_LIST[0]; }
        }

        function saveUserTz(tz) {
            localStorage.setItem(TZ_KEY, JSON.stringify(tz));
        }

        function getTodayStr(tzIana) {
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

        // Convert AST (Saudi time, UTC+3) to user's selected timezone
        function astToUser(astTime, astDate, userOffset) {
            if (!astTime || !astDate) return { time: astTime || '--:--', label: '', date: astDate || '' };
            const diff = userOffset - 180;
            if (diff === 0) {
                const h = parseInt(astTime);
                const lbl = h >= 0 && h < 5 ? 'ÙØ¬Ø±Ù‹Ø§' : h < 12 ? 'ØµØ¨Ø§Ø­Ù‹Ø§' : h < 13 ? 'Ø¸Ù‡Ø±Ù‹Ø§' : h < 17 ? 'Ø¨Ø¹Ø¯ Ø§Ù„Ø¸Ù‡Ø±' : h < 21 ? 'Ù…Ø³Ø§Ø¡Ù‹' : 'Ù„ÙŠÙ„Ø§Ù‹';
                return { time: astTime, label: lbl, date: astDate };
            }
            const [h, m] = astTime.split(':').map(Number);
            let newH = h + diff;
            let dayOff = 0;
            if (newH >= 24) { newH -= 24; dayOff = 1; }
            if (newH < 0) { newH += 24; dayOff = -1; }
            const lbl = newH >= 0 && newH < 5 ? 'ÙØ¬Ø±Ù‹Ø§' : newH < 12 ? 'ØµØ¨Ø§Ø­Ù‹Ø§' : newH < 13 ? 'Ø¸Ù‡Ø±Ù‹Ø§' : newH < 17 ? 'Ø¨Ø¹Ø¯ Ø§Ù„Ø¸Ù‡Ø±' : newH < 21 ? 'Ù…Ø³Ø§Ø¡Ù‹' : 'Ù„ÙŠÙ„Ø§Ù‹';
            let newDate = astDate;
            if (dayOff !== 0) {
                const dp = astDate.split('-').map(Number);
                const d = new Date(Date.UTC(dp[0], dp[1] - 1, dp[2] + dayOff));
                newDate = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
            }
            return { time: String(newH).padStart(2, '0') + ':' + String(m).padStart(2, '0'), label: lbl, date: newDate };
        }

        // Cache display-adjusted values per match
        function dm(m) {
            if (!m._dm) {
                const tz = getUserTz();
                m._dm = astToUser(m.timeAst, m.dateAst || m.date, tz.offset);
                m._dm.id = m.id; m._dm.score1 = m.score1; m._dm.score2 = m.score2;
                m._dm.team1En = m.team1En; m._dm.team2En = m.team2En;
                m._dm.team1Ar = m.team1Ar; m._dm.team2Ar = m.team2Ar;
                m._dm.group = m.group; m._dm.stadium = m.stadium;
                m._dm.timeAst = m.timeAst; m._dm.dateAst = m.dateAst || m.date;
            }
            return m._dm;
        }

        // Clear display cache (when TZ changes)
        function clearDmCache() {
            allMatches.forEach(m => delete m._dm);
        }

        function getSaudiTodayStr() {
            return getTodayStr();
        }

        function updateClock() {
            const now = new Date();
            const tz = getUserTz();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz.iana,
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
            });
            const parts = formatter.formatToParts(now);
            const p = {};
            parts.forEach(part => { p[part.type] = part.value; });

            const h = parseInt(p.hour);
            const m = parseInt(p.minute);
            const s = parseInt(p.second);
            const year = parseInt(p.year);
            const month = parseInt(p.month);
            const day = parseInt(p.day);

            const ampm = h >= 12 ? 'Ù…Ø³Ø§Ø¡Ù‹' : 'ØµØ¨Ø§Ø­Ù‹Ø§';
            const h12 = h % 12 || 12;
            document.getElementById('saudiTime').textContent =
                String(h12).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
            document.getElementById('amPm').textContent = ampm;

            const dayFormatter = new Intl.DateTimeFormat('ar-SA', { timeZone: tz.iana, weekday: 'long' });
            const weekdayName = dayFormatter.format(now);

            const months = ['ÙŠÙ†Ø§ÙŠØ±','ÙØ¨Ø±Ø§ÙŠØ±','Ù…Ø§Ø±Ø³','Ø£Ø¨Ø±ÙŠÙ„','Ù…Ø§ÙŠÙˆ','ÙŠÙˆÙ†ÙŠÙˆ','ÙŠÙˆÙ„ÙŠÙˆ','Ø£ØºØ³Ø·Ø³','Ø³Ø¨ØªÙ…Ø¨Ø±','Ø£ÙƒØªÙˆØ¨Ø±','Ù†ÙˆÙÙ…Ø¨Ø±','Ø¯ÙŠØ³Ù…Ø¨Ø±'];
            document.getElementById('saudiDate').textContent =
                weekdayName + 'ØŒ ' + day + ' ' + months[month - 1] + ' ' + year;
        }

        function getStatus(score1, score2, date, timeAst, dateAst) {
            if (score1 !== null) return 'finished';
            const now = new Date();
            const [h, m] = timeAst.split(':').map(Number);
            const dateParts = (dateAst || date).split('-').map(Number);
            const matchDate = new Date(Date.UTC(dateParts[0], dateParts[1]-1, dateParts[2], h - 3, m));
            const diff = (now - matchDate) / 1000 / 60;
            if (diff >= 125) return 'finished';
            if (diff > 0) return 'ongoing';
            return 'upcoming';
        }

        function getStatusText(status) {
            const map = { finished: 'Ø§Ù†ØªÙ‡Øª', ongoing: 'Ù…Ø¨Ø§Ø´Ø±', upcoming: 'Ù‚Ø§Ø¯Ù…Ø©' };
            return map[status] || status;
        }

        function to12h(time24) {
            if (!time24) return '';
            const [h, m] = time24.split(':').map(Number);
            const pm = h >= 12;
            const h12 = h % 12 || 12;
            return String(h12).padStart(2,'0') + ':' + String(m).padStart(2,'0') + (pm ? ' Ù…' : ' Øµ');
        }

        function countdownText(dateStr, timeAst) {
            if (!dateStr || !timeAst) return '';
            const [yh, mh, dh] = dateStr.split('-').map(Number);
            const [hh, mnt] = timeAst.split(':').map(Number);
            const matchTime = new Date(Date.UTC(yh, mh - 1, dh, hh - 3, mnt));
            const now = new Date();
            const diffMs = matchTime - now;
            if (diffMs <= 0) return '';
            const totalMin = Math.floor(diffMs / 60000);
            const hours = Math.floor(totalMin / 60);
            const mins = totalMin % 60;
            if (hours > 0) return 'Ø¨Ø¹Ø¯ ' + hours + ' Ø³Ø§Ø¹Ø© Ùˆ ' + mins + ' Ø¯Ù‚ÙŠÙ‚Ø©';
            return 'Ø¨Ø¹Ø¯ ' + mins + ' Ø¯Ù‚ÙŠÙ‚Ø©';
        }

        function updateCountdowns() {
            document.querySelectorAll('.countdown').forEach(el => {
                const date = el.dataset.date;
                const time = el.dataset.time;
                el.textContent = countdownText(date, time) || '';
            });
        }

        function isToday(m) {
            const dateStr = dm(m).date;
            return dateStr === getTodayStr();
        }

        function todayMatches(matches) {
            const todayStr = getTodayStr();
            return matches.filter(m => dm(m).date === todayStr);
        }

        function renderMatches(matches, activeGroup) {
            const content = document.getElementById('content');
            const filtered = activeGroup === 'today'
                ? todayMatches(matches)
                : activeGroup === 'all'
                    ? matches
                    : matches.filter(m => m.group === activeGroup);

            const grouped = {};
            filtered.forEach(m => {
                if (!grouped[m.group]) grouped[m.group] = [];
                grouped[m.group].push(m);
            });

            let html = '';

            if (activeGroup === 'today') {
                // Favorites section
                const favTeams = getFavorites();
                const favMatches = filtered.filter(m => favTeams.includes(m.team1En) || favTeams.includes(m.team2En));
                if (favMatches.length > 0) {
                    html += `<div class="group-section fav-section">`;
                    html += `<div class="group-header open" style="background:linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,193,7,0.05));border-bottom:1px solid rgba(255,215,0,0.2);">`;
                    html += `<span>â­ Ù…Ø¨Ø§Ø±ÙŠØ§ØªÙŠ</span>`;
                    html += `<span class="count" style="display:flex;align-items:center;gap:8px;">`;
                    html += `<select class="notify-select" onchange="setNotifyMin(parseInt(this.value))" title="Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª">`;
                    const curMin = getNotifyMin();
                    [[30,'30 Ø¯Ù‚ÙŠÙ‚Ø©'],[15,'15 Ø¯Ù‚ÙŠÙ‚Ø©'],[0,'Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©']].forEach(([v,t]) => {
                        html += `<option value="${v}"${v===curMin?' selected':''}>ðŸ”” ${t}</option>`;
                    });
                    html += `</select>`;
                    html += `<span>${favMatches.length} Ù…Ø¨Ø§Ø±Ø§Ø©</span></span>`;
                    html += `</div>`;
                    html += `<div class="group-body open"><div class="table-wrap"><table><thead><tr>`;
                    html += `<th>Ø§Ù„ØªÙˆÙ‚ÙŠØª</th><th>Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©</th><th>Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</th><th>Ø§Ù„Ù†ØªÙŠØ¬Ø©</th><th>Ø§Ù„Ù…Ù„Ø¹Ø¨</th><th>Ø§Ù„Ø­Ø§Ù„Ø©</th><th style="width:40px;"></th>`;
                    html += `</tr></thead><tbody>`;
                    favMatches.sort((a, b) => a.timeAst.localeCompare(b.timeAst)).forEach(m => {
                        const status = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                        html += `<tr class="today-row fav-row">`;
                        html += `<td><span class="time-ast">${to12h(dm(m).time)}</span><br><span class="time-label">${dm(m).label}</span><br><span class="countdown" data-date="${m.dateAst || m.date}" data-time="${m.timeAst}"></span></td>`;
                        html += `<td><span class="group-badge">${m.group}</span></td>`;
                        html += `<td class="match-teams">${favStar(m.team1En, true)} <span class="flag">${getFlag(m.team1En)}</span> ${m.team1Ar} <span class="vs">vs</span> ${m.team2Ar} <span class="flag">${getFlag(m.team2En)}</span> ${favStar(m.team2En, true)}</td>`;
                        html += `<td class="score-cell ${m.score1 !== null ? 'has-score' : 'no-score'}">`;
                        html += m.score1 !== null ? `${m.score1} - ${m.score2}` : `- : -`;
                        html += `</td>`;
                        html += `<td class="stadium-cell">${m.stadium}</td>`;
                        html += `<td><span class="status-badge ${status}">${getStatusText(status)}</span></td>`;
                        html += `<td><button class="share-btn" onclick="shareMatch(${m.id},this)" title="Ù…Ø´Ø§Ø±ÙƒØ©">ðŸ“¤</button></td>`;
                        html += `</tr>`;
                    });
                    html += `</tbody></table></div>`;
                    html += `<div class="card-grid">`;
                    favMatches.sort((a, b) => a.timeAst.localeCompare(b.timeAst)).forEach(m => {
                        const status = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                        const scoreDisplay = m.score1 !== null ? `${m.score1} - ${m.score2}` : 'âš½';
                        html += `<div class="mc fav-mc">
                            <div class="mc-teams">
                                ${favStar(m.team1En, true)} <span class="flag">${getFlag(m.team1En)}</span> ${m.team1Ar}
                                <span class="vs">vs</span>
                                ${m.team2Ar} <span class="flag">${getFlag(m.team2En)}</span>
                                ${favStar(m.team2En, true)}
                            </div>
                            <div class="mc-info">
                                <span class="mc-time">${to12h(dm(m).time)} ${dm(m).label}</span>
                                <span class="group-badge" style="font-size:11px;background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:10px;">${m.group}</span>
                                <span class="mc-score ${m.score1 !== null ? 'has-score' : ''}">${scoreDisplay}</span>
                                <span class="status-badge ${status}">${getStatusText(status)}</span>
                                <button class="share-btn" onclick="shareMatch(${m.id},this)" title="Ù…Ø´Ø§Ø±ÙƒØ©">ðŸ“¤</button>
                            </div>
                        </div>`;
                    });
                    html += `</div></div></div>`;
                }

                html += `<div class="group-section">`;
                html += `<div class="group-header open">`;
                html += `<span>ðŸ“… Ù…Ø¨Ø§Ø±ÙŠØ§Øª Ø§Ù„ÙŠÙˆÙ… (${formatDate(getTodayStr())})</span>`;
                html += `<span class="count">${filtered.length} Ù…Ø¨Ø§Ø±Ø§Ø©</span>`;
                html += `</div>`;
                html += `<div class="group-body open"><div class="table-wrap"><table><thead><tr>`;
                html += `<th>Ø§Ù„ØªÙˆÙ‚ÙŠØª</th><th>Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©</th><th>Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</th><th>Ø§Ù„Ù†ØªÙŠØ¬Ø©</th><th>Ø§Ù„Ù…Ù„Ø¹Ø¨</th><th>Ø§Ù„Ø­Ø§Ù„Ø©</th><th style="width:40px;"></th>`;
                html += `</tr></thead><tbody>`;

                filtered.sort((a, b) => a.timeAst.localeCompare(b.timeAst)).forEach(m => {
                    const status = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                    html += `<tr class="today-row">`;
                    html += `<td><span class="time-ast">${to12h(dm(m).time)}</span><br><span class="time-label">${dm(m).label}</span><br><span class="countdown" data-date="${m.dateAst || m.date}" data-time="${m.timeAst}"></span></td>`;
                    html += `<td><span class="group-badge">${m.group}</span></td>`;
                    html += `<td class="match-teams">
                        ${favStar(m.team1En, isFavorite(m.team1En))}
                        <span class="flag">${getFlag(m.team1En)}</span> ${m.team1Ar}
                        <span class="vs">vs</span>
                        ${m.team2Ar} <span class="flag">${getFlag(m.team2En)}</span>
                        ${favStar(m.team2En, isFavorite(m.team2En))}
                    </td>`;
                    html += `<td class="score-cell ${m.score1 !== null ? 'has-score' : 'no-score'}">`;
                    html += m.score1 !== null ? `${m.score1} - ${m.score2}` : `- : -`;
                    html += `</td>`;
                    html += `<td class="stadium-cell">${m.stadium}</td>`;
                    html += `<td><span class="status-badge ${status}">${getStatusText(status)}</span></td>`;
                    html += `<td><button class="share-btn" onclick="shareMatch(${m.id},this)" title="Ù…Ø´Ø§Ø±ÙƒØ©">ðŸ“¤</button></td>`;
                    html += `</tr>`;
                });

                html += `</tbody></table></div>`;

                // Card layout for mobile
                html += `<div class="card-grid">`;
                filtered.sort((a, b) => a.timeAst.localeCompare(b.timeAst)).forEach(m => {
                    const status = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                    const statusText = getStatusText(status);
                    const scoreDisplay = m.score1 !== null ? `${m.score1} - ${m.score2}` : 'âš½';
                    html += `<div class="mc">
                        <div class="mc-teams">
                            ${favStar(m.team1En, isFavorite(m.team1En))}
                            <span class="flag">${getFlag(m.team1En)}</span> ${m.team1Ar}
                            <span class="vs">vs</span>
                            ${m.team2Ar} <span class="flag">${getFlag(m.team2En)}</span>
                            ${favStar(m.team2En, isFavorite(m.team2En))}
                        </div>
                        <div class="mc-info">
                            <span class="mc-time">${to12h(dm(m).time)} ${dm(m).label}</span>
                            <span class="group-badge" style="font-size:11px;background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:10px;">${m.group}</span>
                            <span class="mc-score ${m.score1 !== null ? 'has-score' : ''}">${scoreDisplay}</span>
                            <span class="status-badge ${status}">${statusText}</span>
                            <button class="share-btn" onclick="shareMatch(${m.id},this)" title="Ù…Ø´Ø§Ø±ÙƒØ©">ðŸ“¤</button>
                        </div>
                    </div>`;
                });
                html += `</div></div></div>`;
            } else {
                const sortedGroups = Object.keys(grouped).sort();
                sortedGroups.forEach((g, gi) => {
                    const matchesInGroup = grouped[g];
                    const todayCount = matchesInGroup.filter(m => isToday(m)).length;
                    const openDefault = activeGroup !== 'all' || todayCount > 0;
                    html += `<div class="group-section">`;
                    html += `<div class="group-header${openDefault ? ' open' : ''}" onclick="toggleGroup(this)">`;
                    html += `<span><span class="toggle-icon">â–¶</span> ${GROUP_NAMES[g] || 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© ' + g}</span>`;
                    html += `<span class="count">${todayCount > 0 ? 'ðŸ”´ ' + todayCount + ' Ø§Ù„ÙŠÙˆÙ… Â· ' : ''}${matchesInGroup.length} Ù…Ø¨Ø§Ø±ÙŠØ§Øª</span>`;
                    html += `</div>`;
                    const standings = getGroupStandings(g);
                    const hasStandings = standings.length > 0;

                    html += `<div class="group-body${openDefault ? ' open' : ''}">`;

                    // Sub-tabs: Ø§Ù„ØªØ±ØªÙŠØ¨ and Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª
                    if (hasStandings) {
                        html += `<div class="group-sub-tabs">
                            <button class="group-sub-tab active" onclick="switchGroupSubTab(this,'standings')">ðŸ“Š Ø§Ù„ØªØ±ØªÙŠØ¨</button>
                            <button class="group-sub-tab" onclick="switchGroupSubTab(this,'matches')">ðŸ“… Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª</button>
                        </div>`;
                        html += `<div class="group-sub-content active" id="gs-${g}">${renderStandingsHtml(standings)}${renderStandingsCards(standings)}</div>`;
                        html += `<div class="group-sub-content" id="gm-${g}">`;
                    }

                    html += `<div class="table-wrap"><table><thead><tr>`;
                    html += `<th>Ø§Ù„ØªØ§Ø±ÙŠØ®</th><th>Ø§Ù„ØªÙˆÙ‚ÙŠØª (Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©)</th><th>Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø©</th><th>Ø§Ù„Ù†ØªÙŠØ¬Ø©</th><th>Ø§Ù„Ù…Ù„Ø¹Ø¨</th><th>Ø§Ù„Ø­Ø§Ù„Ø©</th><th style="width:40px;"></th>`;
                    html += `</tr></thead><tbody>`;

                    matchesInGroup.forEach(m => {
                        const status = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                        const isTodayMatch = isToday(m);
                        html += `<tr class="${isTodayMatch ? 'today-row' : ''}">`;
                        html += `<td class="date-cell">${formatDate(dm(m).date)}</td>`;
                        html += `<td><span class="time-ast">${to12h(dm(m).time)}</span><br><span class="time-label">${dm(m).label}</span><br><span class="countdown" data-date="${m.dateAst || m.date}" data-time="${m.timeAst}"></span></td>`;
                        html += `<td class="match-teams">
                            ${favStar(m.team1En, isFavorite(m.team1En))}
                            <span class="flag">${getFlag(m.team1En)}</span> ${m.team1Ar}
                            <span class="vs">vs</span>
                            ${m.team2Ar} <span class="flag">${getFlag(m.team2En)}</span>
                            ${favStar(m.team2En, isFavorite(m.team2En))}
                        </td>`;
                        html += `<td class="score-cell ${m.score1 !== null ? 'has-score' : 'no-score'}">`;
                        html += m.score1 !== null ? `${m.score1} - ${m.score2}` : `- : -`;
                        html += `</td>`;
                        html += `<td class="stadium-cell">${m.stadium}</td>`;
                        html += `<td><span class="status-badge ${status}">${getStatusText(status)}</span></td>`;
                        html += `<td><button class="share-btn" onclick="shareMatch(${m.id},this)" title="Ù…Ø´Ø§Ø±ÙƒØ©">ðŸ“¤</button></td>`;
                        html += `</tr>`;
                    });

                    html += `</tbody></table></div>`;

                    // Card layout for mobile
                    html += `<div class="card-grid">`;
                    // Group date header
                    let prevDate = '';
                    matchesInGroup.forEach(m => {
                        const status = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                        const statusText = getStatusText(status);
                        const scoreDisplay = m.score1 !== null ? `${m.score1} - ${m.score2}` : 'âš½';
                        const dateStr = formatDate(dm(m).date);
                        if (dateStr !== prevDate) {
                            html += `<div class="day-label">${dateStr}</div>`;
                            prevDate = dateStr;
                        }
                        html += `<div class="mc ${isToday(m) ? 'today-row' : ''}">
                            <div class="mc-teams">
                                ${favStar(m.team1En, isFavorite(m.team1En))}
                                <span class="flag">${getFlag(m.team1En)}</span> ${m.team1Ar}
                                <span class="vs">vs</span>
                                ${m.team2Ar} <span class="flag">${getFlag(m.team2En)}</span>
                                ${favStar(m.team2En, isFavorite(m.team2En))}
                            </div>
                            <div class="mc-info">
                                <span class="mc-time">${to12h(dm(m).time)} ${dm(m).label}</span>
                                <span style="font-size:11px;color:#888;">${m.stadium}</span>
                                <span class="mc-score ${m.score1 !== null ? 'has-score' : ''}">${scoreDisplay}</span>
                                <span class="status-badge ${status}">${statusText}</span>
                                <button class="share-btn" onclick="shareMatch(${m.id},this)" title="Ù…Ø´Ø§Ø±ÙƒØ©">ðŸ“¤</button>
                            </div>
                        </div>`;
                    });
                    html += `</div>`;

                    if (hasStandings) { html += `</div>`; }  // close gm-{g} wrapper
                    html += `</div></div>`;
                });
            }

            if ((activeGroup !== 'today' && Object.keys(grouped).length === 0) ||
                (activeGroup === 'today' && filtered.length === 0)) {
                html = `<div style="text-align:center;padding:40px;color:#666;">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØµÙ†ÙŠÙ</div>`;
            }

            content.innerHTML = html;
        }

        function formatDate(dateStr) {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length < 3) return dateStr;
            const day = parseInt(parts[2], 10);
            const monthIndex = parseInt(parts[1], 10) - 1;
            const months = ['ÙŠÙ†Ø§ÙŠØ±','ÙØ¨Ø±Ø§ÙŠØ±','Ù…Ø§Ø±Ø³','Ø£Ø¨Ø±ÙŠÙ„','Ù…Ø§ÙŠÙˆ','ÙŠÙˆÙ†ÙŠÙˆ','ÙŠÙˆÙ„ÙŠÙˆ','Ø£ØºØ³Ø·Ø³','Ø³Ø¨ØªÙ…Ø¨Ø±','Ø£ÙƒØªÙˆØ¨Ø±','Ù†ÙˆÙÙ…Ø¨Ø±','Ø¯ÙŠØ³Ù…Ø¨Ø±'];
            return day + ' ' + (months[monthIndex] || '');
        }

        // === Group Standings ===
        function getGroupStandings(group) {
            const matches = allMatches.filter(m => m.group === group && m.score1 !== null);
            const teams = {};
            matches.forEach(m => {
                if (!teams[m.team1En]) {
                    teams[m.team1En] = { teamAr: m.team1Ar, teamEn: m.team1En, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
                }
                if (!teams[m.team2En]) {
                    teams[m.team2En] = { teamAr: m.team2Ar, teamEn: m.team2En, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
                }
            });
            matches.forEach(m => {
                const t1 = teams[m.team1En];
                const t2 = teams[m.team2En];
                if (!t1 || !t2) return;
                t1.played++; t2.played++;
                t1.gf += m.score1; t1.ga += m.score2;
                t2.gf += m.score2; t2.ga += m.score1;
                if (m.score1 > m.score2) {
                    t1.won++; t1.pts += 3; t2.lost++;
                } else if (m.score1 < m.score2) {
                    t2.won++; t2.pts += 3; t1.lost++;
                } else {
                    t1.drawn++; t1.pts++; t2.drawn++; t2.pts++;
                }
            });
            return Object.values(teams)
                .map(t => ({ ...t, gd: t.gf - t.ga }))
                .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
        }

        function renderStandingsHtml(standings) {
            if (!standings || standings.length === 0) return '';
            let html = `<div class="standings-wrap"><table class="standings-table">
                <thead><tr>
                    <th>#</th><th>Ø§Ù„Ù…Ù†ØªØ®Ø¨</th><th>Ù„Ø¹Ø¨</th><th>ÙØ§Ø²</th><th>Øª</th><th>Ø®Ø³Ø±</th>
                    <th>Ù„Ù‡</th><th>Ø¹Ù„ÙŠÙ‡</th><th>Ø§Ù„ÙØ±Ù‚</th><th>Ø§Ù„Ù†Ù‚Ø§Ø·</th>
                </tr></thead><tbody>`;
            standings.forEach((t, i) => {
                const posClass = i === 0 ? 'pos-1' : i === 1 ? 'pos-2' : '';
                html += `<tr class="${posClass}">
                    <td>${i + 1}</td>
                    <td class="team-cell"><span class="flag">${getFlag(t.teamEn)}</span> ${t.teamAr}</td>
                    <td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td>
                    <td>${t.gf}</td><td>${t.ga}</td>
                    <td class="gd-cell ${t.gd > 0 ? 'pos' : t.gd < 0 ? 'neg' : ''}">${t.gd > 0 ? '+' : ''}${t.gd}</td>
                    <td class="pts-cell"><strong>${t.pts}</strong></td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
            return html;
        }

        function renderStandingsCards(standings) {
            if (!standings || standings.length === 0) return '';
            let html = `<div style="padding:12px 16px;display:grid;gap:8px;">`;
            standings.forEach((t, i) => {
                const colors = i === 0 ? ['rgba(255,215,0,0.1)','#FFD700'] : i === 1 ? ['rgba(79,195,247,0.1)','#4FC3F7'] : ['transparent','transparent'];
                html += `<div style="display:flex;align-items:center;gap:8px;background:${colors[0]};border-radius:8px;padding:8px 12px;border-right:3px solid ${colors[1]};">
                    <span style="font-weight:800;color:#90a4ae;min-width:24px;">${i+1}</span>
                    <span class="flag" style="font-size:20px;">${getFlag(t.teamEn)}</span>
                    <span style="font-weight:700;flex:1;">${t.teamAr}</span>
                    <span style="color:#888;font-size:12px;">Ù„Ø¹Ø¨ ${t.played}</span>
                    <span style="font-weight:700;">${t.won}-${t.drawn}-${t.lost}</span>
                    <span style="color:#90a4ae;font-size:12px;">${t.gf}:${t.ga}</span>
                    <span class="gd-cell ${t.gd > 0 ? 'pos' : t.gd < 0 ? 'neg' : ''}" style="font-size:13px;min-width:32px;text-align:center;font-weight:700;">${t.gd > 0 ? '+' : ''}${t.gd}</span>
                    <span style="font-weight:800;color:#ffc107;font-size:15px;min-width:28px;text-align:center;">${t.pts}</span>
                </div>`;
            });
            html += `</div>`;
            return html;
        }

        function getFlag(team) {
            const flags = {
                'Mexico':'ðŸ‡²ðŸ‡½','South Africa':'ðŸ‡¿ðŸ‡¦','South Korea':'ðŸ‡°ðŸ‡·','Czech Republic':'ðŸ‡¨ðŸ‡¿',
                'Canada':'ðŸ‡¨ðŸ‡¦','Bosnia & Herzegovina':'ðŸ‡§ðŸ‡¦','Qatar':'ðŸ‡¶ðŸ‡¦','Switzerland':'ðŸ‡¨ðŸ‡­',
                'Brazil':'ðŸ‡§ðŸ‡·','Morocco':'ðŸ‡²ðŸ‡¦','Haiti':'ðŸ‡­ðŸ‡¹','Scotland':'ðŸ´ó §ó ¢ó ³ó £ó ´ó ¿',
                'USA':'ðŸ‡ºðŸ‡¸','Paraguay':'ðŸ‡µðŸ‡¾','Australia':'ðŸ‡¦ðŸ‡º','Turkey':'ðŸ‡¹ðŸ‡·',
                'Germany':'ðŸ‡©ðŸ‡ª','CuraÃ§ao':'ðŸ‡¨ðŸ‡¼','Ivory Coast':'ðŸ‡¨ðŸ‡®','Ecuador':'ðŸ‡ªðŸ‡¨',
                'Netherlands':'ðŸ‡³ðŸ‡±','Japan':'ðŸ‡¯ðŸ‡µ','Sweden':'ðŸ‡¸ðŸ‡ª','Tunisia':'ðŸ‡¹ðŸ‡³',
                'Belgium':'ðŸ‡§ðŸ‡ª','Egypt':'ðŸ‡ªðŸ‡¬','Iran':'ðŸ‡®ðŸ‡·','New Zealand':'ðŸ‡³ðŸ‡¿',
                'Spain':'ðŸ‡ªðŸ‡¸','Cape Verde':'ðŸ‡¨ðŸ‡»','Saudi Arabia':'ðŸ‡¸ðŸ‡¦','Uruguay':'ðŸ‡ºðŸ‡¾',
                'France':'ðŸ‡«ðŸ‡·','Senegal':'ðŸ‡¸ðŸ‡³','Iraq':'ðŸ‡®ðŸ‡¶','Norway':'ðŸ‡³ðŸ‡´',
                'Argentina':'ðŸ‡¦ðŸ‡·','Algeria':'ðŸ‡©ðŸ‡¿','Austria':'ðŸ‡¦ðŸ‡¹','Jordan':'ðŸ‡¯ðŸ‡´',
                'Portugal':'ðŸ‡µðŸ‡¹','DR Congo':'ðŸ‡¨ðŸ‡©','Uzbekistan':'ðŸ‡ºðŸ‡¿','Colombia':'ðŸ‡¨ðŸ‡´',
                'England':'ðŸ´ó §ó ¢ó ¥ó ®ó §ó ¿','Croatia':'ðŸ‡­ðŸ‡·','Ghana':'ðŸ‡¬ðŸ‡­','Panama':'ðŸ‡µðŸ‡¦'
            };
            return flags[team] || 'ðŸ³ï¸';
        }

        // === Favorites ===
        const FAV_KEY = 'kora_favs';

        function getFavorites() {
            try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch(e) { return []; }
        }

        function saveFavorites(favs) {
            localStorage.setItem(FAV_KEY, JSON.stringify(favs));
        }

        function toggleFavorite(teamEn) {
            let favs = getFavorites();
            if (favs.includes(teamEn)) {
                favs = favs.filter(t => t !== teamEn);
            } else {
                favs.push(teamEn);
            }
            saveFavorites(favs);
            return favs.includes(teamEn);
        }

        function isFavorite(teamEn) {
            return getFavorites().includes(teamEn);
        }

        function favStar(teamEn, isFav) {
            const reRender = "renderMatches(allMatches, activeSection==='today'?'today':activeGroupFilter)";
            return `<span class="fav-star ${isFav ? 'active' : ''}" data-team="${teamEn}" onclick="event.stopPropagation();this.classList.toggle('active');toggleFavorite('${teamEn}');${reRender};requestNotifyPerm()">${isFav ? 'â­' : 'â˜†'}</span>`;
        }

        // === Notifications ===
        const NOTIFY_MIN_KEY = 'kora_notify_min';
        const NOTIFIED_KEY = 'kora_notified';

        function getNotifyMin() {
            return parseInt(localStorage.getItem(NOTIFY_MIN_KEY) || '30');
        }

        function setNotifyMin(min) {
            localStorage.setItem(NOTIFY_MIN_KEY, String(min));
            // Re-render favorites section to update UI
            if (activeSection === 'today') renderMatches(allMatches, 'today');
        }

        function getNotifiedIds() {
            try { return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'); } catch(e) { return []; }
        }

        function markNotified(id) {
            const ids = getNotifiedIds();
            if (!ids.includes(id)) { ids.push(id); localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids)); }
        }

        function requestNotifyPerm() {
            if (!('Notification' in window) || Notification.permission === 'granted' || Notification.permission === 'denied') return;
            Notification.requestPermission();
        }

        function checkNotifications() {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            const favs = getFavorites();
            if (favs.length === 0) return;
            const notifyMin = getNotifyMin();
            const notified = getNotifiedIds();
            const now = Date.now();

            allMatches.forEach(m => {
                if (notified.includes(m.id)) return;
                if (!favs.includes(m.team1En) && !favs.includes(m.team2En)) return;

                const ds = m.dateAst || m.date;
                const tp = m.timeAst ? m.timeAst.split(':') : null;
                if (!ds || !tp || tp.length < 2) return;
                const h = parseInt(tp[0]), min = parseInt(tp[1]);
                const dp = ds.split('-').map(Number);
                if (dp.length < 3) return;

                const matchUtc = Date.UTC(dp[0], dp[1] - 1, dp[2], h - 3, min);
                const diffMin = (matchUtc - now) / 60000;

                if (diffMin > 0 && diffMin <= notifyMin) {
                    const title = `ðŸ”” ${m.team1Ar} ${m.team2Ar}`;
                    const body = notifyMin > 0 ? `Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ø¨Ø¹Ø¯ ${notifyMin} Ø¯Ù‚ÙŠÙ‚Ø©` : 'Ø§Ù„Ù…Ø¨Ø§Ø±Ø§Ø© Ø¨Ø¯Ø£Øª Ø§Ù„Ø¢Ù†!';
                    try { new Notification(title, { body, icon: '/icons/icon-192x192.png' }); } catch(e) {}
                    markNotified(m.id);
                }
            });
        }

        function shareMatch(id, btn) {
            const m = allMatches.find(x => x.id === id);
            if (!m) return;
            const scoreText = m.score1 !== null ? `ðŸ“Š ${m.score1} - ${m.score2}` : '';
            const text = `ðŸ† ÙƒØ£Ø³ Ø§Ù„Ø¹Ø§Ù„Ù… 2026
${m.team1Ar} ðŸ†š ${m.team2Ar}
â° ${dm(m).date} - ${to12h(dm(m).time)} ${dm(m).label}
${scoreText}
ðŸ“ ${m.stadium}
ðŸ”— https://kora-yaser.web.app`;
            if (navigator.share) {
                navigator.share({ title: 'Ù…Ø¨Ø§Ø±Ø§Ø© ÙƒØ£Ø³ Ø§Ù„Ø¹Ø§Ù„Ù…', text });
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    if (btn) { btn.textContent = 'âœ…'; setTimeout(() => btn.textContent = 'ðŸ“¤', 2000); }
                }).catch(() => {});
            }
        }

        // === Source Rating (Report broken links) ===
        const REPORTS_KEY = 'kora_src_reports';

        function getSourceReports() {
            try { return JSON.parse(localStorage.getItem(REPORTS_KEY) || '{}'); } catch(e) { return {}; }
        }

        function reportSource(mi, sk) {
            const reports = getSourceReports();
            const key = mi + '-' + sk;
            reports[key] = (reports[key] || 0) + 1;
            localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
            return reports[key];
        }

        function getSourceReportCount(mi, sk) {
            const reports = getSourceReports();
            return reports[mi + '-' + sk] || 0;
        }

        function srcBtn(mi, sk, label, extraCls, extraSty) {
            const m = streamsData && streamsData[mi];
            const fmap = {'1':'src1_ok','2':'src2_ok','3':'src3_ok','4':'src4_ok','5':'src5_ok','m3u8':'m3u8_ok','m3u82':'m3u82_ok','m3u83':'m3u83_ok'};
            const f = fmap[sk];
            const ind = f && m && m[f] !== undefined ? (m[f] ? ' <span class="src-ok">âœ“</span>' : ' <span class="src-fail">âœ—</span>') : '';
            const btn = `<button class="stream-btn${extraCls ? ' ' + extraCls : ''}"${extraSty ? ' style="'+extraSty+'"' : ''} data-index="${mi}" data-source="${sk}">â–¶ ${label}${ind}</button>`;
            return `<div class="source-item">${btn}${reportBtnHtml(mi, sk)}</div>`;
        }

        function reportBtnHtml(mi, sk) {
            const c = getSourceReportCount(mi, sk);
            return `<button class="report-btn" onclick="event.stopPropagation();reportSourceClick(this,${mi},'${sk}')">ðŸš«${c > 0 ? ' ' + c : ''}</button>`;
        }

        function reportSourceClick(btn, mi, sk) {
            const count = reportSource(mi, sk);
            btn.textContent = 'ðŸš« ' + count;
            btn.classList.add('warn');
            showToast('âœ… ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø¨Ù„Ø§ØºÙƒ - ' + count + ' Ø¨Ù„Ø§Øº');
        }

        let showToastTimer;
        function showToast(msg) {
            const el = document.getElementById('toast');
            if (!el) return;
            el.textContent = msg;
            el.classList.add('show');
            clearTimeout(showToastTimer);
            showToastTimer = setTimeout(() => el.classList.remove('show'), 2200);
        }

        let activeSection = 'today';
        let activeGroupFilter = 'all';

        function switchSection(section) {
            activeSection = section;
            
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            const tab = document.getElementById('tab-' + section);
            if (tab) tab.classList.add('active');

            const subNav = document.getElementById('groupsSubNav');
            if (section === 'groups') {
                subNav.classList.add('show');
                buildGroupButtons();
                setGroupFilter(activeGroupFilter);
            } else {
                subNav.classList.remove('show');
                if (section === 'today') {
                    renderMatches(allMatches, 'today');
                } else if (section === 'stream') {
                    loadStreams();
                } else if (section === 'channels') {
                    loadChannels();
                }
            }
        }

        function buildGroupButtons() {
            const bar = document.getElementById('groupsBar');
            if (!bar) return;
            let html = `<button class="group-btn${activeGroupFilter === 'all' ? ' active' : ''}" onclick="setGroupFilter('all')">Ø§Ù„ÙƒÙ„</button>`;
            GROUPS.forEach(g => {
                const active = activeGroupFilter === g ? ' active' : '';
                html += `<button class="group-btn${active}" onclick="setGroupFilter('${g}')">${g}</button>`;
            });
            bar.innerHTML = html;
        }

        function setGroupFilter(group) {
            activeGroupFilter = group;
            document.querySelectorAll('.group-btn').forEach(btn => {
                const isMatch = btn.textContent === group || (group === 'all' && btn.textContent === 'Ø§Ù„ÙƒÙ„');
                btn.classList.toggle('active', isMatch);
            });
            renderMatches(allMatches, group);
        }

        function switchGroupSubTab(btn, tab) {
            const parent = btn.closest('.group-body');
            if (!parent) return;
            parent.querySelectorAll('.group-sub-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const contents = parent.querySelectorAll('.group-sub-content');
            const idx = tab === 'standings' ? 0 : contents.length - 1;
            contents.forEach((c, i) => c.classList.toggle('active', i === idx));
        }

        function toggleGroup(el) {
            el.classList.toggle('open');
            el.nextElementSibling.classList.toggle('open');
        }

        function renderLiveBar() {
            const bar = document.getElementById('liveBar');
            const container = document.getElementById('liveMatches');
            const info = document.getElementById('updateInfo');

            // Always clear updateInfo to prevent any stale banners from old cached code
            if (info && info.querySelector && info.querySelector('div')) {
                info.innerHTML = '';
            }

            const live = allMatches.filter(m => getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst) === 'ongoing');

            if (live.length === 0) {
                bar.classList.remove('has-live');
                container.innerHTML = '';
                return;
            }

            bar.classList.add('has-live');
            info.innerHTML = '';
            container.innerHTML = live.map(m => {
                const score = m.score1 !== null ? `${m.score1} - ${m.score2}` : '';
                return `<span class="live-match" onclick="switchSection('stream');document.getElementById('liveBar').scrollIntoView({behavior:'smooth'})">
                    <span class="flag-sm">${getFlag(m.team1En)}</span> ${m.team1Ar} ${m.team2Ar} <span class="flag-sm">${getFlag(m.team2En)}</span>
                    ${score ? `<span class="score-live">${score}</span>` : `<span class="score-live">âš½</span>`}
                </span>`;
            }).join('');
        }



        const TEAM_NAMES = {
            'Mexico':'Ø§Ù„Ù…ÙƒØ³ÙŠÙƒ','South Africa':'Ø¬Ù†ÙˆØ¨ Ø£ÙØ±ÙŠÙ‚ÙŠØ§','South Korea':'ÙƒÙˆØ±ÙŠØ§ Ø§Ù„Ø¬Ù†ÙˆØ¨ÙŠØ©',
            'Czech Republic':'Ø§Ù„ØªØ´ÙŠÙƒ','Canada':'ÙƒÙ†Ø¯Ø§','Bosnia & Herzegovina':'Ø§Ù„Ø¨ÙˆØ³Ù†Ø© ÙˆØ§Ù„Ù‡Ø±Ø³Ùƒ',
            'Qatar':'Ù‚Ø·Ø±','Switzerland':'Ø³ÙˆÙŠØ³Ø±Ø§','Brazil':'Ø§Ù„Ø¨Ø±Ø§Ø²ÙŠÙ„','Morocco':'Ø§Ù„Ù…ØºØ±Ø¨',
            'Haiti':'Ù‡Ø§ÙŠØªÙŠ','Scotland':'Ø§Ø³ÙƒØªÙ„Ù†Ø¯Ø§','USA':'Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ù…ØªØ­Ø¯Ø©','Paraguay':'Ø¨Ø§Ø±Ø§ØºÙˆØ§ÙŠ',
            'Australia':'Ø£Ø³ØªØ±Ø§Ù„ÙŠØ§','Turkey':'ØªØ±ÙƒÙŠØ§','Germany':'Ø£Ù„Ù…Ø§Ù†ÙŠØ§','CuraÃ§ao':'ÙƒÙˆØ±Ø§Ø³Ø§Ùˆ',
            'Ivory Coast':'Ø³Ø§Ø­Ù„ Ø§Ù„Ø¹Ø§Ø¬','Ecuador':'Ø§Ù„Ø¥ÙƒÙˆØ§Ø¯ÙˆØ±','Netherlands':'Ù‡ÙˆÙ„Ù†Ø¯Ø§','Japan':'Ø§Ù„ÙŠØ§Ø¨Ø§Ù†',
            'Sweden':'Ø§Ù„Ø³ÙˆÙŠØ¯','Tunisia':'ØªÙˆÙ†Ø³','Belgium':'Ø¨Ù„Ø¬ÙŠÙƒØ§','Egypt':'Ù…ØµØ±','Iran':'Ø¥ÙŠØ±Ø§Ù†',
            'New Zealand':'Ù†ÙŠÙˆØ²ÙŠÙ„Ù†Ø¯Ø§','Spain':'Ø¥Ø³Ø¨Ø§Ù†ÙŠØ§','Cape Verde':'Ø§Ù„Ø±Ø£Ø³ Ø§Ù„Ø£Ø®Ø¶Ø±',
            'Saudi Arabia':'Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©','Uruguay':'Ø£ÙˆØ±ÙˆØºÙˆØ§ÙŠ','France':'ÙØ±Ù†Ø³Ø§','Senegal':'Ø§Ù„Ø³Ù†ØºØ§Ù„',
            'Iraq':'Ø§Ù„Ø¹Ø±Ø§Ù‚','Norway':'Ø§Ù„Ù†Ø±ÙˆÙŠØ¬','Argentina':'Ø§Ù„Ø£Ø±Ø¬Ù†ØªÙŠÙ†','Algeria':'Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±',
            'Austria':'Ø§Ù„Ù†Ù…Ø³Ø§','Jordan':'Ø§Ù„Ø£Ø±Ø¯Ù†','Portugal':'Ø§Ù„Ø¨Ø±ØªØºØ§Ù„','DR Congo':'Ø§Ù„ÙƒÙˆÙ†ØºÙˆ Ø§Ù„Ø¯ÙŠÙ…Ù‚Ø±Ø§Ø·ÙŠØ©',
            'Uzbekistan':'Ø£ÙˆØ²Ø¨ÙƒØ³ØªØ§Ù†','Colombia':'ÙƒÙˆÙ„ÙˆÙ…Ø¨ÙŠØ§','England':'Ø¥Ù†Ø¬Ù„ØªØ±Ø§','Croatia':'ÙƒØ±ÙˆØ§ØªÙŠØ§',
            'Ghana':'ØºØ§Ù†Ø§','Panama':'Ø¨Ù†Ù…Ø§'
        };
        const STADIUM_NAMES = {
            'Mexico City':'Ù…ÙƒØ³ÙŠÙƒÙˆ Ø³ÙŠØªÙŠ','Guadalajara (Zapopan)':'ØºÙˆØ§Ø¯Ø§Ù„Ø§Ø®Ø§Ø±Ø§',
            'Toronto':'ØªÙˆØ±ÙˆÙ†ØªÙˆ','Los Angeles (Inglewood)':'Ù„ÙˆØ³ Ø£Ù†Ø¬Ù„ÙˆØ³','Vancouver':'ÙØ§Ù†ÙƒÙˆÙØ±',
            'Seattle':'Ø³ÙŠØ§ØªÙ„','New York/New Jersey (East Rutherford)':'Ù†ÙŠÙˆÙŠÙˆØ±Ùƒ','Boston (Foxborough)':'Ø¨ÙˆØ³Ø·Ù†',
            'Philadelphia':'ÙÙŠÙ„Ø§Ø¯Ù„ÙÙŠØ§','Atlanta':'Ø£ØªÙ„Ø§Ù†ØªØ§','Miami (Miami Gardens)':'Ù…ÙŠØ§Ù…ÙŠ',
            'Houston':'Ù‡ÙŠÙˆØ³ØªÙ†','Dallas (Arlington)':'Ø¯Ø§Ù„Ø§Ø³','Kansas City':'ÙƒØ§Ù†Ø³Ø§Ø³ Ø³ÙŠØªÙŠ',
            'Monterrey (Guadalupe)':'Ù…ÙˆÙ†ØªÙŠØ±ÙŠ','San Francisco Bay Area (Santa Clara)':'Ø³Ø§Ù† ÙØ±Ø§Ù†Ø³ÙŠØ³ÙƒÙˆ'
        };

        function astFromUtc(timeStr, dateStr) {
            if (!timeStr) return { time: '--:--', label: '--', date: dateStr };
            const parts = timeStr.match(/(\d+):(\d+)\s*UTC([+-]\d+)/);
            if (!parts) return { time: timeStr, label: '', date: dateStr };
            let h = parseInt(parts[1]), m = parseInt(parts[2]), offset = parseInt(parts[3]);
            let astH = h - offset + 3;
            let dayOffset = 0;
            if (astH >= 24) { astH -= 24; dayOffset = 1; }
            if (astH < 0) { astH += 24; dayOffset = -1; }
            const lbl = astH >= 0 && astH < 5 ? 'ÙØ¬Ø±Ù‹Ø§' : astH < 12 ? 'ØµØ¨Ø§Ø­Ù‹Ø§' : astH < 13 ? 'Ø¸Ù‡Ø±Ù‹Ø§' : astH < 17 ? 'Ø¨Ø¹Ø¯ Ø§Ù„Ø¸Ù‡Ø±' : astH < 21 ? 'Ù…Ø³Ø§Ø¡Ù‹' : 'Ù„ÙŠÙ„Ø§Ù‹';
            
            let astDate = dateStr;
            if (dayOffset !== 0 && dateStr) {
                const dp = dateStr.split('-').map(Number);
                const d = new Date(Date.UTC(dp[0], dp[1]-1, dp[2] + dayOffset));
                astDate = d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0');
            }
            return { time: String(astH).padStart(2,'0') + ':' + String(m).padStart(2,'0'), label: lbl, date: astDate };
        }

        function isKnockoutSlot(name) {
            return name.startsWith('W') || name.startsWith('L') || name.match(/^\d/);
        }

        function parseOpenfootball(data) {
            const matches = [];
            data.matches.forEach((m, i) => {
                if (isKnockoutSlot(m.team1) || isKnockoutSlot(m.team2)) return;
                const ast = astFromUtc(m.time, m.date);
                const score = m.score && m.score.ft ? m.score.ft : null;
                matches.push({
                    id: i + 1,
                    date: m.date,
                    dateAst: ast.date,
                    timeAst: ast.time,
                    timeLabel: ast.label,
                    team1Ar: TEAM_NAMES[m.team1] || m.team1,
                    team2Ar: TEAM_NAMES[m.team2] || m.team2,
                    team1En: m.team1,
                    team2En: m.team2,
                    score1: score ? score[0] : null,
                    score2: score ? score[1] : null,
                    group: (m.group || '').replace('Group ', ''),
                    stadium: STADIUM_NAMES[m.ground] || m.ground || ''
                });
            });
            return matches;
        }

        async function loadData() {
            const info = document.getElementById('updateInfo');
            const content = document.getElementById('content');

            try {
                info.textContent = 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª (Ù…ØµØ¯Ø± Ù…Ø¨Ø§Ø´Ø±)...';
                const resp = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json?t=' + Date.now());
                if (resp.ok) {
                    const data = await resp.json();
                    allMatches = parseOpenfootball(data);
                    info.textContent = `âœ… Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ø­Ø¯Ø«`;
                    switchSection('today');
                    renderLiveBar();
                    return;
                }
            } catch (e) {
                console.log('Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ù…Ø¨Ø§Ø´Ø± ØºÙŠØ± Ù…ØªØ§Ø­ØŒ Ù†Ø­Ø§ÙˆÙ„ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø­Ù„ÙŠ...');
            }

            try {
                info.textContent = 'Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø­Ù„ÙŠ...';
                const resp = await fetch('./matches.json?t=' + Date.now());
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const data = await resp.json();
                allMatches = data.matches;
                
                allMatches.forEach(m => {
                    if (!m.dateAst && m.timeAst) {
                        if (m.timeAst < '06:00') {
                            const dp = m.date.split('-').map(Number);
                            const d = new Date(Date.UTC(dp[0], dp[1]-1, dp[2] + 1));
                            m.dateAst = d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0');
                        } else {
                            m.dateAst = m.date;
                        }
                    } else if (!m.dateAst) {
                        m.dateAst = m.date;
                    }
                });

                const updated = new Date(data.lastUpdated);
                info.textContent = `âœ… Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ø­Ø¯Ø«`;
                switchSection('today');
                renderLiveBar();
            } catch (err) {
                console.error(err);
                content.innerHTML = `
                    <div class="error-msg">
                        âŒ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª: ${err.message}
                        <br>
                        <button class="retry-btn" onclick="loadData()">Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©</button>
                    </div>`;
                info.textContent = 'âŒ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ØºÙŠØ± Ù…Ø­Ø¯Ø«';
            }
        }

        let streamsData = [];

        async function loadStreams() {
            const content = document.getElementById('content');
            const info = document.getElementById('updateInfo');
            content.innerHTML = `<div class="loading"><div class="spinner"></div><div>Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø©...</div></div>`;

            try {
                const resp = await fetch('./streams.json?t=' + Date.now());
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const data = await resp.json();
                const updated = new Date(data.lastUpdated);
                streamsData = data.matches;
                
                // Force stale live matches to 'finished' based on time
                const now = new Date();
                streamsData.forEach(m => {
                    if (m.status === 'live' && m.time) {
                        try {
                            let h = 0, min = 0;
                            // Parse "02:00 AM" or "14:00"
                            if (m.time.toLowerCase().includes('am') || m.time.toLowerCase().includes('pm')) {
                                const parts = m.time.split(/:|\s/);
                                h = parseInt(parts[0]);
                                min = parseInt(parts[1]);
                                if (m.time.toLowerCase().includes('pm') && h !== 12) h += 12;
                                if (m.time.toLowerCase().includes('am') && h === 12) h = 0;
                            } else {
                                const parts = m.time.split(':');
                                h = parseInt(parts[0]);
                                min = parseInt(parts[1]);
                            }
                            
                            const matchDate = new Date();
                            matchDate.setHours(h, min, 0, 0);
                            
                            // If the time parsed is in the future (e.g. 23:00 but now is 01:00 AM), it might be from yesterday.
                            // We assume streams are either today or yesterday.
                            if (now < matchDate && (matchDate - now) > 12 * 60 * 60 * 1000) {
                                matchDate.setDate(matchDate.getDate() - 1);
                            }
                            
                            const diffMinutes = (now - matchDate) / 1000 / 60;
                            if (diffMinutes >= 125) {
                                m.status = 'finished';
                            }
                        } catch(e) {}
                    }
                });

                info.innerHTML = '';
                renderStreams(streamsData);
            } catch (err) {
                content.innerHTML = `
                    <div class="error-msg">
                        âŒ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø©: ${err.message}
                        <br>
                        <button class="retry-btn" onclick="loadStreams()">Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©</button>
                    </div>`;
                info.textContent = 'âš ï¸ ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø¨Ø«';
            }
        }

        function renderStreams(matches) {
            const content = document.getElementById('content');

            if (!matches || matches.length === 0) {
                content.innerHTML = `<div style="text-align:center;padding:40px;color:#666;">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¨Ø§Ø±ÙŠØ§Øª Ù…ØªØ§Ø­Ø© Ù„Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© Ø­Ø§Ù„ÙŠØ§Ù‹</div>`;
                return;
            }

            let html = `<div class="group-section">`;
            html += `<div class="group-header">`;
            html += `<span>ðŸ“º Ø±ÙˆØ§Ø¨Ø· Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª</span>`;
            html += `<span class="count">${matches.length} Ù…Ø¨Ø§Ø±Ø§Ø©</span>`;
            html += `</div>`;
            html += `<div class="stream-grid">`;

            matches.forEach((m, idx) => {
                const statusClass = m.status === 'live' ? 'ongoing' : m.status === 'finished' ? 'finished' : 'upcoming';
                const statusMap = { live: 'âš¡ Ù…Ø¨Ø§Ø´Ø±', coming: 'â³ Ø¨Ø¹Ø¯ Ù‚Ù„ÙŠÙ„', upcoming: 'ðŸ”œ Ù‚Ø§Ø¯Ù…Ø©' };
                const scoreDisplay = (m.score1 !== undefined && m.score1 !== null && m.score2 !== undefined && m.score2 !== null) ? `${m.score1} - ${m.score2}` : '';

                html += `
                    <div class="stream-card ${m.status === 'live' ? 'live' : ''}">
                        <img src="${m.logo1 || ''}" alt="" class="team-logo" onerror="this.style.display='none'">
                        <div class="team-name left">${m.team1}</div>
                        <div class="score-box">
                            ${scoreDisplay ? `<div class="score">${scoreDisplay}</div>` : ''}
                            <div class="time">${m.time || ''}</div>
                        </div>
                        <div class="team-name right">${m.team2}</div>
                        <img src="${m.logo2 || ''}" alt="" class="team-logo" onerror="this.style.display='none'">
                        <div class="actions">
                            <span class="status-badge ${statusClass}">${statusMap[m.status] || m.statusText}</span>
                            ${m.channel ? `<span class="channel">ðŸ“¡ ${m.channel}</span>` : ''}
                            <div class="source-btns">
                                ${m.embedUrl ? srcBtn(idx, '1', 'Ø§Ù„Ù…ØµØ¯Ø± 1', '', '') : ''}
                                ${m.embedUrl2 ? srcBtn(idx, '2', 'Ø§Ù„Ù…ØµØ¯Ø± 2', 'alt-source', 'background:linear-gradient(135deg,#1976D2,#1565C0)') : ''}
                                ${m.embedUrl3 ? srcBtn(idx, '3', 'Ø§Ù„Ù…ØµØ¯Ø± 3', 'alt-source', 'background:linear-gradient(135deg,#388E3C,#2E7D32)') : ''}
                                ${m.embedUrl4 ? srcBtn(idx, '4', 'Ø§Ù„Ù…ØµØ¯Ø± 4', 'alt-source', 'background:linear-gradient(135deg,#7B1FA2,#6A1B9A)') : ''}
                                ${m.embedUrl5 ? srcBtn(idx, '5', 'Ø§Ù„Ù…ØµØ¯Ø± 5', 'alt-source', 'background:linear-gradient(135deg,#E65100,#BF360C)') : ''}
                                ${m.m3u8 ? srcBtn(idx, 'm3u8', 'HLS 1', 'm3u8-source', '') : ''}
                                ${m.m3u82 ? srcBtn(idx, 'm3u82', 'HLS 2', 'm3u8-source', 'background:linear-gradient(135deg,#00695C,#004D40)!important') : ''}
                                ${m.m3u83 ? srcBtn(idx, 'm3u83', 'HLS 3', 'm3u8-source', 'background:linear-gradient(135deg,#4E342E,#3E2723)!important') : ''}
                            </div>
                        </div>
                    </div>`;
            });

            html += `</div></div>`;
            html += `<div style="text-align:center;color:#555;font-size:clamp(10px,0.8vw,13px);margin-top:10px;">Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø¨Ø¹Ø¶ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ù„Ø§ ØªØ¹Ù…Ù„ Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ø¨Ø¹Ø¯ Ø§Ø³ØªØ®Ø¯Ø§Ù… VPN</div>`;
            content.innerHTML = html;
        }

        // === Channels Tab ===
        async function loadChannels() {
            const content = document.getElementById('content');
            const info = document.getElementById('updateInfo');
            content.innerHTML = `<div class="loading"><div class="spinner"></div><div>Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù‚Ù†ÙˆØ§Øª...</div></div>`;

            try {
                const resp = await fetch('./streams.json?t=' + Date.now());
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const data = await resp.json();
                streamsData = data.matches;
                info.innerHTML = '';
                renderChannels(streamsData);
            } catch (err) {
                content.innerHTML = `<div class="error-msg">âŒ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù‚Ù†ÙˆØ§Øª: ${err.message}</div>`;
            }
        }

        function renderChannels(matches) {
            const content = document.getElementById('content');
            if (!matches || matches.length === 0) {
                content.innerHTML = `<div style="text-align:center;padding:40px;color:#666;">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù‚Ù†ÙˆØ§Øª Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹</div>`;
                return;
            }

            // Group sources by channel
            const channelMap = {};
            matches.forEach((m, idx) => {
                if (!m.channel) return;
                const ch = m.channel;
                if (!channelMap[ch]) channelMap[ch] = { channel: ch, matchIdx: idx, match: m };
            });

            let html = `<div class="group-section">`;
            html += `<div class="group-header"><span>ðŸ“¡ Ø§Ù„Ù‚Ù†ÙˆØ§Øª Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©</span><span class="count">${Object.keys(channelMap).length} Ù‚Ù†Ø§Ø©</span></div>`;

            Object.values(channelMap).forEach(ch => {
                const m = ch.match;
                const idx = ch.matchIdx;
                html += `<div class="stream-card channel-card">
                    <div class="channel-title">ðŸ“¡ ${ch.channel}</div>
                    <div style="font-size:12px;color:#999;margin-bottom:8px;text-align:center;">${m.team1} vs ${m.team2}</div>
                    <div class="actions">
                        <div class="source-btns">
                            ${m.embedUrl ? srcBtn(idx, '1', '1', '', '') : ''}
                            ${m.embedUrl2 ? srcBtn(idx, '2', '2', 'alt-source', 'background:linear-gradient(135deg,#1976D2,#1565C0)') : ''}
                            ${m.embedUrl3 ? srcBtn(idx, '3', '3', 'alt-source', 'background:linear-gradient(135deg,#388E3C,#2E7D32)') : ''}
                            ${m.embedUrl4 ? srcBtn(idx, '4', '4', 'alt-source', 'background:linear-gradient(135deg,#7B1FA2,#6A1B9A)') : ''}
                            ${m.embedUrl5 ? srcBtn(idx, '5', '5', 'alt-source', 'background:linear-gradient(135deg,#E65100,#BF360C)') : ''}
                            ${m.m3u8 ? srcBtn(idx, 'm3u8', 'H1', 'm3u8-source', '') : ''}
                            ${m.m3u82 ? srcBtn(idx, 'm3u82', 'H2', 'm3u8-source', 'background:linear-gradient(135deg,#00695C,#004D40)!important') : ''}
                            ${m.m3u83 ? srcBtn(idx, 'm3u83', 'H3', 'm3u8-source', 'background:linear-gradient(135deg,#4E342E,#3E2723)!important') : ''}
                        </div>
                    </div>
                </div>`;
            });

            html += `</div>`;
            html += `<div style="text-align:center;color:#555;font-size:clamp(10px,0.8vw,13px);margin-top:10px;">Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ØµØ§Ø¯Ø± Ù…Ù† Ø®ÙˆØ§Ø¯Ù… Ù…ØªØ¹Ø¯Ø¯Ø© - Ø§Ø®ØªØ± Ø§Ù„Ø£Ù†Ø³Ø¨ Ù„Ùƒ</div>`;
            content.innerHTML = html;
        }

        let hlsInstance = null;

        function openStream(title, url, channel) {
            const iframe = document.getElementById('modalPlayer');
            const video = document.getElementById('modalVideo');
            iframe.style.display = 'none';
            video.style.display = 'none';
            if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }

            if (!url && channel) {
                const map = {
                    'max1': 'https://tops.poiy.online/albaplayer/max1/',
                    'max2': 'https://tops.poiy.online/albaplayer/max2/',
                    'max3': 'https://tops.poiy.online/albaplayer/max3/',
                    'max4': 'https://tops.poiy.online/albaplayer/max4/',
                    'max5': 'https://tops.poiy.online/albaplayer/max5/',
                    'max6': 'https://tops.poiy.online/albaplayer/max6/',
                    'max7': 'https://tops.poiy.online/albaplayer/max7/',
                    'max8': 'https://tops.poiy.online/albaplayer/max8/'
                };
                const lower = channel.toLowerCase();
                for (const [key, val] of Object.entries(map)) {
                    if (lower.includes(key)) { url = val; break; }
                }
            }

            // Detect if it's an m3u8 URL
            if (url && url.includes('.m3u8')) {
                video.style.display = 'block';
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hlsInstance = hls;
                    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.addEventListener('loadedmetadata', () => video.play().catch(() => {}));
                } else {
                    video.style.display = 'none';
                    iframe.style.display = 'block';
                    iframe.src = url;
                }
            } else {
                iframe.style.display = 'block';
                iframe.src = url || '';
            }

            document.getElementById('modalTitle').textContent = 'ðŸ“º ' + title;
            document.getElementById('streamModal').classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeStream() {
            if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
            const video = document.getElementById('modalVideo');
            video.pause();
            video.src = '';
            video.style.display = 'none';
            document.getElementById('modalPlayer').src = '';
            document.getElementById('modalPlayer').style.display = 'block';
            document.getElementById('streamModal').classList.remove('open');
            document.body.style.overflow = '';
        }

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.stream-btn');
            if (btn) {
                const idx = parseInt(btn.dataset.index);
                const source = btn.dataset.source;
                const m = streamsData[idx];
                if (m) {
                    let url = m.embedUrl || '';
                    const sourceMap = {
                        '1': 'embedUrl',
                        '2': 'embedUrl2',
                        '3': 'embedUrl3',
                        '4': 'embedUrl4',
                        '5': 'embedUrl5',
                        'm3u8': 'm3u8',
                        'm3u82': 'm3u82',
                        'm3u83': 'm3u83'
                    };
                    const key = sourceMap[source];
                    if (key && m[key]) url = m[key];
                    openStream(m.team1 + ' vs ' + m.team2, url || '', m.channel);
                }
            }
            if (e.target.closest('#streamModal') && !e.target.closest('.modal-content')) {
                closeStream();
            }
        });

        // === Theme toggle ===
        const THEME_KEY = 'kora_theme';

        function applyTheme() {
            const saved = localStorage.getItem(THEME_KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isLight = saved === 'light' || (!saved && !prefersDark);
            document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
            document.getElementById('themeBtn').textContent = isLight ? 'â˜€ï¸' : 'ðŸŒ™';
        }

        function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem(THEME_KEY, next);
            document.getElementById('themeBtn').textContent = next === 'light' ? 'â˜€ï¸' : 'ðŸŒ™';
        }

        // === Timezone picker ===
        function toggleTzPicker() {
            const overlay = document.getElementById('tzOverlay');
            const open = overlay.classList.contains('open');
            if (!open) renderTzList();
            overlay.classList.toggle('open');
            document.body.style.overflow = open ? '' : 'hidden';
        }

        function closeTzPicker() {
            document.getElementById('tzOverlay').classList.remove('open');
            document.body.style.overflow = '';
        }

        function renderTzList() {
            const list = document.getElementById('tzList');
            const current = getUserTz();
            list.innerHTML = TZ_LIST.map((tz, i) => {
                const active = tz.city === current.city && tz.offset === current.offset;
                const sign = tz.offset >= 0 ? '+' : '';
                return `<button class="tz-item${active ? ' active' : ''}" onclick="selectTz(${i})">
                    ${tz.label}
                    <span class="tz-offset">UTC${sign}${tz.offset / 60}</span>
                </button>`;
            }).join('');
        }

        function selectTz(index) {
            const tz = TZ_LIST[index];
            saveUserTz(tz);
            clearDmCache();
            closeTzPicker();
            // Refresh all sections
            if (activeSection === 'today') renderMatches(allMatches, 'today');
            else if (activeSection === 'groups') renderMatches(allMatches, activeGroupFilter);
            updateClock();
            renderLiveBar();
            showToast('âœ… ØªÙ… ØªØºÙŠÙŠØ± Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ© Ø¥Ù„Ù‰ ' + tz.label.split(' ').slice(1).join(' '));
        }

        // Close tz picker on overlay click
        document.addEventListener('click', function(e) {
            if (e.target.closest('#tzOverlay') && !e.target.closest('.tz-modal')) {
                closeTzPicker();
            }
        });

        applyTheme();

        setInterval(updateClock, 1000);
        setInterval(renderLiveBar, 15000);
        setInterval(updateCountdowns, 60000);
        setInterval(checkNotifications, 60000);
        updateClock();
        updateCountdowns();
        checkNotifications();
        loadData();
        setInterval(loadData, 300000);

        // === PWA: Service Worker Registration ===
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('âœ… SW registered:', reg.scope))
                    .catch(err => console.log('âŒ SW registration failed:', err));
            });
        }

        // === PWA: Install Prompt ===
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Show install banner if not dismissed before
            if (!localStorage.getItem('pwa-install-dismissed')) {
                setTimeout(() => {
                    document.getElementById('installBanner').classList.add('show');
                }, 3000);
            }
        });

        document.getElementById('installBtn').addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('Install outcome:', outcome);
            deferredPrompt = null;
            document.getElementById('installBanner').classList.remove('show');
        });

        document.getElementById('installDismiss').addEventListener('click', () => {
            document.getElementById('installBanner').classList.remove('show');
            localStorage.setItem('pwa-install-dismissed', '1');
        });

        window.addEventListener('appinstalled', () => {
            document.getElementById('installBanner').classList.remove('show');
            deferredPrompt = null;
            console.log('âœ… App installed');
        });
    
