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

    // 建立「查看更多」按鈕（動態插入在容器後面）
    const moreWrap = document.createElement('div');
    moreWrap.id = 'featured-actions';
    moreWrap.style = 'text-align:center;margin-top:16px;';
    const moreBtn = document.createElement('button');
    moreBtn.id = 'featured-more';
    moreBtn.className = 'video-more-btn';
    moreBtn.textContent = '查看更多';
    moreBtn.style = 'padding:10px 16px;border-radius:10px;border:0;background:#0a5bfd;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.08)';
    moreWrap.appendChild(moreBtn);
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

      // 顯示 / 隱藏「查看更多」
      if (rendered >= allItems.length) {
        moreWrap.style.display = 'none';
      } else {
        moreWrap.style.display = '';
      }
    }

    // 綁定按鈕
    moreBtn.addEventListener('click', renderNextPage);

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



  // === 節目表預告 ===
  Promise.all([
    fetch('program.json').then(res => res.ok ? res.json() : Promise.reject('無法載入 program.json')),
    fetch('videos.json').then(res => res.ok ? res.json() : Promise.reject('無法載入 videos.json'))
  ])
  .then(([programData, videosData]) => {
    const container = document.getElementById('schedule-spotlight');
    if (!container) return;
    const videosMap = new Map(videosData.map(v => [v.id, v]));
    const spotlightPrograms = programData.slice(0, 3);
    spotlightPrograms.forEach(item => {
      const info = videosMap.get(item.vid);
      if (info) {
        const a = document.createElement('a');
        a.href = `video.html?id=${info.id}`;
        a.className = 'schedule-card';
        a.innerHTML = `
          <img src="${info.thumb}" alt="${item.title}" class="schedule-card-img">
          <div class="schedule-card-overlay">
            <div class="schedule-card-time">${item.start}</div>
            <div class="schedule-card-title">${item.title}</div>
          </div>`;
        container.appendChild(a);
      }
    });
  })
  .catch(err => console.error('處理節目表預告時發生錯誤:', err));

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
