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

  // === HERO 區塊（10 秒切換／一輪重洗／CUED 立即播／防九宮格）===
  let heroVideos = [], currentHeroIndex = 0, heroPlayer;
  let ytIdToIndex = {};
  let heroTimer = null;
  let heroOrder = [];     // 洗牌後的 id 順序
  let heroPos = 0;        // 目前指向
  let lastPlayedId = null;

  contentfulClient.getEntries({
    content_type: 'video',
    'fields.isHero': true,
    order: '-sys.updatedAt',
    limit: 1000
  }).then(response => {
    const mapped = response.items.map(item => ({
      sysId: item.sys.id,
      updatedAt: item.sys.updatedAt,
      id: item.fields.youTubeId || '',
      title: item.fields.heroTitle || item.fields.title || '',
      desc: item.fields.heroText || item.fields.description || '',
      thumb: item.fields.thumbnail?.fields?.file?.url || ''
    })).filter(v => v.id);

    // 去重（同一 YouTube ID 保留較新）
    const byId = new Map();
    for (const v of mapped) {
      const ex = byId.get(v.id);
      if (!ex || new Date(v.updatedAt) > new Date(ex.updatedAt)) byId.set(v.id, v);
    }
    let data = Array.from(byId.values());

    // 洗牌
    let i = data.length, r;
    while (i !== 0) {
      r = Math.floor(Math.random() * i);
      i--;
      [data[i], data[r]] = [data[r], data[i]];
    }

    heroVideos = data;
    heroOrder = heroVideos.map(v => v.id);
    heroPos = 0;
    ytIdToIndex = {};
    heroVideos.forEach((v, idx) => ytIdToIndex[v.id] = idx);

    if (!heroOrder.length) return;
    if (window.YT && window.YT.Player) onYouTubeIframeAPIReady();
    else window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  }).catch(err => console.error('處理 Hero 影片時發生錯誤:', err));

  function onYouTubeIframeAPIReady() {
    if (!heroVideos.length || !heroOrder.length) return;

    const mask = document.getElementById('heroMask');
    if (mask) mask.classList.add('show'); // 先蓋遮罩

    heroPlayer = new YT.Player('ytPlayer', {
      videoId: heroOrder[0],
      playerVars: {
        autoplay: 1, mute: 1, controls: 0, rel: 0, showinfo: 0, modestbranding: 1,
        playsinline: 1, fs: 0, disablekb: 1, iv_load_policy: 3
      },
      events: {
        onReady: e => {
          e.target.mute();
          e.target.setPlaybackQuality('hd1440');
          e.target.playVideo();
          updateHeroCaption(0);
        },
        onStateChange: onPlayerStateChange,
        onError: () => { try { nextHero(); } catch (e) {} }
      }
    });
  }

  function onPlayerStateChange(event) {
    const mask = document.getElementById('heroMask');

    if (heroTimer) { clearTimeout(heroTimer); heroTimer = null; }
    if (mask) mask.classList.add('show'); // 預設蓋住

    if (event.data === YT.PlayerState.CUED) {
      try { heroPlayer.playVideo(); } catch {}
      return;
    }

    if (event.data === YT.PlayerState.PLAYING) {
      if (mask) mask.classList.remove('show');

      const currentVideoId = heroPlayer.getVideoData().video_id;
      if (ytIdToIndex.hasOwnProperty(currentVideoId)) {
        currentHeroIndex = ytIdToIndex[currentVideoId];
        heroPos = heroOrder.indexOf(currentVideoId);
        updateHeroCaption(currentHeroIndex);
        lastPlayedId = currentVideoId;
      }
      heroTimer = setTimeout(() => { try { nextHero(); } catch {} }, 10000);
    }

    if (event.data === YT.PlayerState.ENDED) {
      try { nextHero(); } catch {}
    }
  }

  function updateHeroCaption(index) {
    const captionEl = document.getElementById('heroCaption');
    if (captionEl && heroVideos[index]) {
      captionEl.innerHTML =
        `<div class="cap-title">${heroVideos[index].title || ''}</div>
         <div class="cap-desc">${heroVideos[index].desc || ''}</div>`;
      captionEl.classList.add('visible');
    }
  }

  function nextHero() {
    heroPos++;
    if (heroPos >= heroOrder.length) {
      // 重洗新一輪
      let arr = heroOrder.slice();
      let i = arr.length, r;
      while (i !== 0) {
        r = Math.floor(Math.random() * i);
        i--;
        [arr[i], arr[r]] = [arr[r], arr[i]];
      }
      if (arr.length > 1 && lastPlayedId && arr[0] === lastPlayedId) {
        [arr[0], arr[1]] = [arr[1], arr[0]];
      }
      heroOrder = arr;
      heroPos = 0;
    }

    let nextId = heroOrder[heroPos];
    if (lastPlayedId && nextId === lastPlayedId && heroOrder.length > 1) {
      heroPos = (heroPos + 1) % heroOrder.length;
      nextId = heroOrder[heroPos];
    }

    const mask = document.getElementById('heroMask');
    if (mask) mask.classList.add('show');

    heroPlayer.loadVideoById(nextId);
    try { heroPlayer.playVideo(); } catch {}
  }

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

  /* ===== 即將播出 v2｜標準版（只作用在 #schedule-spotlight）===== */
(function UpNext_v2(){
  const grid = document.getElementById('schedule-spotlight');
  if (!grid) return;

  // 取用你專案既有的 Contentful Client
  const cf = (typeof contentfulClient !== 'undefined') ? contentfulClient : null;
  if (!cf){ console.warn('[upnext] contentfulClient not found'); return; }

  // 若你的欄位 ID 與此不同，請在此對應修改即可
  const FIELD = {
    schedule: { title:'title', airDate:'airDate', block:'block', slotIndex:'slotIndex', video:'video', isPremiere:'isPremiere' },
    video:    { title:'title', description:'description', thumbnail:'thumbnail', youtubeId:'youtubeId' } // youtubeId 可無
  };

  // 時段→起始小時；色帶／標籤
  const BLOCK_START = { '00-06':0, '06-12':6, '12-18':12, '18-24':18 };
  const BLOCK_CLASS = { '00-06':'blk-00', '06-12':'blk-06', '12-18':'blk-12', '18-24':'blk-18' };
  const BLOCK_LABEL = { '00-06':'00–06', '06-12':'06–12', '12-18':'12–18', '18-24':'18–24' };

  // 小工具
  const toDateOnly = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const ymd = d => toDateOnly(d).toISOString().slice(0,10);
  const hhmm = d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const esc = s => String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const oneLine = s => (s||'').replace(/\s+/g,' ').trim();
  const ellipsis = (s,n)=>{ s = oneLine(s); return s.length>n ? s.slice(0,n).trim()+'…' : s; };
  const assetUrl = a => {
    const u = a?.fields?.file?.url || '';
    return u ? (u.startsWith('http') ? u : ('https:'+u)) : 'https://picsum.photos/1200/675?blur=2';
  };

  // 版面：桌機最多 4 張，行動 1–2 欄；加上本區塊專用樣式
  injectLocalStyles();
  grid.innerHTML = `<div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div>`;

  function startDateOf(entry){
    try{
      const f = entry.fields;
      const d = new Date(f[FIELD.schedule.airDate]);   // 支援 Date only / DateTime
      const h0 = BLOCK_START[f[FIELD.schedule.block]] ?? 0;
      const slot = Number(f[FIELD.schedule.slotIndex] || 0);
      d.setHours(h0,0,0,0);
      d.setMinutes(d.getMinutes() + slot*30);          // 每槽 30 分
      return d;
    }catch(e){ return null; }
  }

  function buildHref(vf){
    // 之後有播放頁時可改：return `/watch.html?id=${vf[FIELD.video.youtubeId]}`;
    return 'videos.html';
  }

  function load(){
    const now = new Date();
    const d0 = new Date(now); d0.setDate(d0.getDate()-1); // 往前一天避免跨日缺資料
    const d1 = new Date(now); d1.setDate(d1.getDate()+1); // 往後一天

    cf.getEntries({
      content_type: 'scheduleItem',
      include: 2,
      limit: 300,
      'fields.airDate[gte]': ymd(d0),
      'fields.airDate[lte]': ymd(d1),
      order: 'fields.airDate'
    }).then(res=>{
      const rows = [];
      (res.items||[]).forEach(it=>{
        const begin = startDateOf(it);
        if (!begin || begin <= now) return; // 只取未來
        const vf = it.fields[FIELD.schedule.video]?.fields; if (!vf) return;

        rows.push({
          at: begin.getTime(),
          time: hhmm(begin),
          block: it.fields[FIELD.schedule.block],
          isPremiere: !!it.fields[FIELD.schedule.isPremiere],
          title: oneLine(it.fields[FIELD.schedule.title] || vf[FIELD.video.title] || '未命名節目'),
          desc: ellipsis(vf[FIELD.video.description] || '', 72),
          img: assetUrl(vf[FIELD.video.thumbnail]),
          href: buildHref(vf)
        });
      });

      rows.sort((a,b)=>a.at-b.at);

      // v2：有 4+ 筆時桌機顯示 4 張，否則顯示最多 3 張
      const take = rows.length>=4 ? 4 : Math.min(rows.length, 3);
      const list = rows.slice(0, take);

      if (!list.length){
        grid.innerHTML = `
          <div class="spot-empty">
            目前沒有即將播出的節目
            <a class="spot-btn" href="schedule.html">查看完整節目表</a>
          </div>`;
        return;
      }

      grid.innerHTML = list.map((r,i)=>`
        <a class="spot-card ${BLOCK_CLASS[r.block]||'blk-12'}" href="${r.href}" style="animation-delay:${i*0.05}s">
          <img class="spot-img" loading="lazy" src="${r.img}" alt="">
          <div class="spot-grad"></div>
          <div class="spot-chip spot-time">🕗 ${r.time}</div>
          <div class="spot-chip spot-block">${BLOCK_LABEL[r.block]||''}</div>
          ${r.isPremiere ? `<div class="spot-badge">首播</div>` : ``}
          <div class="spot-meta">
            <div class="spot-title">${esc(r.title)}</div>
            <div class="spot-desc">${esc(r.desc)}</div>
          </div>
        </a>
      `).join('');
    }).catch(err=>{
      console.error('[upnext] load error', err);
    });
  }

  function injectLocalStyles(){
    if (document.getElementById('upnext-v2-style')) return;
    const css = document.createElement('style');
    css.id = 'upnext-v2-style';
    css.textContent = `
      .schedule-spotlight-grid{display:grid;gap:16px;grid-template-columns:repeat(4,minmax(0,1fr))}
      @media(max-width:1200px){.schedule-spotlight-grid{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:900px){.schedule-spotlight-grid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:640px){.schedule-spotlight-grid{grid-template-columns:1fr}}
      .spot-card{position:relative;display:block;border-radius:18px;overflow:hidden;border:1px solid rgba(0,0,0,.08);box-shadow:0 10px 24px rgba(0,0,0,.06);
                 transform:translateY(6px);opacity:0;animation:upfade .36s ease forwards;will-change:transform,opacity}
      @media(prefers-color-scheme:dark){.spot-card{border-color:rgba(255,255,255,.12);box-shadow:0 14px 32px rgba(0,0,0,.25)}}
      .spot-card:hover{transform:translateY(0) scale(1.01)}
      .spot-img{width:100%;height:240px;object-fit:cover;display:block;filter:brightness(.9)}
      .spot-grad{position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.06))}
      .spot-meta{position:absolute;left:16px;right:16px;bottom:14px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.45)}
      .spot-title{font-weight:800;line-height:1.26;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .spot-desc{opacity:.95;font-size:13px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .spot-chip{position:absolute;padding:6px 10px;border-radius:999px;font-weight:900;font-size:12px;backdrop-filter:saturate(140%) blur(4px);border:1px solid rgba(255,255,255,.25);color:#fff}
      .spot-time{left:12px;bottom:12px;background:rgba(0,0,0,.45)}
      .spot-block{right:12px;top:12px}
      .spot-badge{position:absolute;left:12px;top:12px;background:rgba(224,180,106,.95);color:#111;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;border:1px solid rgba(0,0,0,.2)}
      /* 不同時段色帶（右上角 chip） */
      .blk-00 .spot-block{background:linear-gradient(135deg,#4b79a1,#283e51)}
      .blk-06 .spot-block{background:linear-gradient(135deg,#2ea043,#0f5132)}
      .blk-12 .spot-block{background:linear-gradient(135deg,#d39e38,#8c6c1a)}
      .blk-18 .spot-block{background:linear-gradient(135deg,#2563eb,#0f1e5a)}
      /* Skeleton / 空狀態 */
      .spot-skel{height:240px;border-radius:18px;background:linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,.1), rgba(0,0,0,.05));animation:sk 1.2s ease-in-out infinite alternate}
      @media(prefers-color-scheme:dark){.spot-skel{background:linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.1), rgba(255,255,255,.06))}}
      .spot-empty{grid-column:1/-1;padding:22px;border:1px dashed rgba(0,0,0,.18);border-radius:14px;text-align:center}
      .spot-btn{margin-left:8px;display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.22);text-decoration:none;font-weight:800}
      @keyframes sk{to{filter:brightness(1.15)}}
      @keyframes upfade{to{opacity:1;transform:translateY(0)}}
    `;
    document.head.appendChild(css);
  }

  // 首次載入＋每 60 秒更新（跨整點/半點自動換下一筆）
  load();
  setInterval(load, 60 * 1000);
})();

  // === 全螢幕播放器（點精選卡片播放）===
  const fullscreenPlayerEl = document.getElementById('fullscreenPlayer');
  let fullscreenPlayerObject = null;

  document.body.addEventListener('click', e => {
    const btn = e.target?.closest?.('.video-cta');
    if (!btn) return;
    const id = btn.dataset.videoid;
    if (id) openFullscreenPlayer(id);
  });

  fullscreenPlayerEl?.addEventListener('click', e => {
    if (e.target && e.target.classList.contains('close-player-btn')) {
      closeFullscreenPlayer();
    }
  });

  function openFullscreenPlayer(videoId) {
    if (!fullscreenPlayerEl) return;
    // 暫停 Hero 計時與播放
    if (heroTimer) { clearTimeout(heroTimer); heroTimer = null; }
    try { heroPlayer?.pauseVideo?.(); } catch {}

    document.body.style.overflow = 'hidden';
    fullscreenPlayerEl.innerHTML = `
      <button class="close-player-btn" title="關閉">&times;</button>
      <div id="main-player"></div>`;
    fullscreenPlayerEl.classList.add('active');

    fullscreenPlayerObject = new YT.Player('main-player', {
      width: '100%',
      height: '100%',
      videoId,
      playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: ev => { ev.target.setPlaybackQuality('highres'); ev.target.playVideo(); }
      }
    });
  }

  function closeFullscreenPlayer() {
    if (!fullscreenPlayerEl) return;
    document.body.style.overflow = '';
    if (fullscreenPlayerObject?.destroy) {
      fullscreenPlayerObject.destroy();
      fullscreenPlayerObject = null;
    }
    fullscreenPlayerEl.innerHTML = '';
    fullscreenPlayerEl.classList.remove('active');

    // 回來後讓 Hero 繼續
    try { heroPlayer?.playVideo?.(); } catch {}
    if (!heroTimer) heroTimer = setTimeout(() => { try { nextHero(); } catch {} }, 10000);
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeFullscreenPlayer();
  });

  // === 分頁切換保險：離開暫停、回來繼續 ===
  document.addEventListener('visibilitychange', () => {
    if (!heroPlayer) return;
    if (document.hidden) {
      if (heroTimer) { clearTimeout(heroTimer); heroTimer = null; }
      try { heroPlayer.pauseVideo(); } catch {}
    } else {
      try { heroPlayer.playVideo(); } catch {}
      if (!heroTimer) heroTimer = setTimeout(() => { try { nextHero(); } catch {} }, 10000);
    }
  });
});
