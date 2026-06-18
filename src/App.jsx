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
    setAllMatches, getAllMatches, resolveAlbaPlayerUrl, fetchAlbaSources
} from './utils.js';
import { signInWithGoogle, signOutUser, onAuthChange } from './firebase.js';

export default function App() {
    const [tz, setTzState] = useState(getUserTz);
    const [theme, setThemeState] = useState(getTheme);
    const [activeSection, setActiveSection] = useState('today');
    const [activeGroupFilter, setActiveGroupFilter] = useState('all');
    const [streamsData, setStreamsData] = useState([]);
    const [tzOpen, setTzOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);
    const [user, setUser] = useState(() => { try { const s = localStorage.getItem('kora_user'); return s ? JSON.parse(s) : null; } catch(e) { return null; } });
    const contentRef = useRef(null);
    const toastTimer = useRef(null);
    const hlsInstance = useRef(null);
    const currentStreamRef = useRef({ idx: -1, match: null });
    const [visitorCount, setVisitorCount] = useState(null);
    const [fsOverlay, setFsOverlay] = useState(false);

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
            if (m.isChannel) {
                const hasSrc = srcKeys.some(k => m[k]);
                let c = `<div class="stream-card live" style="border-top-color:#FFD700;border-width:3px;"><div style="display:flex;align-items:center;gap:12px;width:100%;flex-wrap:wrap;"><img src="${m.logo1||''}" alt="" style="width:50px;height:50px;border-radius:10px;object-fit:contain;" onerror="this.style.display='none'"><div style="flex:1;min-width:120px;"><div style="font-weight:800;font-size:18px;">🏆 ${m.team1}</div><div style="color:#4CAF50;font-size:14px;font-weight:600;">🔴 بث مباشر</div></div>${m.time?`<div style="color:#90a4ae;font-size:13px;">${m.time}</div>`:''}</div>`;
                if (hasSrc) {
                    c += `<div class="source-btns" style="width:100%;justify-content:center;margin-top:8px;">`;
                    srcKeys.forEach((k, i) => { if (m[k]) c += srcBtnHtml(idx, btnKeys[i], labels[i], cls[i], styl[i], sd); });
                    c += `</div>`;
                }
                c += `</div>`;
                return c;
            }
            const st = m.status === 'live' ? 'ongoing' : m.status === 'finished' ? 'finished' : 'upcoming';
            const sm = { live:'⚡ مباشر', coming:'⏳ بعد قليل', upcoming:'🔜 قادمة' };
            const sc = (m.score1!=null && m.score2!=null) ? `${m.score1} - ${m.score2}` : '';
            const t1 = m.team1En || TEAM_NAMES[m.team1] || m.team1;
            const t2 = m.team2En || TEAM_NAMES[m.team2] || m.team2;
            let c = `<div class="stream-card ${m.status==='live'?'live':''}"><img src="${m.logo1||''}" alt="" class="team-logo" onerror="this.style.display='none'"><div class="team-name left">${t1}</div><div class="score-box">${sc?`<div class="score">${sc}</div>`:''}<div class="time">${m.time||''}</div></div><div class="team-name right">${t2}</div><img src="${m.logo2||''}" alt="" class="team-logo" onerror="this.style.display='none'"><div class="actions"><span class="status-badge ${st}">${sm[m.status]||m.statusText}</span>${m.channel?`<span class="channel">📡 ${m.channel}</span>`:''}<div class="source-btns">`;
            srcKeys.forEach((k, i) => { if (m[k]) c += srcBtnHtml(idx, btnKeys[i], labels[i], cls[i], styl[i], sd); });
            c += `</div></div></div>`;
            return c;
        };
        let html = '';
        // Channel card (always first)
        const chanCard = sd.find(m => m.isChannel);
        if (chanCard) {
            const idx = sd.indexOf(chanCard);
            html += `<div class="group-section"><div class="group-header open"><span>📡 البث المباشر</span></div><div class="group-body open"><div class="stream-grid">${renderCard(chanCard, idx)}</div></div></div>`;
        }
        // Scraper matches
        const matchSd = sd.filter(m => !m.isChannel);
        const hasLive = matchSd.some(m => m.status === 'live');
        const hasUpcoming = matchSd.some(m => m.status !== 'live');
        if (hasLive) {
            html += `<div class="group-section"><div class="group-header open" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span>🔴 مباشر الآن</span><span class="count">${matchSd.filter(m=>m.status==='live').length} مباراة</span><span class="toggle-icon">▶</span></div><div class="group-body open"><div class="stream-grid">`;
            matchSd.forEach((m, idx) => { if (m.status === 'live') html += renderCard(m, idx); });
            html += `</div></div></div>`;
        }
        if (hasUpcoming) {
            html += `<div class="group-section"><div class="group-header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')"><span>⏳ المباريات القادمة</span><span class="count">${matchSd.filter(m=>m.status!=='live').length} مباراة</span><span class="toggle-icon">▶</span></div><div class="group-body"><div class="stream-grid">`;
            matchSd.forEach((m, idx) => { if (m.status !== 'live') html += renderCard(m, idx); });
            html += `</div></div></div>`;
        }
        html += `<div style="text-align:center;color:#555;font-size:clamp(10px,0.8vw,13px);margin-top:10px;">إذا كانت بعض الروابط لا تعمل أعد المحاولة بعد استخدام VPN</div>`;
        renderContent(html);
    }, [renderContent]);



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
            // 1. Always fetch live channel sources (beIN MAX 1)
            const channelUrl = 'https://tops.poiy.online/albaplayer/max1/';
            const chanSources = await fetchAlbaSources(channelUrl);
            const chanEntry = {
                id: 'ch_max1', team1: 'beIN SPORT MAX 1', team2: '',
                channel: 'beIN SPORT MAX 1',
                status: 'live', time: 'مباشر الآن',
                logo1: 'https://www.bein.com/wp-content/uploads/2017/09/Bein-Sport-Max-1-logo.jpg',
                url: channelUrl,
                ...chanSources,
                isChannel: true
            };

            // 2. Fetch scraper data + schedule
            const [streamsRes, scheduleRes] = await Promise.all([
                fetch('./streams.json?t=' + Date.now()),
                fetch('./matches.json?t=' + Date.now())
            ]);
            const streamsData = streamsRes.ok ? await streamsRes.json() : { matches: [] };
            const schedule = scheduleRes.ok ? (await scheduleRes.json()).matches : [];

            // Build schedule lookup by English names
            const schedMap = {};
            schedule.forEach(sm => {
                const k = (sm.team1En||'') + '_' + (sm.team2En||'');
                const r = (sm.team2En||'') + '_' + (sm.team1En||'');
                schedMap[k.toLowerCase().replace(/\s+/g,'')] = sm;
                schedMap[r.toLowerCase().replace(/\s+/g,'')] = sm;
            });

            // Mark stale matches as finished
            const now = new Date();
            const sd = streamsData.matches || [];
            sd.forEach(m => {
                if (m.status === 'live' && m.time) {
                    try {
                        const [h, mn] = m.time.split(':').map(Number);
                        const matchT = new Date(); matchT.setHours(h, mn, 0, 0);
                        if ((now - matchT) > 125*60000) m.status = 'finished';
                    } catch(e) {}
                }
                const sKey = ((m.team1||'') + '_' + (m.team2||'')).replace(/\s+/g,'').toLowerCase();
                const schedEntry = schedMap[sKey];
                if (schedEntry) {
                    m.dateAst = m.dateAst || schedEntry.dateAst;
                    m.timeAst = m.timeAst || schedEntry.timeAst;
                    if (!m.team1En) m.team1En = schedEntry.team1En;
                    if (!m.team2En) m.team2En = schedEntry.team2En;
                }
                if (!m.team1En && m.time) {
                    const candidates = schedule.filter(sm => sm.timeAst === m.time);
                    if (candidates.length === 1) {
                        m.team1En = candidates[0].team1En;
                        m.team2En = candidates[0].team2En;
                        m.dateAst = m.dateAst || candidates[0].dateAst;
                    }
                }
            });

            // 3. Get upcoming matches from schedule (within 6h) with MAX 1 sources
            const upcomingSched = [];
            const nowSaudi = new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Riyadh'}));
            schedule.forEach(sm => {
                if (sm.score1 !== null || !sm.dateAst || !sm.timeAst) return;
                try {
                    const md = new Date(sm.dateAst + 'T' + sm.timeAst + '+03:00');
                    const diffMin = (md - nowSaudi) / 60000;
                    if (diffMin > -30 && diffMin < 360) {
                        upcomingSched.push({
                            id: 'sched_' + sm.id,
                            team1: sm.team1En, team2: sm.team2En,
                            time: sm.timeAst, dateAst: sm.dateAst, timeAst: sm.timeAst,
                            status: diffMin <= 0 ? 'live' : 'upcoming',
                            channel: 'beIN SPORT MAX 1',
                            logo1: '', logo2: '',
                            ...chanSources,
                            stadium: sm.stadium || '', group: sm.group || ''
                        });
                    }
                } catch(e) {}
            });

            // 4. Only show scraper matches if data is fresh (< 12h old) and has valid dates
            const dataAge = streamsData.lastUpdated ? (Date.now() - new Date(streamsData.lastUpdated).getTime()) : Infinity;
            const freshSd = dataAge < 12*3600000 ? sd : [];
            const activeSd = freshSd.filter(m => m.status !== 'finished' && m.dateAst);
            const liveMatches = activeSd.filter(m => m.status === 'live');
            const upcomingMatches = activeSd.filter(m => m.status === 'upcoming').slice(0, 4);
            const displaySd = [chanEntry, ...upcomingSched, ...liveMatches, ...upcomingMatches];
            setStreamsData(displaySd);
            renderStreams(displaySd);
            const info = document.getElementById('updateInfo');
            if (streamsData.lastUpdated && info) {
                info.innerHTML = `<span>📺 آخر تحديث للروابط: ${new Date(streamsData.lastUpdated).toLocaleString('ar-SA')}</span>`;
            }
        } catch (err) {
            // Fallback: show channel even if scraper fails
            try {
                const chanSources = await fetchAlbaSources('https://tops.poiy.online/albaplayer/max1/');
                const chanEntry = {
                    id: 'ch_max1', team1: 'beIN SPORT MAX 1', team2: '',
                    channel: 'beIN SPORT MAX 1', status: 'live', time: 'مباشر الآن',
                    logo1: 'https://www.bein.com/wp-content/uploads/2017/09/Bein-Sport-Max-1-logo.jpg',
                    url: 'https://tops.poiy.online/albaplayer/max1/',
                    ...chanSources, isChannel: true
                };
                renderStreams([chanEntry]);
                setStreamsData([chanEntry]);
            } catch(e2) {
                renderContent(`<div class="error-msg">❌ فشل تحميل روابط المشاهدة: ${err.message}<br><button class="retry-btn" onclick="window.__retryStreams()">إعادة المحاولة</button></div>`);
            }
        }
    }, [renderContent, renderStreams]);

    const loadChannels = useCallback(async () => {
        renderContent(`<div class="loading"><div class="spinner"></div><div>جارٍ تحميل القنوات...</div></div>`);
        try {
            const resp = await fetch('./channels.json?t=' + Date.now());
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const channels = await resp.json();
            let html = `<div class="stream-grid" style="grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))">`;
            channels.forEach((c, i) => {
                const logo = c.logo ? `<img src="${c.logo}" alt="" style="width:40px;height:40px;object-fit:contain;border-radius:8px;" onerror="this.style.display='none'">` : `<div style="width:40px;height:40px;border-radius:8px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:18px;">📺</div>`;
                html += `<div class="stream-card" style="cursor:pointer;border-top-color:#1976D2;" onclick="window.__openChannel(${i})"><div style="display:flex;align-items:center;gap:12px;width:100%;"><div style="flex-shrink:0;">${logo}</div><div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:15px;">${c.ch}</div><div style="color:#90a4ae;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;text-align:left;">${c.url}</div></div></div></div>`;
            });
            html += `</div>`;
            window.__openChannel = (i) => {
                const ch = channels[i];
                if (!ch) return;
                openStream(ch.ch, ch.url, '', -1, null);
            };
            renderContent(html);
        } catch (err) {
            renderContent(`<div class="error-msg">❌ فشل تحميل القنوات: ${err.message}<br><button class="retry-btn" onclick="window.__retryChannels()">إعادة المحاولة</button></div>`);
        }
    }, [renderContent]);



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
                const dayMs = grouped[dateKey].sort((a,b) => (a.timeAst||a.time||'').localeCompare(b.timeAst||b.time||'')); const isT = dateKey === todayStr;
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

    const syncTouchBlock = useCallback(() => {
        const tb = document.getElementById('playerTouchBlock');
        const video = document.getElementById('modalVideo');
        if (tb && video) tb.style.display = video.style.display === 'block' ? 'none' : 'block';
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
                const ref = url.includes('hibridcdn') ? 'https://rotana.net/' :
                            url.includes('micobali') ? 'https://p4.panda-hd.online/' :
                            url.includes('koora') ? 'https://www.livehd7sport.com/' :
                            url.includes('yallapro') ? 'https://s3.us-east-2.amazonaws.com/' : '';
                const cfg = {};
                if (ref) {
                    cfg.xhrSetup = (x, u) => { x.setRequestHeader('Referer', ref); };
                }
                hlsInstance.current = new Hls(cfg);
                hlsInstance.current.loadSource(url);
                hlsInstance.current.attachMedia(video);
                video.play().catch(() => {});
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url; video.play().catch(() => {});
            } else { iframe.style.display = 'block'; iframe.src = url; }
        } else { iframe.style.display = 'block'; iframe.src = url || ''; }
        syncTouchBlock();
        document.querySelectorAll('#modalSources .stream-btn').forEach(b => b.style.opacity = '0.5');
        const active = document.querySelector(`#modalSources .stream-btn[onclick*="'${source}'"]`);
        if (active) active.style.opacity = '1';
    }, [syncTouchBlock]);

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

    const openStream = useCallback(async (title, url, channel, matchIdx, matchData) => {
        const iframe = document.getElementById('modalPlayer');
        const video = document.getElementById('modalVideo');
        if (!iframe || !video) return;
        iframe.style.display = 'none'; video.style.display = 'none';
        if (hlsInstance.current) { hlsInstance.current.destroy(); hlsInstance.current = null; }
        // For channels: pre-fetch all server sources
        if (matchIdx < 0 && channel) {
            if (!url && channel) {
                const n = channel.toLowerCase().match(/max\s*(\d+)/i);
                if (n) url = 'https://tops.poiy.online/albaplayer/max' + n[1] + '/';
            }
            if (url && url.includes('albaplayer')) {
                const allSources = await fetchAlbaSources(url);
                const firstM3u8 = allSources.m3u8 || allSources.embedUrl || '';
                if (firstM3u8.includes('.m3u8')) url = firstM3u8;
                matchData = { team1: title, channel, ...allSources };
                matchIdx = 0;
            }
        } else {
            if (!url && channel) {
                const n = channel.toLowerCase().match(/max\s*(\d+)/i);
                if (n) url = 'https://tops.poiy.online/albaplayer/max' + n[1] + '/';
            }
            // Resolve albaplayer URLs to direct m3u8
            if (url && url.includes('albaplayer')) {
                const resolved = await resolveAlbaPlayerUrl(url);
                if (resolved !== url) url = resolved;
            }
        }
        if (url && url.includes('.m3u8')) {
            video.style.display = 'block';
            if (window.Hls && Hls.isSupported()) {
                const ref = url.includes('hibridcdn') ? 'https://rotana.net/' :
                            url.includes('micobali') ? 'https://p4.panda-hd.online/' :
                            url.includes('koora') ? 'https://www.livehd7sport.com/' :
                            url.includes('yallapro') ? 'https://s3.us-east-2.amazonaws.com/' : '';
                const cfg = {};
                if (ref) {
                    cfg.xhrSetup = (x, u) => { x.setRequestHeader('Referer', ref); };
                }
                hlsInstance.current = new Hls(cfg);
                hlsInstance.current.loadSource(url);
                hlsInstance.current.attachMedia(video);
                video.play().catch(() => {});
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url; video.play().catch(() => {});
            } else { iframe.style.display = 'block'; iframe.src = url; }
        } else { iframe.style.display = 'block'; iframe.src = url || ''; }
        syncTouchBlock();
        document.getElementById('modalTitle').textContent = '📺 ' + title;
        currentStreamRef.current = { idx: matchIdx >= 0 ? matchIdx : -1, match: matchData || null };
        renderModalSources();
        document.getElementById('streamModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }, [renderModalSources, syncTouchBlock]);

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

    const handleLogin = useCallback(async () => {
        try {
            await signInWithGoogle();
            showToast('✅ تم تسجيل الدخول بنجاح');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') return;
            if (err.code === 'auth/unauthorized-continue-uri') {
                showToast('⚠️ يرجى تفعيل Google Sign-In من Firebase Console (تعليمات في مربع الدردشة)');
            } else {
                showToast('❌ فشل تسجيل الدخول: ' + err.message);
            }
        }
    }, [showToast]);

    const handleLogout = useCallback(async () => {
        try {
            await signOutUser();
            showToast('👋 تم تسجيل الخروج');
        } catch (err) {
            showToast('❌ فشل تسجيل الخروج');
        }
    }, [showToast]);

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
                    openStream((m.team1||'') + ' vs ' + (m.team2||''), (key && m[key]) || m.embedUrl || '', m.channel, idx, m).catch(() => {});
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

    // Auth listener
    useEffect(() => {
        const unsub = onAuthChange((firebaseUser) => {
            if (firebaseUser) {
                const u = { uid: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email, photo: firebaseUser.photoURL };
                setUser(u);
                localStorage.setItem('kora_user', JSON.stringify(u));
            } else {
                setUser(null);
                localStorage.removeItem('kora_user');
            }
        });
        return () => unsub();
    }, []);

    // Clock + countdowns (every 1s for real-time feel)
    useEffect(() => {
        const tick = () => {
            const tz = getUserTz();
            const now = new Date();
            const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz.iana, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            const ts = fmt.format(now);
            const h = parseInt(ts); const ampm = h >= 12 ? 'م' : 'ص';
            const h12 = h % 12 || 12;
            const dsp = h12 + ':' + ts.split(':')[1] + ':' + ts.split(':')[2];
            const elTime = document.getElementById('saudiTime');
            const elAmPm = document.getElementById('amPm');
            const elDate = document.getElementById('saudiDate');
            if (elTime) elTime.textContent = dsp;
            if (elAmPm) elAmPm.textContent = ampm;
            if (elDate) elDate.textContent = new Intl.DateTimeFormat('ar-SA', { timeZone: tz.iana, weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(now);
            updateCountdowns();
        };
        tick(); const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [updateCountdowns]);

    // Periodic refreshes
    useEffect(() => { renderLiveBar(); const id = setInterval(renderLiveBar, 15000); return () => clearInterval(id); }, [renderLiveBar]);

    // Refresh match status every 30s (auto-transition قادمة → مباشر → انتهت)
    useEffect(() => {
        if (activeSection !== 'today' && activeSection !== 'groups') return;
        clearDmCache();
        const fn = () => {
            clearDmCache();
            renderMatches(getAllMatches(), activeSection === 'groups' ? activeGroupFilter : 'today');
        };
        const id = setInterval(fn, 30000);
        return () => clearInterval(id);
    }, [activeSection, activeGroupFilter, renderMatches]);

    // Notifications
    useEffect(() => {
        const check = () => {
            requestNotifyPerm();
            const favs = getFavorites(); const notified = getNotifiedIds(); const lead = getNotifyMin();
            getAllMatches().forEach(m => {
                if (notified.includes(m.id)) return;
                if (!favs.includes(m.team1) && !favs.includes(m.team2)) return;
                try {
                    const md = new Date((m.dateAst||m.date||'') + 'T' + (m.timeAst||'00:00') + '+03:00');
                    if (isNaN(md.getTime())) return;
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

    // Visitor counter (localStorage)
    useEffect(() => {
        let count = parseInt(localStorage.getItem('vc') || '0', 10);
        count += 1;
        localStorage.setItem('vc', count.toString());
        setVisitorCount(count);
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

    // TV screen detection
    useEffect(() => {
        const check = () => {
            const w = window.innerWidth;
            document.body.toggleAttribute('data-tv', w >= 1400);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Keyboard navigation for modal source buttons (TV remote support)
    useEffect(() => {
        const handler = (e) => {
            const modal = document.getElementById('streamModal');
            if (!modal || !modal.classList.contains('open')) return;
            const btns = [...modal.querySelectorAll('.source-btns .stream-btn')];
            if (!btns.length) return;
            const currentIdx = btns.findIndex(b => b.classList.contains('kbfocus'));
            let nextIdx = -1;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % btns.length;
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                nextIdx = currentIdx < 0 ? btns.length - 1 : (currentIdx - 1 + btns.length) % btns.length;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                const cols = window.innerWidth >= 1400 ? 3 : 2;
                const step = e.key === 'ArrowUp' ? -cols : cols;
                e.preventDefault();
                nextIdx = currentIdx < 0 ? 0 : (currentIdx + step + btns.length) % btns.length;
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (currentIdx >= 0) { e.preventDefault(); btns[currentIdx].click(); return; }
            }
            if (nextIdx >= 0) {
                btns.forEach(b => b.classList.remove('kbfocus'));
                btns[nextIdx].classList.add('kbfocus');
                btns[nextIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Window globals for inline onclick handlers
    useEffect(() => {
        window.__toggleFav = (team) => { toggleFavorite(team); switchSection(activeSection); };
        window.__setGroupFilter = (g) => { setActiveGroupFilter(g); };
        window.__selectTz = (i) => { const t = TZ_LIST[i]; setTz(t); closeTzPicker(); clearDmCache(); switchSection(activeSection); showToast('✅ تم تغيير المنطقة الزمنية'); };
        window.__goToStream = () => switchSection('stream');
        window.__retryStreams = () => loadStreams();
        window.__retryData = () => loadData();
        window.__retryChannels = () => loadChannels();
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
        window.__login = () => handleLogin();
        window.__logout = () => handleLogout();
        window.__switchGroupSubTab = (btn, tab) => {
            const parent = btn.closest('.group-body');
            if (!parent) return;
            parent.querySelectorAll('.group-sub-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const contents = parent.querySelectorAll('.group-sub-content');
            contents.forEach((c, i) => c.classList.toggle('active', (tab === 'standings' ? 0 : contents.length - 1) === i));
        };
        return () => { ['__toggleFav','__setGroupFilter','__selectTz','__goToStream','__retryStreams','__retryData','__retryChannels','__switchSource','__shareLink','__toggleFullscreen','__closeStream','__switchGroupSubTab','__openChannel'].forEach(k => delete window[k]); };
    }, [activeSection, switchSection, loadStreams, loadData, setTz, closeTzPicker, showToast, openStream]);

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
                            <img src="/maradona.png" alt="دييغو مارادونا" className="maradona-img" />
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
                    <button className="user-btn" id="userBtn" onClick={user ? handleLogout : handleLogin} title={user ? 'تسجيل الخروج' : 'تسجيل الدخول'}>
                        {user ? (user.photo ? <img src={user.photo} alt="" className="user-avatar" /> : <span className="user-initial">{(user.name||user.email||'?')[0]}</span>) : '👤'}
                    </button>
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
                        <svg viewBox="0 0 24 24"><path d="M21,3H3C1.89,3 1,3.89 1,5V17C1,18.11 3.89,19 3,19H8V21H16V19H21C22.11,19 23,18.11 23,17V5C23,3.89 22.11,3 21,3M21,17H3V5H21V17M16,11L9,15V7L16,11Z"/></svg>
                        <span>البث المباشر</span>
                    </button>
                    <button className="nav-tab" id="tab-channels" onClick={() => switchSection('channels')}>
                        <svg viewBox="0 0 24 24"><path d="M21,6V8H3V6H21M21,10V12H3V10H21M3,16H15V18H3V16Z"/></svg>
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
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <button className="fs-btn" id="fullscreenBtn" onClick={() => { const el = document.getElementById('streamModal').querySelector('.modal-content'); if (el.requestFullscreen) el.requestFullscreen(); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); }} title="ملء الشاشة"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg></button>
                            <button className="modal-close" onClick={closeStream}>✕</button>
                        </div>
                    </div>
                    <div id="modalSources"></div>
                    <div style={{background:'rgba(255,193,7,0.1)',borderBottom:'1px solid rgba(255,193,7,0.2)',padding:'8px 16px',color:'#ffc107',fontSize:'13px',fontWeight:600,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                        <span>💡</span>
                        <span>هذا البث من مصدر خارجي. في حال فتح لك نافذة إعلان، قم بإغلاقها فوراً والعودة هنا للتشغيل.</span>
                    </div>
                    <div id="modalPlayerContainer" style={{position:'relative',background:'#000'}}>
                        <iframe className="modal-player" id="modalPlayer" allowFullScreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-popups allow-forms"></iframe>
                        <video className="modal-player" id="modalVideo" style={{display:'none'}} controls preload="metadata" playsInline></video>
                        <div id="playerTouchBlock" style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:5,background:'transparent'}}></div>
                        <img src="./4.jpg" alt="YASEER-KOORA" className="player-logo" style={{position:'absolute',top:'8px',width:'clamp(120px,20vw,260px)',height:'auto',zIndex:10,pointerEvents:'none',opacity:0.9}} />
                        <div style={{position:'absolute',top:'12px',left:'12px',zIndex:12,background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'4px 10px',color:'#fff',fontSize:'13px',pointerEvents:'none',display:'flex',alignItems:'center',gap:'6px'}}>👁 {visitorCount ?? '...'}</div>
                        <button id="backToMenuBtn" onClick={() => { if (document.fullscreenElement||document.webkitFullscreenElement) { document.exitFullscreen?.()||document.webkitExitFullscreen?.(); setTimeout(window.__closeStream, 200); } else { window.__closeStream(); } }} style={{position:'absolute',bottom:'12px',left:'12px',zIndex:12,background:'rgba(0,0,0,0.6)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'6px',color:'white',padding:'8px 14px',fontSize:'14px',cursor:'pointer',pointerEvents:'auto',display:'flex',alignItems:'center',gap:'6px'}}>⌂ العودة</button>
                    </div>
                </div>
            </div>

            <img src="./4.jpg" alt="YASEER-KOORA" id="fsLogo" className="player-logo" style={{position:'fixed',top:'8px',width:'clamp(120px,20vw,260px)',height:'auto',zIndex:2147483647,pointerEvents:'none',opacity:0.9,display:fsOverlay?'block':'none'}} />

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
