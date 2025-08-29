// 避免文字有 HTML 特殊符號出錯
function escapeHtml(s='') {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// 初始化 Contentful client
const contentfulClient = contentful.createClient({
  space: 'os5wf90ljenp',
  accessToken: 'lODH-WLwHwVZv7O4rFdBWjSnrzaQWGD4koeOZ1Dypj0'
});

document.addEventListener('DOMContentLoaded', () => {
  // === 漢堡選單 ===
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sideMenu = document.getElementById('side-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const body = document.body;
  function toggleMenu() {
    sideMenu?.classList.toggle('active');
    menuOverlay?.classList.toggle('active');
    body.classList.toggle('menu-open');
  }
  hamburgerBtn?.addEventListener('click', toggleMenu);
  menuOverlay?.addEventListener('click', toggleMenu);

  // === 主題切換 ===
  const themeSwitcher = document.getElementById('theme-switcher');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) body.classList.add(savedTheme);
  else {
    const h = new Date().getHours();
    if (h >= 18 || h < 6) {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  }
  updateThemeIcon(body.classList.contains('dark-theme') ? 'dark-theme' : '');
  themeSwitcher?.addEventListener('click', e => {
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

  // Hero 影片由 media.js 處理

  // === 精選節目（每頁 8 個，支援查看更多；縮圖固定 16:9）===
  (async function loadFeaturedFromCF() {
    const container = document.getElementById('featured-videos');
    if (!container) return;

    // 取第一個有值的欄位
    const pick = (f, keys) => {
      for (const k of keys) {
        if (f && f[k] != null && f[k] !== '') return f[k];
      }
      return '';
    };

    // 文字長度限制：標題 20、描述 30
    const limitText = (txt, max) => !txt ? '' : (txt.length > max ? txt.slice(0, max) + '…' : txt);

    try {
      // 先多抓一些，之後在前端分頁（可視需要調大）
      const entries = await contentfulClient.getEntries({
        content_type: 'video',
        'fields.isFeatured': true,
        order: '-sys.updatedAt',
        limit: 100
      });

      const allItems = (entries.items || []).map(it => {
        const f = it.fields || {};
        const title = pick(f, ['影片標題','title']);
        const desc  = pick(f, ['精選推薦影片說明文字','description']);
        const ytid  = pick(f, ['YouTube ID','youTubeId']);
        const mp4   = pick(f, ['MP4 影片網址','mp4Url']);
        const tags  = Array.isArray(f.tags) ? f.tags : [];

        // 縮圖：優先 Contentful 圖，否則用 YouTube 預設圖
        let thumb = '';
        const cfThumb = f.thumbnail?.fields?.file?.url;
        if (cfThumb) thumb = cfThumb.startsWith('http') ? cfThumb : `https:${cfThumb}`;
        else if (ytid) thumb = `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`;

        return { title, desc, ytid, mp4, tags, thumb };
      });

      // 分頁渲染
      const PAGE_SIZE = 8;
      let rendered = 0;

      // 建立「所有節目 / 查看更多」連結（導到所有節目頁）
      const moreWrap = document.createElement('div');
      moreWrap.id = 'featured-actions';
      moreWrap.style = 'text-align:center;margin-top:16px;';

      const moreLink = document.createElement('a');
      moreLink.id = 'featured-more';
      moreLink.href = 'videos.html'; // 重點：直接連到所有節目頁
      moreLink.className = 'video-more-btn';
      moreLink.textContent = '所有節目'; // 如果你要顯示「查看更多」，把文字改回去即可
      moreLink.style = 'padding:10px 16px;border-radius:10px;border:0;background:#0a5bfd;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.08);display:inline-block;text-decoration:none;';
      moreWrap.appendChild(moreLink);
      container.after(moreWrap);

      function renderNextPage() {
        const slice = allItems.slice(rendered, rendered + PAGE_SIZE);
        if (!slice.length) return;

        const frag = document.createDocumentFragment();
        slice.forEach(v => {
          const card = document.createElement('div');
          card.className = 'video-card';
          card.innerHTML = `
            <div class="video-thumb" style="aspect-ratio:16/9; width:100%; overflow:hidden; border-radius:14px; background:var(--card-bg);">
              ${v.thumb ? `<img src="${v.thumb}" alt="${escapeHtml(v.title)}"
                  style="width:100%;height:100%;object-fit:cover;display:block;"
                  onerror="this.onerror=null;this.src='${v.ytid ? `https://i.ytimg.com/vi/${v.ytid}/hqdefault.jpg` : ''}';">`
                        : `<div style="width:100%;height:100%;background:var(--card-bg);"></div>`}
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

        // 顯示 / 隱藏「所有節目」連結：只要有資料就顯示
        moreWrap.style.display = allItems.length ? '' : 'none';
      }

      // 首次渲染
      container.innerHTML = '';
      if (allItems.length === 0) {
        container.innerHTML = `<p style="color:#999;">目前無法載入精選節目。</p>`;
        moreWrap.style.display = 'none';
      } else {
        renderNextPage(); // 第 1 頁
      }
    } catch (err) {
      console.error('Contentful 連線失敗（featured）：', err);
      if (container) container.innerHTML = `<p style="color:#999;">目前無法載入精選節目。</p>`;
    }
  })();
  
  /* ===== 即將播出 v2.2w｜標準版（自動偵測欄位 + 星期·時間 + 圖片 fallback）===== */
(function UpNext_v22w(){
  const grid = document.getElementById('schedule-spotlight');
  if (!grid) return;

  const cf = (typeof contentfulClient !== 'undefined') ? contentfulClient : null;
  if (!cf){ console.warn('[upnext] contentfulClient not found'); return; }

  // 先上樣式與骨架（避免閃白）
  injectLocalStyles();
  grid.innerHTML = `<div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div>`;

  // Utils
  const esc = s => String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const oneLine = s => (s||'').replace(/\s+/g,' ').trim();
  const ellipsis = (s,n)=>{ s = oneLine(s); return s.length>n ? s.slice(0,n).trim()+'…' : s; };
  const hhmm = d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const BLOCK_START = { '00-06':0,'06-12':6,'12-18':12,'18-24':18 };
  const BLOCK_LABEL = { '00-06':'00–06','06-12':'06–12','12-18':'12–18','18-24':'18–24' };
  const BLOCK_CLASS = { '00-06':'blk-00','06-12':'blk-06','12-18':'blk-12','18-24':'blk-18' };

  function normalizeBlock(v){
    if(!v) return '';
    v = String(v).trim().replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\s+/g,'');
    const map={ '0-6':'00-06','00-6':'00-06','6-12':'06-12','12-18':'12-18','18-24':'18-24' };
    return map[v]||v;
  }
  function fmtDate(d){
    const w = ['週日','週一','週二','週三','週四','週五','週六'][d.getDay()];
    const m  = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${m}.${dd} ${w}`;   // 例：08.19 週一
  }
  function bestThumb(vf, field){
    const u = vf?.[field]?.fields?.file?.url;
    if (u) return u.startsWith('http') ? u : ('https:'+u);
    const yid = vf?.youTubeId || vf?.youtubeId || vf?.YouTubeID;
    if (yid) return `https://i.ytimg.com/vi/${yid}/hqdefault.jpg`;
    return 'https://picsum.photos/1200/675?blur=2';
  }

  // 抓全部後在前端挑「未來的最近 3–4 筆」
  cf.getEntries({ content_type:'scheduleItem', include:2, limit:1000, order:'fields.airDate' })
    .then(res=>{
      const items = res.items||[];
      if (!items.length){ return showEmpty(); }

      // 自動偵測欄位 ID
      const sample = items.find(x=>x?.fields) || items[0];
      const keys = Object.keys(sample.fields||{});
      const guessKey = (tester) => {
        for (const k of keys){
          let ok=0; for (const it of items){ if (tester(it.fields?.[k])) { ok++; if (ok>=3) break; } }
          if (ok>=3) return k;
        }
        return null;
      };
      const FIELD = {
        schedule: {
          title: 'title',
          airDate:    guessKey(v=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}/.test(v)) || 'airDate',
          block:      guessKey(v=>typeof v==='string' && /(\d{1,2}\s*[-–]\s*\d{1,2})/.test(v)) || 'block',
          slotIndex:  guessKey(v=>typeof v==='number' && v>=0 && v<=11) || 'slotIndex',
          video:      guessKey(v=> (v && typeof v==='object' && v.fields) || (Array.isArray(v) && v[0]?.fields)) || 'video',
          isPremiere: guessKey(v=>typeof v==='boolean') || 'isPremiere'
        },
        video: { title:'title', description:'description', thumbnail:'thumbnail', youtubeId:'youTubeId' }
      };
      // 找出影片裡真正裝 Asset 的欄位，以及可能的 youtubeId 欄位
      const anyVideo =
        (items.find(it=>it.fields?.[FIELD.schedule.video]?.fields)?.fields?.[FIELD.schedule.video]?.fields) ||
        (items.find(it=>Array.isArray(it.fields?.[FIELD.schedule.video]))?.fields?.[FIELD.schedule.video]?.[0]?.fields);
      if (anyVideo){
        for (const k of Object.keys(anyVideo)){ if (anyVideo[k]?.fields?.file?.url){ FIELD.video.thumbnail = k; break; } }
        if (!('youTubeId' in anyVideo) && !('youtubeId' in anyVideo)){
          FIELD.video.youtubeId = ['youTubeId','youtubeId','YouTubeID','ytId'].find(k=>k in anyVideo) || FIELD.video.youtubeId;
        }
      }
      console.info('[upnext] keys:', FIELD);

      // 整理 rows
      const now = new Date();
      const rows = [];
      items.forEach(it=>{
        const f = it.fields||{};
        const air = f[FIELD.schedule.airDate];
        const blk = normalizeBlock(f[FIELD.schedule.block]);
        const slot = Number(f[FIELD.schedule.slotIndex]||0);
        const vref = f[FIELD.schedule.video];
        if (!air || !blk || isNaN(slot) || !vref) return;

        const begin = new Date(air);
        begin.setHours(BLOCK_START[blk] ?? 0, 0, 0, 0);
        begin.setMinutes(begin.getMinutes() + slot*30);
        if (begin <= now) return;

        const vf = (Array.isArray(vref) ? vref[0] : vref)?.fields;
        if (!vf) return;

        const title = vf[FIELD.video.title] || f[FIELD.schedule.title] || '未命名節目';
        const desc  = vf[FIELD.video.description] || '';
        const img   = bestThumb(vf, FIELD.video.thumbnail);

        rows.push({
          at: begin.getTime(),
          date: fmtDate(begin),             // ★ 含星期
          time: hhmm(begin),
          block: blk,
          isPremiere: !!f[FIELD.schedule.isPremiere],
          title: oneLine(title),
          desc:  ellipsis(desc, 72),
          img,
          href: 'videos.html'
        });
      });

      rows.sort((a,b)=>a.at-b.at);
      const list = rows.slice(0, rows.length>=4 ? 4 : Math.min(rows.length,3));
      if (!list.length) return showEmpty();

      grid.innerHTML = list.map((r,i)=>`
        <a class="spot-card ${BLOCK_CLASS[r.block]||'blk-12'}" href="${r.href}" style="animation-delay:${i*0.05}s">
          <img class="spot-img" loading="lazy" src="${r.img}"
               onerror="this.onerror=null;this.src='https://picsum.photos/1200/675?blur=2';" alt="">
          <div class="spot-grad"></div>
          <div class="spot-chip spot-time">${r.date} · ${r.time}</div>   <!-- ★ 星期 · 時間 -->
          <div class="spot-chip spot-block">${BLOCK_LABEL[r.block]||''}</div>
          ${r.isPremiere ? `<div class="spot-badge">首播</div>` : ``}
          <div class="spot-meta">
            <div class="spot-title">${esc(r.title)}</div>
            <div class="spot-desc">${esc(r.desc)}</div>
          </div>
        </a>
      `).join('');
    })
    .catch(err=>{ console.error('[upnext] load error', err); showEmpty(); });

  function showEmpty(){
    grid.innerHTML = `
      <div class="spot-empty">
        目前沒有即將播出的節目
        <a class="spot-btn" href="schedule.html">查看完整節目表</a>
      </div>`;
  }

  function injectLocalStyles(){
    const old = document.getElementById('upnext-v2-style'); if (old) old.remove();
    const css = document.createElement('style'); css.id='upnext-v2-style';
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
})();




  // 全螢幕播放器由 media.js 處理

  // === 節目時間表功能（Contentful 版本）===
  let scheduleData = null;
  let currentTimeUpdateInterval = null;

  // 載入節目時間表數據
  async function loadScheduleData() {
    try {
      // 獲取台灣時間
      const taiwanTime = getTaiwanTime();
      const currentMonth = taiwanTime.toISOString().slice(0, 7); // YYYY-MM 格式
      const today = taiwanTime.toISOString().split('T')[0]; // YYYY-MM-DD 格式
      
      console.log('正在載入節目表，月份:', currentMonth, '日期:', today);
      
      // 檢查是否需要重新載入（日期改變）
      if (scheduleData && scheduleData.today && scheduleData.today.date === today) {
        console.log('節目表日期未改變，無需重新載入');
        return;
      }
      
      // 嘗試從 Contentful 載入月度節目表
      try {
        const response = await contentfulClient.getEntries({
          content_type: 'scheduleItem',
          'fields.airDate[gte]': today,
          'fields.airDate[lt]': new Date(taiwanTime.getFullYear(), taiwanTime.getMonth() + 1, 1).toISOString().split('T')[0],
          order: 'fields.airDate,fields.airTime',
          include: 2
        });
        
        if (response.items && response.items.length > 0) {
          // 過濾今天的節目
          const todayPrograms = response.items.filter(item => 
            item.fields.airDate === today
          ).map(item => ({
            time: item.fields.airTime || item.fields.播出時間 || '00:00',
            title: item.fields.title || item.fields.節目標題 || '未命名節目',
            duration: (item.fields.duration || item.fields.節目時長 || 60).toString(),
            category: item.fields.category || item.fields.節目分類 || '旅遊節目',
            description: item.fields.description || item.fields.節目描述 || '',
            thumbnail: item.fields.thumbnail?.fields?.file?.url || 
                      item.fields.節目縮圖?.fields?.file?.url || 
                      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop',
            youtubeId: item.fields.youtubeId || item.fields.YouTubeID || '',
            status: item.fields.status || item.fields.節目狀態 || '',
            tags: item.fields.tags || []
          }));
          
          scheduleData = {
            today: {
              date: today,
              dayOfWeek: getDayOfWeek(taiwanTime),
              month: `${taiwanTime.getMonth() + 1}月`,
              day: `${taiwanTime.getDate()}日`,
              schedule: todayPrograms
            }
          };
          
          console.log('成功從 Contentful 載入節目表，共', scheduleData.today.schedule.length, '個節目');
        } else {
          // 如果沒有找到節目，使用預設數據
          scheduleData = {
            today: {
              date: today,
              dayOfWeek: getDayOfWeek(taiwanTime),
              month: `${taiwanTime.getMonth() + 1}月`,
              day: `${taiwanTime.getDate()}日`,
              schedule: getDefaultSchedule(today)
            }
          };
          console.log('Contentful 中沒有找到節目，使用預設節目表');
        }
      } catch (contentfulError) {
        console.log('Contentful 載入失敗，使用預設節目表:', contentfulError.message);
        // 使用預設數據
        scheduleData = {
          today: {
            date: today,
            dayOfWeek: getDayOfWeek(taiwanTime),
            month: `${taiwanTime.getMonth() + 1}月`,
            day: `${taiwanTime.getDate()}日`,
            schedule: getDefaultSchedule(today)
          }
        };
      }
      
      updateScheduleDisplay();
      startTimeUpdates();
      
    } catch (error) {
      console.error('載入節目表失敗:', error);
      
      // 如果載入失敗，使用預設數據（台灣時間）
      const taiwanTime = getTaiwanTime();
      scheduleData = {
        today: {
          date: taiwanTime.toISOString().split('T')[0],
          dayOfWeek: getDayOfWeek(taiwanTime),
          month: `${taiwanTime.getMonth() + 1}月`,
          day: `${taiwanTime.getDate()}日`,
          schedule: getDefaultSchedule(taiwanTime.toISOString().split('T')[0])
        }
      };
      updateScheduleDisplay();
      startTimeUpdates();
    }
  }

  // 預設節目表（當 Contentful 沒有資料時使用）
  function getDefaultSchedule(date) {
    // 根據日期生成不同的節目表
    const dayOfWeek = new Date(date).getDay(); // 0=週日, 1=週一, ..., 6=週六
    
    // 週末特別節目表
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return [
        {
          time: "06:00",
          title: "週末特輯 - 日本京都楓葉季",
          duration: "60",
          category: "亞洲旅遊",
          description: "在京都的楓葉季節，體驗日本傳統文化的優雅與寧靜",
          thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop"
        },
        {
          time: "07:00",
          title: "週末美食 - 法國巴黎米其林餐廳",
          duration: "45",
          category: "美食旅遊",
          description: "探索巴黎最頂級的米其林餐廳，品嚐法式美食的精髓",
          thumbnail: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=225&fit=crop"
        },
        {
          time: "08:00",
          title: "週末探險 - 冰島極光攝影之旅",
          duration: "60",
          category: "極地旅遊",
          description: "在冰島追尋北極光的神秘蹤跡，捕捉最美麗的極光瞬間",
          thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=225&fit=crop"
        },
        {
          time: "09:00",
          title: "週末文化 - 義大利佛羅倫斯文藝復興",
          duration: "45",
          category: "歐洲旅遊",
          description: "在文藝復興的發源地，欣賞米開朗基羅與達文西的傑作",
          thumbnail: "https://images.unsplash.com/photo-1502602898534-47d1c0c0b131?w=400&h=225&fit=crop"
        },
                {
          time: "10:00",
          title: "週末自然 - 澳洲大堡礁海底世界",
          duration: "60",
          category: "自然旅遊",
          description: "潛入大堡礁的海底世界，探索珊瑚礁的生態奧秘",
          thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop"
        },
        {
          time: "11:00",
          title: "週末冒險 - 秘魯馬丘比丘印加文明",
          duration: "45",
          category: "文化旅遊",
          description: "登上印加帝國的失落之城，感受安地斯山脈的神秘",
          thumbnail: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=225&fit=crop"
        },
        {
          time: "12:00",
          title: "週末奢華 - 杜拜哈里發塔夜景",
          duration: "60",
          category: "城市旅遊",
          description: "從世界最高建築俯瞰杜拜的璀璨夜景",
          thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=225&fit=crop"
        }
      ];
    }
    
    // 平日節目表
    return [
      {
        time: "06:00",
        title: "早安世界 - 日本東京晨間漫步",
        duration: "60",
        category: "亞洲旅遊",
        description: "跟著我們一起探索東京的早晨，從築地市場到淺草寺的寧靜時光",
        thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop"
      },
      {
        time: "07:00",
        title: "世界廚房 - 義大利托斯卡尼美食之旅",
        duration: "45",
        category: "美食旅遊",
        description: "深入托斯卡尼鄉村，品嚐最道地的義大利美食與美酒",
        thumbnail: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=225&fit=crop"
      },
      {
        time: "08:00",
        title: "極地探險 - 加拿大黃刀鎮極光之旅",
        duration: "60",
        category: "極地旅遊",
        description: "在零下40度的黃刀鎮，追尋北極光的神秘蹤跡",
        thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=225&fit=crop"
      },
      {
        time: "09:00",
        title: "城市漫步 - 巴黎塞納河畔的浪漫",
        duration: "45",
        category: "歐洲旅遊",
        description: "沿著塞納河漫步，感受花都巴黎的浪漫情懷",
        thumbnail: "https://images.unsplash.com/photo-1502602898534-47d1c0c0b131?w=400&h=225&fit=crop"
      },
      {
        time: "10:00",
        title: "自然奇觀 - 紐西蘭米佛峽灣",
        duration: "60",
        category: "自然旅遊",
        description: "探索世界第八大奇觀，米佛峽灣的壯麗景色",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop"
      },
      {
        time: "11:00",
        title: "文化之旅 - 摩洛哥馬拉喀什市集",
        duration: "45",
        category: "文化旅遊",
        description: "穿梭在馬拉喀什的傳統市集中，體驗摩洛哥的異國風情",
        thumbnail: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&h=225&fit=crop"
      },
      {
        time: "12:00",
        title: "午間精選 - 泰國清邁古城巡禮",
        duration: "60",
        category: "亞洲旅遊",
        description: "漫步清邁古城，感受泰北蘭納王朝的歷史文化",
        thumbnail: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&h=225&fit=crop"
      },
      {
        time: "13:00",
        title: "海島假期 - 馬爾地夫水上別墅",
        duration: "45",
        category: "海島旅遊",
        description: "在馬爾地夫的透明海水中，體驗最奢華的水上別墅生活",
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop"
      },
      {
        time: "14:00",
        title: "歷史探索 - 埃及金字塔之謎",
        duration: "60",
        category: "歷史旅遊",
        description: "深入探索古埃及金字塔的建造之謎與法老文明",
        thumbnail: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&h=225&fit=crop"
      },
      {
        time: "15:00",
        title: "冒險之旅 - 秘魯馬丘比丘",
        duration: "45",
        category: "冒險旅遊",
        description: "登上印加帝國的失落之城，感受安地斯山脈的神秘",
        thumbnail: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=225&fit=crop"
      },
      {
        time: "16:00",
        title: "藝術之旅 - 義大利佛羅倫斯文藝復興",
        duration: "60",
        category: "藝術旅遊",
        description: "在文藝復興的發源地，欣賞米開朗基羅與達文西的傑作",
        thumbnail: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=225&fit=crop"
      },
      {
        time: "17:00",
        title: "黃昏時光 - 希臘聖托里尼日落",
        duration: "45",
        category: "歐洲旅遊",
        description: "在愛琴海的夕陽下，欣賞聖托里尼島的絕美日落",
        thumbnail: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=225&fit=crop"
      },
      {
        time: "18:00",
        title: "晚間精選 - 日本京都楓葉季",
        duration: "60",
        category: "亞洲旅遊",
        description: "在京都的楓葉季節，體驗日本傳統文化的優雅",
        thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop"
      },
      {
        time: "19:00",
        title: "夜間探索 - 杜拜哈里發塔夜景",
        duration: "45",
        category: "城市旅遊",
        description: "從世界最高建築俯瞰杜拜的璀璨夜景",
        thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=225&fit=crop"
      },
      {
        time: "20:00",
        title: "特別節目 - 北極圈極光攝影",
        duration: "60",
        category: "攝影旅遊",
        description: "跟隨專業攝影師，捕捉北極光最震撼的瞬間",
        thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=225&fit=crop"
      },
      {
        time: "21:00",
        title: "文化之夜 - 印度泰姬瑪哈陵",
        duration: "45",
        category: "文化旅遊",
        description: "在月光下欣賞世界七大奇觀之一的泰姬瑪哈陵",
        thumbnail: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=225&fit=crop"
      },
      {
        time: "22:00",
        title: "深夜放送 - 澳洲大堡礁海底世界",
        duration: "60",
        category: "海洋旅遊",
        description: "潛入大堡礁的海底世界，探索珊瑚礁的生態奧秘",
        thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=225&fit=crop"
      },
      {
        time: "23:00",
        title: "午夜時光 - 冰島藍湖溫泉",
        duration: "45",
        category: "溫泉旅遊",
        description: "在冰島的藍湖溫泉中，享受北極圈下的溫暖時光",
        thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=225&fit=crop"
      },
      {
        time: "00:00",
        title: "深夜精選 - 巴西里約熱內盧嘉年華",
        duration: "60",
        category: "節慶旅遊",
        description: "感受里約嘉年華的熱情與活力，體驗巴西的狂歡文化",
        thumbnail: "https://images.unsplash.com/photo-1516307964725-815d34eb1d17?w=400&h=225&fit=crop"
      }
    ];
  }

  // 更新節目時間表顯示
  function updateScheduleDisplay() {
    if (!scheduleData) return;

    const { today } = scheduleData;
    
    // 更新日期顯示（使用台灣時間）
    const monthDayEl = document.getElementById('currentMonthDay');
    const dayOfWeekEl = document.getElementById('currentDayOfWeek');
    const currentTimeEl = document.getElementById('currentTime');
    const scheduleListEl = document.getElementById('schedule-list');

    // 獲取台灣時間的日期信息
    const taiwanTime = getTaiwanTime();
    const currentMonth = taiwanTime.getUTCMonth() + 1;
    const currentDay = taiwanTime.getUTCDate();
    const currentDayOfWeek = getDayOfWeek(taiwanTime);

    if (monthDayEl) monthDayEl.textContent = `${currentMonth}月${currentDay}日`;
    if (dayOfWeekEl) dayOfWeekEl.textContent = currentDayOfWeek;
    if (currentTimeEl) currentTimeEl.textContent = getCurrentTimeString();

    // 更新節目列表（現代電視台設計）
    if (scheduleListEl && today.schedule) {
      scheduleListEl.innerHTML = '';
      
      // 過濾節目：只顯示當前和未來節目
      const visiblePrograms = today.schedule.filter(shouldShowProgram);
      console.log('節目表數據:', today.schedule);
      console.log('可見節目:', visiblePrograms);
      
      visiblePrograms.forEach((program, index) => {
        const status = getProgramStatus(program);
        const isCurrent = status === 'now-playing';
        const isUpcoming = status === 'upcoming';
        
        const scheduleItem = document.createElement('div');
        scheduleItem.className = `schedule-item ${isCurrent ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''}`;
        
        // 創建現代電視台風格的卡片內容
        scheduleItem.innerHTML = `
          <div class="schedule-thumbnail">
            <img src="${program.thumbnail || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop'}" 
                 alt="${escapeHtml(program.title)}" 
                 onerror="this.src='https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop';">
            <div class="schedule-time">${program.time}</div>
            
            ${program.isPremiere ? '<div class="premiere-badge">首播</div>' : ''}
            ${program.isSpecial ? '<div class="special-badge">特別節目</div>' : ''}
          </div>
          <div class="schedule-content">
            <div class="program-title">${escapeHtml(program.title)}</div>
            <div class="program-description">${escapeHtml(program.description)}</div>
            <div class="schedule-meta">
              <div class="program-category">${escapeHtml(program.category)}</div>
              <div class="schedule-duration">${program.duration}分鐘</div>
            </div>
          </div>
        `;
        
        // 添加點擊事件
        scheduleItem.addEventListener('click', () => {
          console.log('播放節目:', program.title);
          
          if (program.youtubeId) {
            openFullscreenPlayer(program.youtubeId);
          }
        });
        
        scheduleListEl.appendChild(scheduleItem);
      });
      
            // 更新滾動指示器和導航
      addScrollIndicator(scheduleListEl, visiblePrograms.length);
      initScheduleNavigation(scheduleListEl, visiblePrograms.length);
    }
  }

  // 添加滾動指示器
  function addScrollIndicator(container, itemCount) {
    // 移除現有的指示器
    const existingIndicator = document.querySelector('.schedule-scroll-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // 如果節目數量少於等於4個，不需要指示器
    if (itemCount <= 4) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'schedule-scroll-indicator';
    
    // 計算需要多少個指示點
    const dotsCount = Math.ceil(itemCount / 4);
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.className = `scroll-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        // 滾動到對應位置
        const scrollPosition = i * 4 * 336; // 4個卡片 * 卡片寬度(320px + 16px gap)
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
        
        // 更新活動指示點
        document.querySelectorAll('.scroll-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
      indicator.appendChild(dot);
    }
    
    // 監聽滾動事件更新指示點
    container.addEventListener('scroll', () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = 336; // 卡片寬度 + gap
      const activeIndex = Math.round(scrollLeft / cardWidth);
      
      document.querySelectorAll('.scroll-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === Math.floor(activeIndex / 4));
      });
    });
    
    container.parentNode.appendChild(indicator);
  }

  // 初始化箭頭導航
  function initScheduleNavigation(container, itemCount) {
    const leftArrow = document.getElementById('schedule-nav-left');
    const rightArrow = document.getElementById('schedule-nav-right');
    
    if (!leftArrow || !rightArrow) return;
    
    // 如果節目數量少於等於4個，隱藏箭頭
    if (itemCount <= 4) {
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
      return;
    }
    
    // 顯示箭頭
    leftArrow.style.display = 'flex';
    rightArrow.style.display = 'flex';
    
    // 更新箭頭狀態
    function updateArrowStates() {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      // 左箭頭：如果已經滾動到最左邊，則禁用
      if (scrollLeft <= 0) {
        leftArrow.classList.add('disabled');
      } else {
        leftArrow.classList.remove('disabled');
      }
      
      // 右箭頭：如果已經滾動到最右邊，則禁用
      if (scrollLeft >= scrollWidth - clientWidth - 1) {
        rightArrow.classList.add('disabled');
      } else {
        rightArrow.classList.remove('disabled');
      }
    }
    
    // 自動滾動功能
    let autoScrollTimer = null;
    const autoScrollDelay = 300; // 自動滾動延遲時間（毫秒）
    
    // 左箭頭事件
    leftArrow.addEventListener('mouseenter', () => {
      if (leftArrow.classList.contains('disabled')) return;
      
      autoScrollTimer = setInterval(() => {
        if (leftArrow.classList.contains('disabled')) {
          clearInterval(autoScrollTimer);
          return;
        }
        
        const currentScroll = container.scrollLeft;
        const cardWidth = 336; // 卡片寬度 + gap
        const scrollAmount = Math.min(cardWidth * 2, currentScroll); // 一次滾動2個卡片或剩餘距離
        
        container.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: 'smooth'
        });
      }, autoScrollDelay);
    });
    
    leftArrow.addEventListener('mouseleave', () => {
      if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
      }
    });
    
    // 右箭頭事件
    rightArrow.addEventListener('mouseenter', () => {
      if (rightArrow.classList.contains('disabled')) return;
      
      autoScrollTimer = setInterval(() => {
        if (rightArrow.classList.contains('disabled')) {
          clearInterval(autoScrollTimer);
          return;
        }
        
        const currentScroll = container.scrollLeft;
        const cardWidth = 336; // 卡片寬度 + gap
        const scrollAmount = cardWidth * 2; // 一次滾動2個卡片
        
        container.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }, autoScrollDelay);
    });
    
    rightArrow.addEventListener('mouseleave', () => {
      if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
      }
    });
    
    // 保留點擊事件作為備用
    leftArrow.addEventListener('click', () => {
      if (leftArrow.classList.contains('disabled')) return;
      
      const currentScroll = container.scrollLeft;
      const cardWidth = 336;
      const scrollAmount = Math.min(cardWidth * 4, currentScroll);
      
      container.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    });
    
    rightArrow.addEventListener('click', () => {
      if (rightArrow.classList.contains('disabled')) return;
      
      const currentScroll = container.scrollLeft;
      const cardWidth = 336;
      const scrollAmount = cardWidth * 4;
      
      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    });
    
    // 監聽滾動事件更新箭頭狀態
    container.addEventListener('scroll', updateArrowStates);
    
    // 初始化箭頭狀態
    updateArrowStates();
  }

  // 獲取台灣時間
  function getTaiwanTime() {
    // 使用 Intl.DateTimeFormat 來獲取精確的台灣時間
    const now = new Date();
    const taiwanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
    return taiwanTime;
  }

  // 獲取當前時間字符串（台灣時間）
  function getCurrentTimeString() {
    const taiwanTime = getTaiwanTime();
    const hours = taiwanTime.getHours().toString().padStart(2, '0');
    const minutes = taiwanTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // 獲取星期幾（台灣時間）
  function getDayOfWeek(date) {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[date.getDay()];
  }

  // 判斷節目狀態（使用台灣時間）
  function getProgramStatus(program) {
    const taiwanTime = getTaiwanTime();
    const currentTime = taiwanTime.getHours() * 60 + taiwanTime.getMinutes();
    
    const [programHour, programMinute] = program.time.split(':').map(Number);
    const programStartTime = programHour * 60 + programMinute;
    const programEndTime = programStartTime + parseInt(program.duration);
    
    if (currentTime >= programStartTime && currentTime < programEndTime) {
      return 'now-playing'; // 現正播放
    } else if (currentTime < programStartTime) {
      return 'upcoming'; // 即將播出
    } else {
      return 'ended'; // 已結束
    }
  }

  // 判斷是否為當前正在播出的節目（向後兼容）
  function isCurrentProgram(program) {
    return getProgramStatus(program) === 'now-playing';
  }

  // 判斷是否應該顯示節目（只顯示當前和未來節目）
  function shouldShowProgram(program) {
    const status = getProgramStatus(program);
    return status === 'now-playing' || status === 'upcoming';
  }

  // 開始時間更新
  function startTimeUpdates() {
    // 清除現有的更新間隔
    if (currentTimeUpdateInterval) {
      clearInterval(currentTimeUpdateInterval);
    }
    
    // 每秒更新一次時間
    currentTimeUpdateInterval = setInterval(() => {
      const currentDateTimeEl = document.getElementById('currentDateTime');
      
      if (currentDateTimeEl) {
        const taiwanTime = getTaiwanTime();
        const month = taiwanTime.getMonth() + 1;
        const day = taiwanTime.getDate();
        const dayOfWeek = getDayOfWeek(taiwanTime);
        const timeString = getCurrentTimeString();
        
        currentDateTimeEl.innerHTML = `台灣時間 <span class="flip-clock date">${month}月${day}日</span> <span class="flip-clock day">${dayOfWeek}</span> 現在時間 <span class="flip-clock time">${timeString}</span>`;
      }
      
      // 檢查日期是否改變（跨日檢查）
      const taiwanTime = getTaiwanTime();
      const currentDate = taiwanTime.toISOString().split('T')[0];
      
      if (scheduleData && scheduleData.today && scheduleData.today.date !== currentDate) {
        console.log('檢測到日期改變，重新載入節目表');
        loadScheduleData();
        return;
      }
      
      // 每分鐘檢查一次是否需要更新當前節目高亮（使用台灣時間）
      if (taiwanTime.getSeconds() === 0) {
        updateScheduleDisplay();
      }
    }, 1000);
  }

  // 頁面載入時初始化節目時間表
  loadScheduleData();

  // 頁面卸載時清理定時器
  window.addEventListener('beforeunload', () => {
    if (currentTimeUpdateInterval) {
      clearInterval(currentTimeUpdateInterval);
    }
  });
});
SS
