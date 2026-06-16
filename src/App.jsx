import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getUserTz, saveUserTz, getTodayStr, dm, clearDmCache, to12h, getStatus,
    isToday, todayMatches, countdownText, getGroupStandings, getFlag, formatDate,
    parseOpenfootball, getStatusText, getFavorites, isFavorite, toggleFavorite,
    getNotifyMin, setNotifyMin, getNotifiedIds, markNotified, requestNotifyPerm,
    getSourceReportCount, reportSource,
    renderStandingsHtml, renderStandingsCards, srcBtnHtml,
    getTheme, setTheme, toggleThemeValue, shareMatchData,
    TEAM_NAMES, STADIUM_NAMES, TZ_LIST, GROUPS, GROUP_NAMES,
    setAllMatches, getAllMatches
} from './utils.js';

export default function App() {
    const [tz, setTzState] = useState(getUserTz);
    const [theme, setThemeState] = useState(getTheme);
    const [activeSection, setActiveSection] = useState('today');
    const [activeGroupFilter, setActiveGroupFilter] = useState('all');
    const [streamsData, setStreamsData] = useState([]);
    const [tzOpen, setTzOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);
    const contentRef = useRef(null);
    const toastTimer = useRef(null);
    const hlsInstance = useRef(null);
    const currentStreamRef = useRef({ idx: -1, match: null });
    const [visitorCount, setVisitorCount] = useState(null);
    const [channelsData, setChannelsData] = useState([]);
    const [fsOverlay, setFsOverlay] = useState(false);
    const [chPage, setChPage] = useState(0);
    const CH_PER_PAGE = 50;

    const setTz = useCallback((newTz) => { setTzState(newTz); saveUserTz(newTz); clearDmCache(); }, []);
    const toggleTheme = useCallback(() => { const next = toggleThemeValue(theme); setThemeState(next); setTheme(next); }, [theme]);
    const showToast = useCallback((msg) => {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg; el.classList.add('show');
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => el.classList.remove('show'), 2200);
    }, []);
    const renderContent = useCallback((html) => { if (contentRef.current) contentRef.current.innerHTML = html; }, []);

    // === Pure render helpers (no deps on other callbacks) ===
    const updateCountdowns = useCallback(() => {
        document.querySelectorAll('.countdown').forEach(el => {
            el.textContent = countdownText(el.dataset.date, el.dataset.time);
        });
    }, []);

    const renderStreams = useCallback((sd) => {
        if (!sd || !sd.length) { renderContent(`<div style="text-align:center;padding:40px;color:#666;">لا توجد مباريات متاحة للمشاهدة حالياً</div>`); return; }
        const srcKeys = ['embedUrl','embedUrl2','embedUrl3','embedUrl4','embedUrl5','m3u8','m3u82','m3u83'];
        const btnKeys = ['1','2','3','4','5','m3u8','m3u82','m3u83'];
        const labels = ['المصدر 1','المصدر 2','المصدر 3','المصدر 4','المصدر 5','HLS 1','HLS 2','HLS 3'];
        const cls = ['','alt-source','alt-source','alt-source','alt-source','m3u8-source','m3u8-source','m3u8-source'];
        const styl = ['','background:linear-gradient(135deg,#1976D2,#1565C0)','background:linear-gradient(135deg,#388E3C,#2E7D32)','background:linear-gradient(135deg,#7B1FA2,#6A1B9A)','background:linear-gradient(135deg,#E65100,#BF360C)','','background:linear-gradient(135deg,#00695C,#004D40)!important','background:linear-gradient(135deg,#4E342E,#3E2723)!important'];
        const renderCard = (m, idx) => {
            const st = m.status === 'live' ? 'ongoing' : m.status === 'finished' ? 'finished' : 'upcoming';
            const sm = { live:'⚡ مباشر', coming:'⏳ بعد قليل', upcoming:'🔜 قادمة' };
            const sc = (m.score1!=null && m.score2!=null) ? `${m.score1} - ${m.score2}` : '';
            let c = `<div class="stream-card ${m.status==='live'?'live':''}"><img src="${m.logo1||''}" alt="" class="team-logo" onerror="this.style.display='none'"><div class="team-name left">${m.team1}</div><div class="score-box">${sc?`<div class="score">${sc}</div>`:''}<div class="time">${m.time||''}</div></div><div class="team-name right">${m.team2}</div><img src="${m.logo2||''}" alt="" class="team-logo" onerror="this.style.display='none'"><div class="actions"><span class="status-badge ${st}">${sm[m.status]||m.statusText}</span>${m.channel?`<span class="channel">📡 ${m.channel}</span>`:''}<div class="source-btns">`;
            srcKeys.forEach((k, i) => { if (m[k]) c += srcBtnHtml(idx, btnKeys[i], labels[i], cls[i], styl[i], sd); });
            c += `</div></div></div>`;
            return c;
        };
        let html = '';
        const hasLive = sd.some(m => m.status === 'live');
        if (hasLive) {
            html += `<div class="group-section"><div class="group-header open" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span>🔴 مباشر الآن</span><span class="count">${sd.filter(m=>m.status==='live').length} مباراة</span><span class="toggle-icon">▶</span></div><div class="group-body open"><div class="stream-grid">`;
            sd.forEach((m, idx) => { if (m.status === 'live') html += renderCard(m, idx); });
            html += `</div></div></div>`;
        }
        const hasUpcoming = sd.some(m => m.status !== 'live');
        if (hasUpcoming) {
            html += `<div class="group-section"><div class="group-header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span>⏳ المباريات القادمة</span><span class="count">${sd.filter(m=>m.status!=='live').length} مباراة</span><span class="toggle-icon">▶</span></div><div class="group-body"><div class="stream-grid">`;
            sd.forEach((m, idx) => { if (m.status !== 'live') html += renderCard(m, idx); });
            html += `</div></div></div>`;
        }
        html += `<div style="text-align:center;color:#555;font-size:clamp(10px,0.8vw,13px);margin-top:10px;">إذا كانت بعض الروابط لا تعمل أعد المحاولة بعد استخدام VPN</div>`;
        renderContent(html);
    }, [renderContent]);

    const renderChannels = useCallback((sd, chData) => {
        if ((!sd || !sd.length) && (!chData || !chData.length)) { renderContent(`<div style="text-align:center;padding:40px;color:#666;">لا توجد قنوات متاحة حالياً</div>`); return; }
        let html = '';
        // Match-based channels
        if (sd && sd.length) {
            const cm = {};
            sd.forEach((m, idx) => { if (m.channel && !cm[m.channel]) cm[m.channel] = { match:m, idx, ch:m.channel }; });
            const srcKeys = ['embedUrl','embedUrl2','embedUrl3','embedUrl4','embedUrl5','m3u8','m3u82','m3u83'];
            const btnKeys = ['1','2','3','4','5','m3u8','m3u82','m3u83'];
            const labels = ['1','2','3','4','5','H1','H2','H3'];
            const cls = ['','alt-source','alt-source','alt-source','alt-source','m3u8-source','m3u8-source','m3u8-source'];
            const styl = ['','background:linear-gradient(135deg,#1976D2,#1565C0)','background:linear-gradient(135deg,#388E3C,#2E7D32)','background:linear-gradient(135deg,#7B1FA2,#6A1B9A)','background:linear-gradient(135deg,#E65100,#BF360C)','','background:linear-gradient(135deg,#00695C,#004D40)!important','background:linear-gradient(135deg,#4E342E,#3E2723)!important'];
            html += `<div class="group-section"><div class="group-header"><span>📡 قنوات المباريات</span><span class="count">${Object.keys(cm).length} قناة</span></div>`;
            Object.values(cm).forEach(c => {
                html += `<div class="stream-card channel-card"><div class="channel-title">📡 ${c.ch}</div><div style="font-size:12px;color:#999;margin-bottom:8px;text-align:center;">${c.match.team1} vs ${c.match.team2}</div><div class="actions"><div class="source-btns">`;
                srcKeys.forEach((k, i) => { if (c.match[k]) html += srcBtnHtml(c.idx, btnKeys[i], labels[i], cls[i], styl[i], sd); });
                html += `</div></div></div>`;
            });
            html += `</div>`;
        }
        // TV channels from channels.json
        if (chData && chData.length) {
            const totalPages = Math.ceil(chData.length / CH_PER_PAGE);
            const start = chPage * CH_PER_PAGE;
            const pageChs = chData.slice(start, start + CH_PER_PAGE);
            html += `<div class="group-section"><div class="group-header open"><span>📺 القنوات العربية</span><span class="count">${chData.length} قناة</span><span class="toggle-icon">▶</span></div><div class="group-body open" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;padding:10px;">`;
            pageChs.forEach((ch, i) => {
                const logo = ch.logo || '';
                html += `<div class="channel-card" style="cursor:pointer;text-align:center;background:rgba(255,255,255,0.03);border-radius:10px;padding:10px;transition:transform .2s;" onclick="window.__playChannel(${start + i})"><img src="${logo}" alt="${ch.ch}" style="width:70px;height:70px;object-fit:contain;border-radius:8px;margin-bottom:6px;" onerror="this.style.display='none'"><div style="font-size:12px;color:#ccc;line-height:1.3;">${ch.ch}</div></div>`;
            });
            html += `</div>`;
            // Pagination
            if (totalPages > 1) {
                html += `<div style="display:flex;gap:8px;justify-content:center;padding:10px;">`;
                if (chPage > 0) html += `<button class="stream-btn" style="padding:6px 16px;font-size:13px;" onclick="document.getElementById('content').scrollIntoView();window.__chPage(${chPage - 1})">⬅ السابق</button>`;
                html += `<span style="color:#90a4ae;font-size:13px;padding:6px;">${chPage + 1} / ${totalPages}</span>`;
                if (chPage < totalPages - 1) html += `<button class="stream-btn" style="padding:6px 16px;font-size:13px;" onclick="document.getElementById('content').scrollIntoView();window.__chPage(${chPage + 1})">التالي ➡</button>`;
                html += `</div>`;
            }
            html += `</div>`;
        }
        html += `<div style="text-align:center;color:#555;font-size:clamp(10px,0.8vw,13px);margin-top:10px;">جميع المصادر من خوادم متعددة - اختر الأنسب لك</div>`;
        renderContent(html);
    }, [renderContent, chPage]);

    // === Live Bar ===
    const renderLiveBar = useCallback(() => {
        const bar = document.getElementById('liveBar');
        const list = document.getElementById('liveMatches');
        const info = document.getElementById('updateInfo');
        if (!bar || !list) return;
        const live = getAllMatches().filter(m => m.status === 'live' || getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst) === 'ongoing');
        if (live.length > 0) {
            bar.classList.add('has-live');
            list.innerHTML = live.map(m => `<a class="live-match" onclick="window.__goToStream()"><span class="flag-sm">${getFlag(m.team1)}</span><span class="score-live">${m.score1||0}-${m.score2||0}</span><span class="flag-sm">${getFlag(m.team2)}</span></a>`).join('');
        } else { bar.classList.remove('has-live'); }
        if (info) { const tz = getUserTz(); info.innerHTML = `<span>🕐 بتوقيت ${tz.city} | ${getTodayStr()}</span>`; }
    }, []);

    // === Data loaders (depend on render helpers above) ===
    const loadStreams = useCallback(async () => {
        renderContent(`<div class="loading"><div class="spinner"></div><div>جارٍ تحميل روابط المشاهدة...</div></div>`);
        try {
            const resp = await fetch('./streams.json?t=' + Date.now());
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            const sd = data.matches;
            const now = new Date();
            sd.forEach(m => {
                if (m.status === 'live' && m.time) {
                    try {
                        let h = 0, min = 0;
                        if (m.time.toLowerCase().includes('am') || m.time.toLowerCase().includes('pm')) {
                            const parts = m.time.split(/:|\s/);
                            h = parseInt(parts[0]); min = parseInt(parts[1]);
                            if (m.time.toLowerCase().includes('pm') && h !== 12) h += 12;
                            if (m.time.toLowerCase().includes('am') && h === 12) h = 0;
                        } else { const parts = m.time.split(':'); h = parseInt(parts[0]); min = parseInt(parts[1]); }
                        const md = new Date(); md.setHours(h, min, 0, 0);
                        if (now < md && (md - now) > 12*60*60*1000) md.setDate(md.getDate() - 1);
                        if ((now - md)/60000 >= 125) m.status = 'finished';
                    } catch(e) {}
                }
            });
            setStreamsData(sd);
            renderStreams(sd);
            const info = document.getElementById('updateInfo');
            if (info) info.innerHTML = `<span>📺 آخر تحديث للروابط: ${new Date(data.lastUpdated).toLocaleString('ar-SA')}</span>`;
        } catch (err) {
            renderContent(`<div class="error-msg">❌ فشل تحميل روابط المشاهدة: ${err.message}<br><button class="retry-btn" onclick="window.__retryStreams()">إعادة المحاولة</button></div>`);
        }
    }, [renderContent, renderStreams]);

    const loadChannels = useCallback(async () => {
        renderContent(`<div class="loading"><div class="spinner"></div><div>جارٍ تحميل القنوات...</div></div>`);
        try {
            const [streamResp, chResp] = await Promise.all([
                fetch('./streams.json?t=' + Date.now()),
                fetch('./channels.json?t=' + Date.now())
            ]);
            if (!streamResp.ok) throw new Error('HTTP ' + streamResp.status);
            const streamData = await streamResp.json();
            const chData = chResp.ok ? await chResp.json() : [];
            setStreamsData(streamData.matches);
            setChannelsData(chData);
            setChPage(0);
            renderChannels(streamData.matches, chData);
        } catch (err) { renderContent(`<div class="error-msg">❌ فشل تحميل القنوات: ${err.message}</div>`); }
    }, [renderContent, renderChannels]);

    const buildGroupButtons = useCallback(() => {
        const bar = document.getElementById('groupsBar');
        if (!bar) return;
        bar.innerHTML = `<button class="group-btn${activeGroupFilter==='all'?' active':''}" onclick="window.__setGroupFilter('all')">الكل</button>` +
            GROUPS.map(g => `<button class="group-btn${activeGroupFilter===g?' active':''}" onclick="window.__setGroupFilter('${g}')">${g}</button>`).join('');
    }, [activeGroupFilter]);

    const renderMatches = useCallback((allMs, filter) => {
        const filtered = filter === 'today' ? todayMatches(allMs) : filter === 'all' ? allMs : allMs.filter(m => m.group === filter);
        if (filtered.length === 0 && filter === 'today') {
            const next = allMs.filter(m => getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst) === 'upcoming')[0];
            let h = `<div class="group-section"><div class="group-header"><span>📅 ${getTodayStr()}</span></div><div style="text-align:center;padding:30px;color:#607d8b;">لا توجد مباريات اليوم</div>`;
            if (next) { const d = dm(next); h += `<div style="text-align:center;padding:10px 20px 30px;border-top:1px solid rgba(255,255,255,0.05);"><div style="color:#90a4ae;font-size:13px;margin-bottom:8px;">المباراة القادمة</div><div style="font-weight:700;font-size:18px;">${getFlag(next.team1)} ${TEAM_NAMES[next.team1]||next.team1} - ${TEAM_NAMES[next.team2]||next.team2} ${getFlag(next.team2)}</div><div style="color:#64b5f6;font-size:14px;margin-top:6px;">${d.time} ${d.date}</div></div>`; }
            h += `</div>`; renderContent(h); return;
        }
        if (filtered.length === 0) { renderContent(`<div style="text-align:center;padding:40px;color:#607d8b;">لا توجد مباريات في هذه المجموعة</div>`); return; }
        const favs = getFavorites(); const todayStr = getTodayStr();
        let html = '';

        if (filter === 'today') {
            const grouped = {}; filtered.forEach(m => { const d = dm(m); const k = d.date; if (!grouped[k]) grouped[k] = []; grouped[k].push(m); });
            const sortedDates = Object.keys(grouped).sort();
            const favMatches = filtered.filter(m => favs.includes(m.team1) || favs.includes(m.team2));
            if (favMatches.length > 0) {
                html += `<div class="group-section fav-section"><div class="group-header open"><span>⭐ مبارياتي</span><span class="count">${favMatches.length}</span></div><div class="group-body open"><table><thead><tr><th>#</th><th>المباراة</th><th>التوقيت</th><th>الحالة</th><th>الملعب</th><th>⭐</th></tr></thead><tbody>`;
                favMatches.forEach((m, i) => {
                    const d = dm(m); const st = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                    html += `<tr class="today-row${isFavorite(m.team1)||isFavorite(m.team2)?' fav-row':''}"><td>${i+1}</td><td class="match-teams"><span class="flag">${getFlag(m.team1)}</span> ${TEAM_NAMES[m.team1]||m.team1} <span class="vs">vs</span> ${TEAM_NAMES[m.team2]||m.team2} <span class="flag">${getFlag(m.team2)}</span></td><td><div class="time-ast">${d.time}</div><div class="time-label">${d.label} ${d.date}</div></td><td><span class="status-badge ${st}">${getStatusText(st)}</span></td><td class="stadium-cell">${STADIUM_NAMES[m.stadium]||m.stadium||''}</td><td><span class="fav-star active" onclick="window.__toggleFav('${m.team1}')">⭐</span></td></tr>`;
                });
                html += `</tbody></table><div class="card-grid">`;
                favMatches.forEach((m) => {
                    const d = dm(m); const st = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                    html += `<div class="mc today-row fav-mc" style="border-right:3px solid #FFD700;"><div class="mc-teams"><span class="flag">${getFlag(m.team1)}</span> ${TEAM_NAMES[m.team1]||m.team1}<br><span class="flag">${getFlag(m.team2)}</span> ${TEAM_NAMES[m.team2]||m.team2}</div><div class="mc-info"><span class="mc-time">${d.time}</span>${m.score1!=null?`<span class="mc-score">${m.score1} - ${m.score2}</span>`:''}<span class="status-badge ${st}">${getStatusText(st)}</span></div></div>`;
                });
                html += `</div></div></div>`;
            }
            sortedDates.forEach(dateKey => {
                const dayMs = grouped[dateKey]; const isT = dateKey === todayStr;
                html += `<div class="group-section"><div class="group-header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span>${isT?'📅 اليوم':'📅 '+formatDate(dateKey)}</span><span class="count">${dayMs.length} مباراة</span><span class="toggle-icon">▶</span></div><div class="group-body${isT?' open':''}"><table><thead><tr><th>#</th><th>المباراة</th><th>التوقيت</th><th>النتيجة</th><th>الحالة</th><th>الملعب</th><th>⭐</th></tr></thead><tbody>`;
                dayMs.forEach((m, i) => {
                    const d = dm(m); const st = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                    const f = isFavorite(m.team1) || isFavorite(m.team2);
                    html += `<tr class="${isT?'today-row':''}${f?' fav-row':''}"><td>${i+1}</td><td class="match-teams"><span class="flag">${getFlag(m.team1)}</span> ${TEAM_NAMES[m.team1]||m.team1} <span class="vs">vs</span> ${TEAM_NAMES[m.team2]||m.team2} <span class="flag">${getFlag(m.team2)}</span></td><td><div class="time-ast">${d.time}</div><div class="time-label">${d.label}</div></td><td class="score-cell ${m.score1!=null?'has-score':'no-score'}">${m.score1!=null?m.score1+' - '+m.score2:'- : -'}</td><td><span class="status-badge ${st}">${getStatusText(st)}</span>${st==='upcoming'?`<div class="countdown" data-date="${m.dateAst}" data-time="${m.timeAst}">${countdownText(m.dateAst, m.timeAst)}</div>`:''}</td><td class="stadium-cell">${STADIUM_NAMES[m.stadium]||m.stadium||''}</td><td><span class="fav-star ${f?'active':''}" onclick="window.__toggleFav('${m.team1}')">${f?'⭐':'☆'}</span></td></tr>`;
                });
                html += `</tbody></table><div class="card-grid">`;
                dayMs.forEach((m) => {
                    const d = dm(m); const st = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                    html += `<div class="mc${isT?' today-row':''}${isFavorite(m.team1)||isFavorite(m.team2)?' fav-mc':''}"><div class="mc-teams"><span class="flag">${getFlag(m.team1)}</span> ${TEAM_NAMES[m.team1]||m.team1}<br><span class="flag">${getFlag(m.team2)}</span> ${TEAM_NAMES[m.team2]||m.team2}</div><div class="mc-info"><span class="mc-time">${d.time}</span>${m.score1!=null?`<span class="mc-score">${m.score1} - ${m.score2}</span>`:''}<span class="status-badge ${st}">${getStatusText(st)}</span></div></div>`;
                });
                html += `</div></div></div>`;
            });
            renderContent(html);
            updateCountdowns();
            return;
        }

        // Groups tab: group by group letter, show standings + matches per group
        const grouped = {}; filtered.forEach(m => { const g = m.group || 'G'; if (!grouped[g]) grouped[g] = []; grouped[g].push(m); });
        const sortedGroups = Object.keys(grouped).sort();
        sortedGroups.forEach(g => {
            const ms = grouped[g];
            const standings = getGroupStandings(g);
            const hasStandings = standings.length > 0;
            html += `<div class="group-section"><div class="group-header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span>${GROUP_NAMES[g]||'المجموعة '+g}</span><span class="count">${ms.length} مباراة</span><span class="toggle-icon">▶</span></div><div class="group-body">`;
            if (hasStandings) {
                html += `<div class="group-sub-tabs"><button class="group-sub-tab active" onclick="window.__switchGroupSubTab(this,'standings')">📊 الترتيب</button><button class="group-sub-tab" onclick="window.__switchGroupSubTab(this,'matches')">📅 المباريات</button></div>`;
                html += `<div class="group-sub-content active" id="gs-${g}">${renderStandingsHtml(standings)}${renderStandingsCards(standings)}</div>`;
                html += `<div class="group-sub-content" id="gm-${g}">`;
            }
            html += `<div class="table-wrap"><table><thead><tr><th>#</th><th>المباراة</th><th>التوقيت</th><th>النتيجة</th><th>الحالة</th><th>الملعب</th><th>⭐</th></tr></thead><tbody>`;
            ms.forEach((m, i) => {
                const d = dm(m); const st = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                const f = isFavorite(m.team1) || isFavorite(m.team2);
                html += `<tr class="${f?' fav-row':''}"><td>${i+1}</td><td class="match-teams"><span class="flag">${getFlag(m.team1)}</span> ${TEAM_NAMES[m.team1]||m.team1} <span class="vs">vs</span> ${TEAM_NAMES[m.team2]||m.team2} <span class="flag">${getFlag(m.team2)}</span></td><td><div class="time-ast">${d.time}</div><div class="time-label">${d.label}</div></td><td class="score-cell ${m.score1!=null?'has-score':'no-score'}">${m.score1!=null?m.score1+' - '+m.score2:'- : -'}</td><td><span class="status-badge ${st}">${getStatusText(st)}</span>${st==='upcoming'?`<div class="countdown" data-date="${m.dateAst}" data-time="${m.timeAst}">${countdownText(m.dateAst, m.timeAst)}</div>`:''}</td><td class="stadium-cell">${STADIUM_NAMES[m.stadium]||m.stadium||''}</td><td><span class="fav-star ${f?'active':''}" onclick="window.__toggleFav('${m.team1}')">${f?'⭐':'☆'}</span></td></tr>`;
            });
            html += `</tbody></table></div><div class="card-grid">`;
            ms.forEach(m => {
                const d = dm(m); const st = getStatus(m.score1, m.score2, m.date, m.timeAst, m.dateAst);
                html += `<div class="mc${isFavorite(m.team1)||isFavorite(m.team2)?' fav-mc':''}"><div class="mc-teams"><span class="flag">${getFlag(m.team1)}</span> ${TEAM_NAMES[m.team1]||m.team1}<br><span class="flag">${getFlag(m.team2)}</span> ${TEAM_NAMES[m.team2]||m.team2}</div><div class="mc-info"><span class="mc-time">${d.time}</span>${m.score1!=null?`<span class="mc-score">${m.score1} - ${m.score2}</span>`:''}<span class="status-badge ${st}">${getStatusText(st)}</span></div></div>`;
            });
            html += `</div>`;
            if (hasStandings) html += `</div>`;
            html += `</div></div>`;
        });
        renderContent(html);
        updateCountdowns();
    }, [renderContent, updateCountdowns]);

    // === Navigation ===
    const switchSection = useCallback((section) => {
        setActiveSection(section);
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        const tab = document.getElementById('tab-' + section);
        if (tab) tab.classList.add('active');
        const subNav = document.getElementById('groupsSubNav');
        if (subNav) subNav.classList.toggle('show', section === 'groups');

        if (section === 'groups') { buildGroupButtons(); renderMatches(getAllMatches(), activeGroupFilter); }
        else if (section === 'today') { renderMatches(getAllMatches(), 'today'); }
        else if (section === 'stream') { loadStreams(); }
        else if (section === 'channels') { loadChannels(); }
    }, [activeGroupFilter, buildGroupButtons, renderMatches, loadStreams, loadChannels]);

    const loadData = useCallback(async () => {
        const info = document.getElementById('updateInfo');
        try {
            const resp = await fetch('https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026/worldcup.json');
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            const parsed = parseOpenfootball(data);
            setAllMatches(parsed);
            if (info) info.innerHTML = `<span>✅ تم التحديث: ${new Date().toLocaleString('ar-SA')}</span>`;
            switchSection('today');
        } catch (e) {
            try {
                const resp2 = await fetch('./matches.json?t=' + Date.now());
                if (!resp2.ok) throw new Error('HTTP ' + resp2.status);
                const data2 = await resp2.json();
                const raw = data2.matches || [];
                const fallbackMatches = raw.map(m => ({ ...m, team1: m.team1En || m.team1, team2: m.team2En || m.team2 }));
                setAllMatches(fallbackMatches);
                if (info) info.innerHTML = `<span>✅ تم التحميل من الملف المحلي: ${new Date().toLocaleString('ar-SA')}</span>`;
                switchSection('today');
            } catch (e2) {
                renderContent(`<div class="error-msg">❌ فشل تحميل البيانات: ${e2.message}<br><button class="retry-btn" onclick="window.__retryData()">إعادة المحاولة</button></div>`);
                if (info) info.innerHTML = '';
            }
        }
    }, [switchSection, renderContent]);

    // === Streaming Modal ===
    const openStream = useCallback((title, url, channel, matchIdx, matchData) => {
        const iframe = document.getElementById('modalPlayer');
        const video = document.getElementById('modalVideo');
        if (!iframe || !video) return;
        iframe.style.display = 'none'; video.style.display = 'none';
        if (hlsInstance.current) { hlsInstance.current.destroy(); hlsInstance.current = null; }
        if (!url && channel) {
            const n = channel.toLowerCase().match(/max\s*(\d+)/i);
            if (n) url = 'https://tops.poiy.online/albaplayer/max' + n[1] + '/';
        }
        if (url && url.includes('.m3u8')) {
            video.style.display = 'block';
            if (window.Hls && Hls.isSupported()) {
                hlsInstance.current = new Hls();
                hlsInstance.current.loadSource(url);
                hlsInstance.current.attachMedia(video);
                video.play().catch(() => {});
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url; video.play().catch(() => {});
            } else { iframe.style.display = 'block'; iframe.src = url; }
        } else { iframe.style.display = 'block'; iframe.src = url || ''; }
        document.getElementById('modalTitle').textContent = '📺 ' + title;
        currentStreamRef.current = { idx: matchIdx >= 0 ? matchIdx : -1, match: matchData || null };
        renderModalSources();
        document.getElementById('streamModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }, [renderModalSources]);

    const closeStream = useCallback(() => {
        if (hlsInstance.current) { hlsInstance.current.destroy(); hlsInstance.current = null; }
        const video = document.getElementById('modalVideo');
        const iframe = document.getElementById('modalPlayer');
        if (video) { video.pause(); video.src = ''; video.style.display = 'none'; }
        if (iframe) { iframe.src = ''; iframe.style.display = 'block'; }
        const modal = document.getElementById('streamModal');
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
    }, []);

    const renderModalSources = useCallback(() => {
        const container = document.getElementById('modalSources');
        if (!container) return;
        const { idx, match } = currentStreamRef.current;
        if (!match || idx < 0) { container.innerHTML = ''; return; }
        const sm = {'1':'embedUrl','2':'embedUrl2','3':'embedUrl3','4':'embedUrl4','5':'embedUrl5','m3u8':'m3u8','m3u82':'m3u82','m3u83':'m3u83'};
        const labels = ['المصدر 1','المصدر 2','المصدر 3','المصدر 4','المصدر 5','HLS 1','HLS 2','HLS 3'];
        const btnKeys = ['1','2','3','4','5','m3u8','m3u82','m3u83'];
        const colors = ['#1565C0','#1976D2','#388E3C','#7B1FA2','#E65100','#00838F','#00695C','#4E342E'];
        let html = '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:8px 12px;">';
        btnKeys.forEach((k, i) => {
            const key = sm[k];
            if (match[key]) {
                html += `<button class="stream-btn" style="background:linear-gradient(135deg,${colors[i]},${colors[i]});font-size:12px;padding:5px 10px;border-radius:6px;" onclick="window.__switchSource('${k}')">▶ ${labels[i]}</button>`;
            }
        });
        html += `<button class="stream-btn" style="background:linear-gradient(135deg,#FF8F00,#FF6F00);font-size:12px;padding:5px 10px;border-radius:6px;" onclick="window.__shareLink()">📤 مشاركة</button>`;
        html += `<button class="stream-btn" style="background:linear-gradient(135deg,#37474F,#263238);font-size:12px;padding:5px 10px;border-radius:6px;" onclick="window.__toggleFullscreen()">⛶ ملء الشاشة</button>`;
        html += '</div>';
        container.innerHTML = html;
    }, []);

    const switchSource = useCallback((source) => {
        const iframe = document.getElementById('modalPlayer');
        const video = document.getElementById('modalVideo');
        if (!iframe || !video) return;
        const { match } = currentStreamRef.current;
        if (!match) return;
        const sm = {'1':'embedUrl','2':'embedUrl2','3':'embedUrl3','4':'embedUrl4','5':'embedUrl5','m3u8':'m3u8','m3u82':'m3u82','m3u83':'m3u83'};
        const key = sm[source];
        const url = (key && match[key]) || match.embedUrl || '';
        if (!url) return;
        iframe.style.display = 'none'; video.style.display = 'none';
        if (hlsInstance.current) { hlsInstance.current.destroy(); hlsInstance.current = null; }
        if (url.includes('.m3u8')) {
            video.style.display = 'block';
            if (window.Hls && Hls.isSupported()) {
                hlsInstance.current = new Hls();
                hlsInstance.current.loadSource(url);
                hlsInstance.current.attachMedia(video);
                video.play().catch(() => {});
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url; video.play().catch(() => {});
            } else { iframe.style.display = 'block'; iframe.src = url; }
        } else { iframe.style.display = 'block'; iframe.src = url || ''; }
        document.querySelectorAll('#modalSources .stream-btn').forEach(b => b.style.opacity = '0.5');
        const active = document.querySelector(`#modalSources .stream-btn[onclick*="'${source}'"]`);
        if (active) active.style.opacity = '1';
    }, []);

    const shareLink = useCallback(() => {
        const { match } = currentStreamRef.current;
        if (!match) return;
        const appUrl = 'https://kora-yaser.web.app';
        const text = `⚽ مشاهدة ${match.team1||''} vs ${match.team2||''} - كأس العالم 2026 🏆\n📲 حمّل التطبيق: ${appUrl}`;
        if (navigator.share) {
            navigator.share({ title: 'YASEER-KOORA - بث مباشر كأس العالم', text, url: appUrl }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => showToast('✅ تم نسخ الرابط')).catch(() => {});
        }
    }, [showToast]);

    const applyTheme = useCallback(() => {
        const t = getTheme();
        setThemeState(t);
        setTheme(t);
    }, []);

    const toggleTzPicker = useCallback(() => {
        setTzOpen(prev => { const next = !prev; if (next) renderTzList(); document.body.style.overflow = next ? 'hidden' : ''; return next; });
    }, []);

    const closeTzPicker = useCallback(() => { setTzOpen(false); document.body.style.overflow = ''; }, []);
    const renderTzList = useCallback(() => {
        const list = document.getElementById('tzList');
        if (!list) return;
        list.innerHTML = TZ_LIST.map((t, i) => `<button class="tz-item${tz===t?' active':''}" onclick="window.__selectTz(${i})">${t.label}<span class="tz-offset">${t.iana}</span></button>`).join('');
    }, [tz]);

    // === Effects ===
    // Global click handler for stream buttons and modal backdrops
    useEffect(() => {
        const handler = (e) => {
            const btn = e.target.closest('.stream-btn');
            if (btn) {
                const idx = parseInt(btn.dataset.index);
                const source = btn.dataset.source;
                const m = streamsData && streamsData[idx];
                if (m) {
                    const sm = {'1':'embedUrl','2':'embedUrl2','3':'embedUrl3','4':'embedUrl4','5':'embedUrl5','m3u8':'m3u8','m3u82':'m3u82','m3u83':'m3u83'};
                    const key = sm[source];
                    openStream((m.team1||'') + ' vs ' + (m.team2||''), (key && m[key]) || m.embedUrl || '', m.channel, idx, m);
                }
            }
            if (e.target.closest('#streamModal') && !e.target.closest('.modal-content')) closeStream();
            if (e.target.closest('#tzOverlay') && !e.target.closest('.tz-modal')) closeTzPicker();
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [streamsData, openStream, closeStream]);

    // Theme
    useEffect(() => { setTheme(theme); }, [theme]);
    useEffect(() => { applyTheme(); }, [applyTheme]);

    // Clock
    useEffect(() => {
        const tick = () => {
            const tz = getUserTz();
            const now = new Date();
            const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz.iana, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            const ts = fmt.format(now);
            const h = parseInt(ts); const ampm = h >= 12 ? 'م' : 'ص';
            const h12 = h % 12 || 12;
            const dsp = h12 + ':' + ts.split(':')[1] + ':' + ts.split(':')[2];
            document.getElementById('saudiTime').textContent = dsp;
            document.getElementById('amPm').textContent = ampm;
            document.getElementById('saudiDate').textContent = new Intl.DateTimeFormat('ar-SA', { timeZone: tz.iana, weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(now);
        };
        tick(); const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // Periodic refreshes
    useEffect(() => { const id = setInterval(updateCountdowns, 60000); return () => clearInterval(id); }, [updateCountdowns]);
    useEffect(() => { renderLiveBar(); const id = setInterval(renderLiveBar, 15000); return () => clearInterval(id); }, [renderLiveBar]);

    // Notifications
    useEffect(() => {
        const check = () => {
            requestNotifyPerm();
            const favs = getFavorites(); const notified = getNotifiedIds(); const lead = getNotifyMin();
            getAllMatches().forEach(m => {
                if (notified.includes(m.id)) return;
                if (!favs.includes(m.team1) && !favs.includes(m.team2)) return;
                try {
                    const dp = (m.dateAst||m.date||'').split('-').map(Number);
                    const tp = (m.timeAst||'00:00').split(':').map(Number);
                    const md = new Date(Date.UTC(dp[0], dp[1]-1, dp[2], tp[0], tp[1]));
                    const diff = (md - new Date()) / 60000;
                    if (diff > 0 && diff <= lead && Math.abs(diff - lead) < 1.5) {
                        markNotified(m.id);
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('⚽ مباراة مفضلة بعد ' + lead + ' دقيقة', { body: `${TEAM_NAMES[m.team1]||m.team1} vs ${TEAM_NAMES[m.team2]||m.team2} - ${m.timeAst}`, icon: '/icons/icon-192x192.png' });
                        }
                    }
                } catch(e) {}
            });
        };
        check(); const id = setInterval(check, 60000);
        return () => clearInterval(id);
    }, []);

    // Init & periodic data reload
    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { const id = setInterval(loadData, 300000); return () => clearInterval(id); }, [loadData]);

    // Auto-refresh streams every 60s when on stream tab
    useEffect(() => {
        if (activeSection !== 'stream') return;
        const id = setInterval(loadStreams, 60000);
        return () => clearInterval(id);
    }, [activeSection, loadStreams]);

    // Visitor counter
    useEffect(() => {
        fetch('https://api.countapi.xyz/hit/kora-yaser/visitors')
            .then(r => r.json())
            .then(d => setVisitorCount(d.value))
            .catch(() => {});
        const id = setInterval(() => {
            fetch('https://api.countapi.xyz/get/kora-yaser/visitors')
                .then(r => r.json())
                .then(d => setVisitorCount(d.value))
                .catch(() => {});
        }, 30000);
        return () => clearInterval(id);
    }, []);

    // Fullscreen overlay detection
    useEffect(() => {
        const handler = () => {
            const fs = document.fullscreenElement || document.webkitFullscreenElement;
            const container = document.getElementById('modalPlayerContainer');
            setFsOverlay(!!(fs && container && container.contains(fs)));
        };
        document.addEventListener('fullscreenchange', handler);
        document.addEventListener('webkitfullscreenchange', handler);
        return () => {
            document.removeEventListener('fullscreenchange', handler);
            document.removeEventListener('webkitfullscreenchange', handler);
        };
    }, []);

    // Window globals for inline onclick handlers
    useEffect(() => {
        window.__toggleFav = (team) => { toggleFavorite(team); switchSection(activeSection); };
        window.__setGroupFilter = (g) => { setActiveGroupFilter(g); };
        window.__selectTz = (i) => { const t = TZ_LIST[i]; setTz(t); closeTzPicker(); clearDmCache(); switchSection(activeSection); showToast('✅ تم تغيير المنطقة الزمنية'); };
        window.__goToStream = () => switchSection('stream');
        window.__retryStreams = () => loadStreams();
        window.__retryData = () => loadData();
        window.__switchSource = (source) => switchSource(source);
        window.__shareLink = () => shareLink();
        window.__toggleFullscreen = () => {
            const c = document.getElementById('modalPlayerContainer');
            if (c) {
                if (document.fullscreenElement || document.webkitFullscreenElement) {
                    document.exitFullscreen?.() || document.webkitExitFullscreen?.();
                    try { screen.orientation?.unlock?.(); } catch(e) {}
                } else {
                    c.requestFullscreen?.() || c.webkitRequestFullscreen?.();
                    try { screen.orientation?.lock?.('landscape'); } catch(e) {}
                }
            }
        };
        window.__closeStream = () => { closeStream(); };
        window.__playChannel = (i) => {
            const ch = channelsData[i];
            if (ch) openStream(ch.ch, ch.url, null, -1, { embedUrl: ch.url, ch: ch.ch });
        };
        window.__chPage = (p) => { setChPage(p); };
        window.__switchGroupSubTab = (btn, tab) => {
            const parent = btn.closest('.group-body');
            if (!parent) return;
            parent.querySelectorAll('.group-sub-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const contents = parent.querySelectorAll('.group-sub-content');
            contents.forEach((c, i) => c.classList.toggle('active', (tab === 'standings' ? 0 : contents.length - 1) === i));
        };
        return () => { ['__toggleFav','__setGroupFilter','__selectTz','__goToStream','__retryStreams','__retryData','__switchSource','__shareLink','__toggleFullscreen','__closeStream','__playChannel','__chPage','__switchGroupSubTab'].forEach(k => delete window[k]); };
    }, [activeSection, switchSection, loadStreams, loadData, setTz, closeTzPicker, showToast, channelsData, openStream]);

    // PWA Install
    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setTimeout(() => setShowInstall(true), 3000); };
        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => { setShowInstall(false); setDeferredPrompt(null); });
        return () => { window.removeEventListener('beforeinstallprompt', handler); };
    }, []);

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null); setShowInstall(false);
    }, [deferredPrompt]);

    const dismissInstall = useCallback(() => { setShowInstall(false); localStorage.setItem('kora_install_dismissed', '1'); }, []);

    // Service Worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
        }
    }, []);

    return (
        <>
            <div className="container">
                <div className="hero">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <div className="hero-title-group">
                            <img src="./logo.png" alt="YASEER-KOORA" className="hero-logo-img" />
                            <p className="hero-motto">نحاول نشر السعادة بأبسط الطرق، لا إعلانات، لا مدفوعات، لا مبالغ اشتراك (تكفينا دعوة بالتوفيق) ❤️ 🤍</p>
                        </div>
                        <div className="hero-media">
                            <img src="./maradona.png" alt="دييغو مارادونا" className="maradona-img" />
                        </div>
                    </div>
                </div>

                <div className="time-bar" id="timeBar">
                    <span>🕐</span>
                    <span className="time" id="saudiTime">--:--</span>
                    <span className="ampm" id="amPm">--</span>
                    <span className="date" id="saudiDate">--</span>
                    <span className="badge">🇸🇦 السعودية</span>
                    <button className="tz-btn" id="tzBtn" onClick={toggleTzPicker} title="المنطقة الزمنية">🕐</button>
                    <button className="theme-btn" id="themeBtn" onClick={toggleTheme} title="الوضع النهاري/الليلي">{theme === 'light' ? '🌙' : '☀️'}</button>
                </div>

                <div className="live-bar" id="liveBar">
                    <div className="live-dot"></div>
                    <span className="live-label">🔴 مباشر الآن</span>
                    <div className="live-matches" id="liveMatches"></div>
                </div>

                <div className="update-info" id="updateInfo">جارٍ تحميل بيانات المباريات...</div>

                <div className="section-nav">
                    <button className="nav-tab active" id="tab-today" onClick={() => switchSection('today')}>
                        <svg viewBox="0 0 24 24"><path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V6A2,2 0 0,0 19,4M19,19H5V9H19V19M19,7H5V6H19V7M12,11A2,2 0 0,0 10,13A2,2 0 0,0 12,15A2,2 0 0,0 14,13A2,2 0 0,0 12,11Z"/></svg>
                        <span>مباريات اليوم</span>
                    </button>
                    <button className="nav-tab" id="tab-groups" onClick={() => switchSection('groups')}>
                        <svg viewBox="0 0 24 24"><path d="M3,5H21V7H3V5M3,11H21V13H3V11M3,17H21V19H3V17Z"/></svg>
                        <span>جدول المجموعات</span>
                    </button>
                    <button className="nav-tab" id="tab-stream" onClick={() => switchSection('stream')}>
                        <svg viewBox="0 0 24 24"><path d="M21,3H3C1.89,3 1,3.89 1,5V17C1,18.11 1.89,19 3,19H8V21H16V19H21C22.11,19 23,18.11 23,17V5C23,3.89 22.11,3 21,3M21,17H3V5H21V17M16,11L9,15V7L16,11Z"/></svg>
                        <span>البث المباشر</span>
                    </button>
                    <button className="nav-tab" id="tab-channels" onClick={() => switchSection('channels')}>
                        <svg viewBox="0 0 24 24"><path d="M21,6V8H3V6H21M3,16H21V14H3V16M3,11H21V9H3V11M3,21H21V19H3V21Z"/></svg>
                        <span>القنوات</span>
                    </button>
                </div>

                <div className="sub-nav-wrapper" id="groupsSubNav">
                    <div className="sub-nav-label">اختر المجموعة لعرض جدولها</div>
                    <div className="groups-bar" id="groupsBar"></div>
                </div>

                <div id="content" ref={contentRef}>
                    <div className="loading">
                        <div className="spinner"></div>
                        <div>جارٍ تحميل جدول المباريات...</div>
                    </div>
                </div>

                <div className="footer">تم التطوير بواسطة SNY</div>
            </div>

            <div className="modal-overlay" id="streamModal">
                <div className="modal-content">
                    <div className="modal-header">
                        <span className="match-title" id="modalTitle">مشاهدة المباراة</span>
                        <button className="modal-close" onClick={closeStream}>✕</button>
                    </div>
                    <div id="modalSources"></div>
                    <div style={{background:'rgba(255,193,7,0.1)',borderBottom:'1px solid rgba(255,193,7,0.2)',padding:'8px 16px',color:'#ffc107',fontSize:'13px',fontWeight:600,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                        <span>💡</span>
                        <span>هذا البث من مصدر خارجي. في حال فتح لك نافذة إعلان، قم بإغلاقها فوراً والعودة هنا للتشغيل.</span>
                    </div>
                    <div id="modalPlayerContainer" style={{position:'relative',background:'#000'}}>
                        <iframe className="modal-player" id="modalPlayer" allowFullScreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
                        <video className="modal-player" id="modalVideo" style={{display:'none'}} controls preload="metadata" playsInline></video>
                        <div style={{position:'absolute',top:'12px',left:'12px',zIndex:12,background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'4px 10px',color:'#fff',fontSize:'13px',pointerEvents:'none',display:'flex',alignItems:'center',gap:'6px'}}>👁 {visitorCount ?? '...'}</div>
                        <button id="backToMenuBtn" onClick={() => { if (document.fullscreenElement||document.webkitFullscreenElement) { document.exitFullscreen?.()||document.webkitExitFullscreen?.(); setTimeout(window.__closeStream, 200); } else { window.__closeStream(); } }} style={{position:'absolute',bottom:'12px',left:'12px',zIndex:12,background:'rgba(0,0,0,0.6)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'6px',color:'white',padding:'8px 14px',fontSize:'14px',cursor:'pointer',pointerEvents:'auto',display:'flex',alignItems:'center',gap:'6px'}}>⌂ العودة</button>
                    </div>
                </div>
            </div>

            <img src="./logo.png" alt="YASEER-KOORA" id="fsLogo" className="player-logo" style={{position:'fixed',top:'8px',width:'clamp(120px,20vw,260px)',height:'auto',zIndex:2147483647,pointerEvents:'none',opacity:0.9,display:fsOverlay?'block':'none'}} />

            <div className={`install-banner${showInstall?' show':''}`} id="installBanner">
                <div className="install-text">
                    📲 ثبّت التطبيق
                    <small>أضف YASEER-KOORA إلى شاشتك الرئيسية</small>
                </div>
                <button className="install-btn" id="installBtn" onClick={handleInstall}>تثبيت</button>
                <button className="install-dismiss" id="installDismiss" onClick={dismissInstall}>✕</button>
            </div>

            <div className="toast" id="toast"></div>

            <div className={`modal-overlay${tzOpen?' open':''}`} id="tzOverlay">
                <div className="tz-modal">
                    <div className="tz-header">
                        <span>🕐 اختر المنطقة الزمنية</span>
                        <button className="modal-close" onClick={closeTzPicker}>✕</button>
                    </div>
                    <div className="tz-list" id="tzList"></div>
                </div>
            </div>
        </>
    );
}
