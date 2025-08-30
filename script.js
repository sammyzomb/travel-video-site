/* =========================================
   travel-video-site / script.js (one-paste)
   - Single Contentful client (Delivery)
   - No SS refs
   - Home: hamburger/theme/featured/up-next/schedule
   - /videos: all videos using same client
   ========================================= */

/* ---------- Utils ---------- */
function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function on(el, ev, fn) { el && el.addEventListener(ev, fn); }
function byId(id) { return document.getElementById(id); }

/* ---------- Contentful client (ONLY ONE) ---------- */
const contentfulClient = contentful.createClient({
  space: 'os5wf90ljenp',
  accessToken: 'I0DH-WLwHwVZv7O4rFdBWjSnrzaQWGD4koeOZ1Dypj0' // user-provided Delivery token
});

/* ---------- Taiwan time helpers ---------- */
function getTaiwanTime() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
}
function getCurrentTimeString() {
  const t = getTaiwanTime();
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}
function getDayOfWeek(date) {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return days[date.getDay()];
}

/* ===================================================
   DOMContentLoaded : init UI + page sections
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  /* === 漢堡選單 === */
  const hamburgerBtn = byId('hamburger-btn');
  const sideMenu = byId('side-menu');
  const menuOverlay = byId('menu-overlay');
  const body = document.body;
  function toggleMenu() {
    sideMenu?.classList.toggle('active');
    menuOverlay?.classList.toggle('active');
    body.classList.toggle('menu-open');
  }
  on(hamburgerBtn, 'click', toggleMenu);
  on(menuOverlay, 'click', toggleMenu);

  /* === 主題切換 === */
  const themeSwitcher = byId('theme-switcher');
  const themeIconSun = byId('theme-icon-sun');
  const themeIconMoon = byId('theme-icon-moon');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
  } else {
    const h = new Date().getHours();
    if (h >= 18 || h < 6) {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  }
  updateThemeIcon(body.classList.contains('dark-theme') ? 'dark-theme' : '');
  on(themeSwitcher, 'click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark-theme');
    const cur = body.classList.contains('dark-theme') ? 'dark-theme' : '';
    localStorage.setItem('theme', cur);
    updateThemeIcon(cur);
  });
  function updateThemeIcon(theme) {
    if (!themeIconSun || !themeIconMoon) return;
    if (theme === 'dark-theme') {
      themeIconSun.style.display = 'none';
      themeIconMoon.style.display = 'inline-block';
    } else {
      themeIconSun.style.display = 'inline-block';
      themeIconMoon.style.display = 'none';
    }
  }

  /* === 首頁：精選影片 (容器：#featured-videos) === */
  loadFeaturedFromCF();

  /* === 首頁：即將播出 Spotlight (容器：#schedule-spotlight) === */
  UpNext_v22w();

  /* === 首頁：今日節目表 (時間軸 + 自動高亮) === */
  loadScheduleData();

  /* === 所有節目頁：/videos（容器：多重容忍） === */
  loadAllVideosPage();

  /* === 每秒更新現在時間、跨日自動刷新節目表 === */
  startTimeUpdates();
});

/* ===================================================
   首頁：精選影片（每頁 8 個＋「所有節目」按鈕）
   容器：#featured-videos（不存在就跳過）
   =================================================== */
async function loadFeaturedFromCF() {
  const container = byId('featured-videos');
  if (!container) return;

  const pick = (f, keys) => {
    for (const k of keys) if (f && f[k] != null && f[k] !== '') return f[k];
    return '';
  };
  const limitText = (txt, max) => !txt ? '' : (txt.length > max ? txt.slice(0, max) + '…' : txt);

  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'video',
      'fields.isFeatured': true,
      order: '-sys.updatedAt',
      limit: 100
    });

    const items = (entries.items || []).map(it => {
      const f = it.fields || {};
      const title = pick(f, ['影片標題', 'title']);
      const desc = pick(f, ['精選推薦影片說明文字', 'description']);
      const ytid = pick(f, ['YouTube ID', 'youTubeId', 'youtubeId', 'YouTubeID']);
      const mp4 = pick(f, ['MP4 影片網址', 'mp4Url']);
      let thumb = '';
      const cfThumb = f.thumbnail?.fields?.file?.url;
      if (cfThumb) thumb = cfThumb.startsWith('http') ? cfThumb : `https:${cfThumb}`;
      else if (ytid) thumb = `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`;
      return { title, desc, ytid, mp4, thumb, tags: Array.isArray(f.tags) ? f.tags : [] };
    });

    const PAGE_SIZE = 8;
    let rendered = 0;

    const moreWrap = document.createElement('div');
    moreWrap.id = 'featured-actions';
    moreWrap.style = 'text-align:center;margin-top:16px;';
    const moreLink = document.createElement('a');
    moreLink.id = 'featured-more';
    moreLink.href = 'videos.html';
    moreLink.className = 'video-more-btn';
    moreLink.textContent = '所有節目';
    moreLink.style = 'padding:10px 16px;border-radius:10px;border:0;background:#0a5bfd;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.08);display:inline-block;text-decoration:none;';
    moreWrap.appendChild(moreLink);
    container.after(moreWrap);

    function renderNextPage() {
      const slice = items.slice(rendered, rendered + PAGE_SIZE);
      if (!slice.length) return;
      const frag = document.createDocumentFragment();
      slice.forEach(v => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
          <div class="video-thumb" style="aspect-ratio:16/9;width:100%;overflow:hidden;border-radius:14px;background:var(--card-bg);">
            ${
              v.thumb
                ? `<img src="${v.thumb}" alt="${escapeHtml(v.title)}" style="width:100%;height:100%;object-fit:cover;display:block;"
                    onerror="this.onerror=null;this.src='${v.ytid ? `https://i.ytimg.com/vi/${v.ytid}/hqdefault.jpg` : ''}';">`
                : `<div style="width:100%;height:100%;background:var(--card-bg);"></div>`
            }
          </div>
          <div class="video-content">
            ${v.tags?.length ? `<div class="video-tags">${v.tags.join(' / ')}</div>` : ``}
            <div class="video-title">${escapeHtml(limitText(v.title || '未命名影片', 20))}</div>
            ${v.desc ? `<div class="video-desc">${escapeHtml(limitText(v.desc, 30))}</div>` : ``}
            ${
              v.ytid
                ? `<button class="video-cta" data-type="youtube" data-videoid="${v.ytid}">立即觀看</button>`
                : (v.mp4 ? `<a class="video-cta" href="${v.mp4}" target="_blank" rel="noopener">播放 MP4</a>` : ``)
            }
          </div>`;
        frag.appendChild(card);
      });
      container.appendChild(frag);
      rendered += slice.length;
      moreWrap.style.display = items.length ? '' : 'none';
    }

    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML = `<p style="color:#999;">目前無法載入精選節目。</p>`;
      moreWrap.style.display = 'none';
    } else {
      renderNextPage();
    }
  } catch (err) {
    console.error('Contentful 連線失敗（featured）:', err);
    container.innerHTML = `<p style="color:#999;">目前無法載入精選節目。</p>`;
  }
}

/* ===================================================
   首頁：即將播出 Spotlight (v2.2w)
   容器：#schedule-spotlight（不存在就跳過）
   =================================================== */
function UpNext_v22w() {
  const grid = byId('schedule-spotlight');
  if (!grid) return;

  injectSpotlightStyles();
  grid.innerHTML = `<div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div>`;

  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const oneLine = s => (s || '').replace(/\s+/g, ' ').trim();
  const ellipsis = (s, n) => { s = oneLine(s); return s.length > n ? s.slice(0, n).trim() + '…' : s; };
  const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const BLOCK_START = { '00-06': 0, '06-12': 6, '12-18': 12, '18-24': 18 };
  const BLOCK_LABEL = { '00-06': '00–06', '06-12': '06–12', '12-18': '12–18', '18-24': '18–24' };
  const BLOCK_CLASS = { '00-06': 'blk-00', '06-12': 'blk-06', '12-18': 'blk-12', '18-24': 'blk-18' };
  const normalizeBlock = (v) => {
    if (!v) return '';
    v = String(v).trim().replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, '');
    const map = { '0-6': '00-06', '00-6': '00-06', '6-12': '06-12', '12-18': '12-18', '18-24': '18-24' };
    return map[v] || v;
  };
  const fmtDate = (d) => {
    const w = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][d.getDay()];
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${m}.${dd} ${w}`;
  };
  const bestThumb = (vf, field) => {
    const u = vf?.[field]?.fields?.file?.url;
    if (u) return u.startsWith('http') ? u : ('https:' + u);
    const yid = vf?.youTubeId || vf?.youtubeId || vf?.YouTubeID;
    if (yid) return `https://i.ytimg.com/vi/${yid}/hqdefault.jpg`;
    return 'https://picsum.photos/1200/675?blur=2';
    };

  contentfulClient.getEntries({ content_type: 'scheduleItem', include: 2, limit: 1000, order: 'fields.airDate' })
    .then(res => {
      const items = res.items || [];
      if (!items.length) return showEmpty();

      const sample = items.find(x => x?.fields) || items[0];
      const keys = Object.keys(sample.fields || {});
      const guessKey = (tester) => {
        for (const k of keys) {
          let ok = 0;
          for (const it of items) { if (tester(it.fields?.[k])) { ok++; if (ok >= 3) break; } }
          if (ok >= 3) return k;
        }
        return null;
      };
      const FIELD = {
        schedule: {
          title: 'title',
          airDate: guessKey(v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) || 'airDate',
          block: guessKey(v => typeof v === 'string' && /(\d{1,2}\s*[-–]\s*\d{1,2})/.test(v)) || 'block',
          slotIndex: guessKey(v => typeof v === 'number' && v >= 0 && v <= 11) || 'slotIndex',
          video: guessKey(v => (v && typeof v === 'object' && v.fields) || (Array.isArray(v) && v[0]?.fields)) || 'video',
          isPremiere: guessKey(v => typeof v === 'boolean') || 'isPremiere'
        },
        video: { title: 'title', description: 'description', thumbnail: 'thumbnail', youtubeId: 'youTubeId' }
      };
      const anyVideo =
        (items.find(it => it.fields?.[FIELD.schedule.video]?.fields)?.fields?.[FIELD.schedule.video]?.fields) ||
        (items.find(it => Array.isArray(it.fields?.[FIELD.schedule.video]))?.fields?.[FIELD.schedule.video]?.[0]?.fields);
      if (anyVideo) {
        for (const k of Object.keys(anyVideo)) { if (anyVideo[k]?.fields?.file?.url) { FIELD.video.thumbnail = k; break; } }
        if (!('youTubeId' in anyVideo) && !('youtubeId' in anyVideo)) {
          FIELD.video.youtubeId = ['youTubeId', 'youtubeId', 'YouTubeID', 'ytId'].find(k => k in anyVideo) || FIELD.video.youtubeId;
        }
      }

      const now = new Date();
      const rows = [];
      items.forEach(it => {
        const f = it.fields || {};
        const air = f[FIELD.schedule.airDate];
        const blk = normalizeBlock(f[FIELD.schedule.block]);
        const slot = Number(f[FIELD.schedule.slotIndex] || 0);
        const vref = f[FIELD.schedule.video];
        if (!air || !blk || isNaN(slot) || !vref) return;

        const begin = new Date(air);
        begin.setHours(BLOCK_START[blk] ?? 0, 0, 0, 0);
        begin.setMinutes(begin.getMinutes() + slot * 30);
        if (begin <= now) return;

        const vf = (Array.isArray(vref) ? vref[0] : vref)?.fields;
        if (!vf) return;

        const title = vf[FIELD.video.title] || f[FIELD.schedule.title] || '未命名節目';
        const desc = vf[FIELD.video.description] || '';
        const img = bestThumb(vf, FIELD.video.thumbnail);

        rows.push({
          at: begin.getTime(),
          date: fmtDate(begin),
          time: hhmm(begin),
          block: blk,
          isPremiere: !!f[FIELD.schedule.isPremiere],
          title: oneLine(title),
          desc: ellipsis(desc, 72),
          img,
          href: 'videos.html'
        });
      });

      rows.sort((a, b) => a.at - b.at);
      const list = rows.slice(0, rows.length >= 4 ? 4 : Math.min(rows.length, 3));
      if (!list.length) return showEmpty();

      grid.innerHTML = list.map((r, i) => `
        <a class="spot-card ${BLOCK_CLASS[r.block] || 'blk-12'}" href="${r.href}" style="animation-delay:${i * 0.05}s">
          <img class="spot-img" loading="lazy" src="${r.img}"
               onerror="this.onerror=null;this.src='https://picsum.photos/1200/675?blur=2';" alt="">
          <div class="spot-grad"></div>
          <div class="spot-chip spot-time">${r.date} · ${r.time}</div>
          <div class="spot-chip spot-block">${BLOCK_LABEL[r.block] || ''}</div>
          ${r.isPremiere ? `<div class="spot-badge">首播</div>` : ``}
          <div class="spot-meta">
            <div class="spot-title">${esc(r.title)}</div>
            <div class="spot-desc">${esc(r.desc)}</div>
          </div>
        </a>
      `).join('');
    })
    .catch(err => { console.error('[upnext] load error', err); showEmpty(); });

  function showEmpty() {
    grid.innerHTML = `
      <div class="spot-empty">
        目前沒有即將播出的節目
        <a class="spot-btn" href="schedule.html">查看完整節目表</a>
      </div>`;
  }
  function injectSpotlightStyles() {
    const id = 'upnext-v2-style';
    if (byId(id)) return;
    const css = document.createElement('style'); css.id = id;
    css.textContent = `
      .schedule-spotlight-grid{display:grid;gap:20px;grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(min-width:1400px){.schedule-spotlight-grid{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:900px){.schedule-spotlight-grid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:640px){.schedule-spotlight-grid{grid-template-columns:1fr}}
      .spot-card{position:relative;display:block;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,.06);
                 box-shadow:0 10px 24px rgba(0,0,0,.06);transform:translateY(6px);opacity:0;animation:upfade .32s ease forwards}
      @media(prefers-color-scheme:dark){.spot-card{border-color:rgba(255,255,255,.12);box-shadow:0 14px 32px rgba(0,0,0,.25)}}
      .spot-card:hover{transform:translateY(0) scale(1.01)}
      .spot-img{width:100%;aspect-ratio:16/9;height:auto;object-fit:cover;display:block;filter:brightness(.94)}
      .spot-grad{position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,.55) 100%)}
      .spot-meta{position:absolute;left:16px;right:16px;bottom:14px;color:#fff;overflow:hidden;text-shadow:0 1px 4px rgba(0,0,0,.35)}
      .spot-title{font-weight:800;font-size:18px;line-height:1.28;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .spot-desc{opacity:.95;font-size:13px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      @media(max-width:640px){.spot-desc{display:none}}
      .spot-chip{position:absolute;padding:6px 10px;border-radius:999px;font-weight:900;font-size:12px;color:#fff;
                 backdrop-filter:saturate(140%) blur(4px);border:1px solid rgba(255,255,255,.22)}
      .spot-time{left:12px;bottom:12px;background:rgba(8,8,8,.45)}
      .spot-block{right:12px;top:12px}
      .spot-badge{position:absolute;left:12px;top:12px;background:rgba(224,180,106,.95);color:#111;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;border:1px solid rgba(0,0,0,.2)}
      .blk-00 .spot-block{background:linear-gradient(135deg,#4b79a1,#283e51)}
      .blk-06 .spot-block{background:linear-gradient(135deg,#2ea043,#0f5132)}
      .blk-12 .spot-block{background:linear-gradient(135deg,#d39e38,#8c6c1a)}
      .blk-18 .spot-block{background:linear-gradient(135deg,#2563eb,#0f1e5a)}
      .spot-skel{aspect-ratio:16/9;border-radius:20px;background:linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,.1), rgba(0,0,0,.05));animation:sk 1.2s ease-in-out infinite alternate}
      @media(prefers-color-scheme:dark){.spot-skel{background:linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.1), rgba(255,255,255,.06))}}
      .spot-empty{grid-column:1/-1;padding:22px;border:1px dashed rgba(0,0,0,.18);border-radius:14px;text-align:center}
      .spot-btn{margin-left:8px;display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.22);text-decoration:none;font-weight:800}
      @keyframes sk{to{filter:brightness(1.15)}}
      @keyframes upfade{to{opacity:1;transform:translateY(0)}}
    `;
    document.head.appendChild(css);
  }
}

/* ===================================================
   首頁：今日節目表（簡化穩定版）
   容器：#schedule-list + #currentMonthDay/#currentDayOfWeek/#currentTime
   =================================================== */
let scheduleData = null;
let currentTimeUpdateInterval = null;

async function loadScheduleData() {
  try {
    const t = getTaiwanTime();
    const today = t.toISOString().split('T')[0];
    const nextMonthFirst = new Date(t.getFullYear(), t.getMonth() + 1, 1).toISOString().split('T')[0];

    const res = await contentfulClient.getEntries({
      content_type: 'scheduleItem',
      'fields.airDate[gte]': today,
      'fields.airDate[lt]': nextMonthFirst,
      order: 'fields.airDate',
      include: 2
    });

    const todayPrograms = (res.items || [])
      .filter(it => it.fields?.airDate === today)
      .map(it => ({
        time: it.fields.airTime || it.fields.播出時間 || '00:00',
        title: it.fields.title || it.fields.節目標題 || '未命名節目',
        duration: (it.fields.duration || it.fields.節目時長 || 60).toString(),
        category: it.fields.category || it.fields.節目分類 || '旅遊節目',
        description: it.fields.description || it.fields.節目描述 || '',
        thumbnail:
          it.fields.thumbnail?.fields?.file?.url
            ? (it.fields.thumbnail.fields.file.url.startsWith('http') ? it.fields.thumbnail.fields.file.url : `https:${it.fields.thumbnail.fields.file.url}`)
            : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop',
        youtubeId: it.fields.youtubeId || it.fields.YouTubeID || ''
      }));

    scheduleData = {
      today: {
        date: today,
        dayOfWeek: getDayOfWeek(t),
        month: `${t.getMonth() + 1}月`,
        day: `${t.getDate()}日`,
        schedule: todayPrograms
      }
    };
    updateScheduleDisplay();
  } catch (e) {
    console.warn('Contentful 載入節目表失敗，使用預設資料', e);
    const t = getTaiwanTime();
    scheduleData = {
      today: {
        date: t.toISOString().split('T')[0],
        dayOfWeek: getDayOfWeek(t),
        month: `${t.getMonth() + 1}月`,
        day: `${t.getDate()}日`,
        schedule: getDefaultSchedule(t.toISOString().split('T')[0])
      }
    };
    updateScheduleDisplay();
  }
}

function updateScheduleDisplay() {
  if (!scheduleData) return;
  const { today } = scheduleData;

  const monthDayEl = byId('currentMonthDay');
  const dayOfWeekEl = byId('currentDayOfWeek');
  const currentTimeEl = byId('currentTime');
  const listEl = byId('schedule-list');

  const t = getTaiwanTime();
  if (monthDayEl) monthDayEl.textContent = `${t.getMonth() + 1}月${t.getDate()}日`;
  if (dayOfWeekEl) dayOfWeekEl.textContent = getDayOfWeek(t);
  if (currentTimeEl) currentTimeEl.textContent = getCurrentTimeString();

  if (!listEl) return;
  listEl.innerHTML = '';
  const visible = today.schedule.filter(shouldShowProgram);
  visible.forEach((p) => {
    const status = getProgramStatus(p);
    const isNow = status === 'now-playing';
    const isUpcoming = status === 'upcoming';
    const item = document.createElement('div');
    item.className = `schedule-item ${isNow ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''}`;
    item.innerHTML = `
      <div class="schedule-thumbnail">
        <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}"
             onerror="this.src='https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop'">
        <div class="schedule-time">${p.time}</div>
      </div>
      <div class="schedule-content">
        <div class="program-title">${escapeHtml(p.title)}</div>
        <div class="program-description">${escapeHtml(p.description)}</div>
        <div class="schedule-meta">
          <div class="program-category">${escapeHtml(p.category)}</div>
          <div class="schedule-duration">${p.duration}分鐘</div>
        </div>
      </div>
    `;
    listEl.appendChild(item);
  });
}

/* 節目狀態＆過濾 */
function getProgramStatus(program) {
  const t = getTaiwanTime();
  const nowMin = t.getHours() * 60 + t.getMinutes();
  const [hh, mm] = (program.time || '00:00').split(':').map(Number);
  const start = hh * 60 + mm;
  const end = start + parseInt(program.duration || 60, 10);
  if (nowMin >= start && nowMin < end) return 'now-playing';
  if (nowMin < start) return 'upcoming';
  return 'ended';
}
function shouldShowProgram(program) {
  const s = getProgramStatus(program);
  return s === 'now-playing' || s === 'upcoming';
}

/* 簡化版預設節目表（Contentful 失敗時） */
function getDefaultSchedule(dateStr) {
  // 超精簡：只給 4 筆示意
  return [
    { time: '08:00', title: '週末探險 - 冰島極光攝影之旅', duration: '60', category: '極地旅遊', description: '在冰島追尋北極光的神秘蹤跡。', thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=225&fit=crop' },
    { time: '09:00', title: '城市漫步 - 東京霓虹街區', duration: '45', category: '亞洲旅遊', description: '穿梭於東京的潮流街區與巷弄。', thumbnail: 'https://images.unsplash.com/photo-1526481280698-8fcc13fd6ae5?w=400&h=225&fit=crop' },
    { time: '10:00', title: '自然奇觀 - 阿爾卑斯山脈', duration: '60', category: '自然旅遊', description: '雲海山嵐，壯闊山勢盡收眼底。', thumbnail: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=400&h=225&fit=crop' },
    { time: '11:00', title: '城市天際線 - 杜拜黃金光影', duration: '45', category: '城市旅遊', description: '俯瞰中東之珠的輝煌建築群。', thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=225&fit=crop' },
  ];
}

/* 每秒更新時間＋跨日自動刷新 */
function startTimeUpdates() {
  if (currentTimeUpdateInterval) clearInterval(currentTimeUpdateInterval);
  currentTimeUpdateInterval = setInterval(() => {
    const currentDateTimeEl = byId('currentDateTime');
    if (currentDateTimeEl) {
      const t = getTaiwanTime();
      const month = t.getMonth() + 1;
      const day = t.getDate();
      const dayOfWeek = getDayOfWeek(t);
      const timeString = getCurrentTimeString();
      currentDateTimeEl.innerHTML = `台灣時間 <span class="flip-clock date">${month}月${day}日</span> <span class="flip-clock day">${dayOfWeek}</span> 現在時間 <span class="flip-clock time">${timeString}</span>`;
    }

    // 跨日檢查
    const t = getTaiwanTime();
    const currentDate = t.toISOString().split('T')[0];
    if (scheduleData && scheduleData.today && scheduleData.today.date !== currentDate) {
      console.log('檢測到日期改變，重新載入節目表');
      loadScheduleData();
      return;
    }

    // 每分鐘刷新一次節目高亮
    if (t.getSeconds() === 0) {
      updateScheduleDisplay();
    }
  }, 1000);
}

/* ===================================================
   所有節目頁：/videos
   - 容器容忍順序：#all-videos / #videos-list / #all-videos-list
   - 使用與首頁同一 contentfulClient
   =================================================== */
async function loadAllVideosPage() {
  const container =
    byId('all-videos') ||
    byId('videos-list') ||
    byId('all-videos-list');
  // 你的頁面如果用別的 id，也可以在這裡再加一個 byId('xxx')

  if (!container) return; // 不在 /videos 頁，跳過

  container.innerHTML = `<div style="color:#999;padding:12px;">讀取中…</div>`;
  try {
    const res = await contentfulClient.getEntries({
      content_type: 'video',
      order: '-sys.updatedAt',
      limit: 1000
    });

    const items = (res.items || []).map(it => {
      const f = it.fields || {};
      const title = f.影片標題 || f.title || '未命名影片';
      const desc = f.description || '';
      const ytid = f['YouTube ID'] || f.youTubeId || f.youtubeId || f.YouTubeID || '';
      let thumb = '';
      const cfThumb = f.thumbnail?.fields?.file?.url;
      if (cfThumb) thumb = cfThumb.startsWith('http') ? cfThumb : `https:${cfThumb}`;
      else if (ytid) thumb = `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`;
      return { title, desc, ytid, thumb };
    });

    if (!items.length) {
      container.innerHTML = `<div style="color:#999;padding:12px;">目前沒有節目。</div>`;
      return;
    }

    // 基礎卡片網格
    const grid = document.createElement('div');
    grid.style = 'display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));';
    items.forEach(v => {
      const card = document.createElement('div');
      card.style = 'border:1px solid rgba(0,0,0,.08);border-radius:12px;overflow:hidden;background:var(--card-bg)';
      card.innerHTML = `
        <div style="aspect-ratio:16/9;background:#111;overflow:hidden;">
          ${v.thumb
            ? `<img src="${v.thumb}" alt="${escapeHtml(v.title)}" style="width:100%;height:100%;object-fit:cover;display:block;"
                 onerror="this.onerror=null;this.src='${v.ytid ? `https://i.ytimg.com/vi/${v.ytid}/hqdefault.jpg` : ''}';">`
            : `<div style="width:100%;height:100%;background:#222;"></div>`
          }
        </div>
        <div style="padding:12px;">
          <div style="font-weight:800;margin-bottom:6px;">${escapeHtml(v.title)}</div>
          ${v.desc ? `<div style="font-size:13px;color:#777;line-height:1.5">${escapeHtml(v.desc)}</div>` : ``}
          ${v.ytid ? `<div style="margin-top:10px;">
            <button class="video-cta" data-type="youtube" data-videoid="${v.ytid}">立即觀看</button>
          </div>` : ``}
        </div>
      `;
      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
  } catch (err) {
    console.error('Contentful 連線失敗（/videos）：', err);
    container.innerHTML = `<div style="color:#c33;padding:12px;">載入影片失敗。</div>`;
  }
}

/* ---------- 保護：如果有舊程式使用 SS 物件，不讓它爆錯 ---------- */
window.SS = window.SS || {};
