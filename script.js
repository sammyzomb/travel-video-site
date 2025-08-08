// 初始化 Contentful client
const contentfulClient = contentful.createClient({
  space: 'os5wf90ljenp',
  accessToken: 'lODH-WLwHwVZv7O4rFdBWjSnrzaQWGD4koeOZ1Dypj0'
});

// 確保整個網頁 DOM 都載入完成後，再執行我們的程式碼
document.addEventListener('DOMContentLoaded', function() {

  // --- 漢堡選單邏輯 ---
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sideMenu = document.getElementById('side-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const body = document.body;

  function toggleMenu() {
    if (!sideMenu || !menuOverlay) return;
    sideMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    body.classList.toggle('menu-open');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

  // --- 主題切換邏輯 ---
  const themeSwitcher = document.getElementById('theme-switcher');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
  } else {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  }
  updateThemeIcon(body.classList.contains('dark-theme') ? 'dark-theme' : '');

  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', (e) => {
      e.preventDefault();
      body.classList.toggle('dark-theme');
      let currentTheme = body.classList.contains('dark-theme') ? 'dark-theme' : '';
      localStorage.setItem('theme', currentTheme);
      updateThemeIcon(currentTheme);
    });
  }

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

  // =========================
  //        Hero 區塊
  //   一輪播完才重洗＋10秒切換
  // =========================
  let heroVideos = [], heroOrder = [], heroIdx = 0, heroPlayer = null;
  let heroTimer = null;

  contentfulClient.getEntries({
    content_type: 'video',          // 這個 "video" 要和 Contentful 模型 API ID 一樣
    'fields.isHero': true,          // 只抓首頁 HERO 勾選的
    order: '-sys.updatedAt'         // 最新在前
  }).then(response => {
    const data = response.items.map(item => ({
      id: item.fields.youTubeId || '',
      title: item.fields.heroTitle || item.fields.title || '',
      desc: item.fields.heroText || item.fields.description || '',
      thumb: item.fields.thumbnail?.fields?.file?.url ? ('https:' + item.fields.thumbnail.fields.file.url) : ''
    })).filter(v => v.id);

    heroVideos = data;
    if (!heroVideos.length) return;

    heroOrder = shuffleOnce(heroVideos.map(v => v.id));
    heroIdx = 0;

    ensureYouTubeAPI(() => {
      initHeroPlayer(heroOrder[heroIdx]);
    });
  }).catch(error => console.error('處理 Hero 影片時發生錯誤:', error));

  // Fisher–Yates 單次洗牌
  function shuffleOnce(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function ensureYouTubeAPI(cb) {
    if (window.YT && window.YT.Player) { cb(); return; }
    const tagId = 'yt-iframe-api';
    if (!document.getElementById(tagId)) {
      const tag = document.createElement('script');
      tag.id = tagId;
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => cb();
  }

  function initHeroPlayer(firstVideoId) {
    heroPlayer = new YT.Player('ytPlayer', {
      videoId: firstVideoId,
      playerVars: {
        autoplay: 1, mute: 1, controls: 0, rel: 0, showinfo: 0, modestbranding: 1
        // 不使用 loop/playlist；由我們自己控序
      },
      events: {
        onReady: (e) => {
          e.target.mute();
          e.target.setPlaybackQuality('hd1080');
          e.target.playVideo();
          updateHeroCaptionById(firstVideoId);
          startHeroTimer(); // 10 秒切換
        },
        onStateChange: onHeroStateChange
      }
    });
  }

  function onHeroStateChange(event) {
    const mask = document.getElementById('heroMask');
    if (mask) {
      if (event.data === YT.PlayerState.BUFFERING) mask.classList.add('show');
      else if (event.data === YT.PlayerState.PLAYING) mask.classList.remove('show');
    }

    // 狀態變化先清除舊計時器，避免重複
    clearHeroTimer();

    if (event.data === YT.PlayerState.PLAYING) {
      const vid = heroPlayer.getVideoData().video_id;
      updateHeroCaptionById(vid);
      startHeroTimer(); // 重新計時 10 秒
    }
  }

  function startHeroTimer() {
    clearHeroTimer();
    heroTimer = setTimeout(nextHero, 10000); // 10 秒
  }

  function clearHeroTimer() {
    if (heroTimer) {
      clearTimeout(heroTimer);
      heroTimer = null;
    }
  }

  function nextHero() {
    if (!heroVideos.length || !heroPlayer) return;

    // 移到下一支；若一輪結束，重洗新一輪
    heroIdx++;
    if (heroIdx >= heroOrder.length) {
      heroOrder = shuffleOnce(heroVideos.map(v => v.id));
      heroIdx = 0;
    }

    const nextId = heroOrder[heroIdx];
    heroPlayer.loadVideoById(nextId);
    heroPlayer.playVideo();
    updateHeroCaptionById(nextId);
    startHeroTimer();
  }

  function updateHeroCaptionById(videoId) {
    const captionEl = document.getElementById('heroCaption');
    if (!captionEl) return;
    const meta = heroVideos.find(v => v.id === videoId);
    if (!meta) return;
    captionEl.innerHTML = `
      <div class="cap-title">${meta.title || ''}</div>
      <div class="cap-desc">${meta.desc || ''}</div>`;
    captionEl.classList.add('visible');
  }

  // 使用者切到背景分頁/回來時的處理，避免回來瞬間暴衝跳片
  document.addEventListener('visibilitychange', () => {
    if (!heroPlayer) return;
    if (document.hidden) {
      clearHeroTimer();
      try { heroPlayer.pauseVideo(); } catch {}
    } else {
      try { heroPlayer.playVideo(); } catch {}
      startHeroTimer();
    }
  });

  // --- 精選節目區塊邏輯 ---
  fetch("featured_updated.json")
    .then(res => res.ok ? res.json() : Promise.reject('無法載入 featured_updated.json'))
    .then(data => {
      const container = document.getElementById("featured-videos");
      if (!container) return;
      container.innerHTML = '';
      data.forEach(video => {
        const card = document.createElement("div");
        card.className = "video-card";

        const highResThumb = `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`;
        const standardThumb = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
        const thumb = video.image ? (video.image.startsWith('http') ? video.image : `https:${video.image}`) : highResThumb;

        card.innerHTML = `
          <div class="video-thumb">
            <img loading="lazy" src="${thumb}" alt="${video.title}" onerror="this.onerror=null;this.src='${standardThumb}';">
          </div>
          <div class="video-content">
            <div class="video-tags">${(video.tags || []).join(' / ')}</div>
            <div class="video-title">${video.title || ''}</div>
            <div class="video-desc">${video.description || ''}</div>
            <button class="video-cta" data-videoid="${video.youtubeId}">${video.cta || '播放'}</button>
          </div>`;
        container.appendChild(card);
      });
    })
    .catch(error => console.error('處理精選節目時發生錯誤:', error));

  // --- 節目表預告邏輯 ---
  Promise.all([
    fetch('program.json').then(res => res.ok ? res.json() : Promise.reject('無法載入 program.json')),
    fetch('videos.json').then(res => res.ok ? res.json() : Promise.reject('無法載入 videos.json'))
  ])
  .then(([programData, videosData]) => {
    const container = document.getElementById('schedule-spotlight');
    if (!container) return;

    const videosMap = new Map(videosData.map(video => [video.id, video]));
    const spotlightPrograms = programData.slice(0, 3);

    spotlightPrograms.forEach(item => {
      const videoInfo = videosMap.get(item.vid);
      if (videoInfo) {
        const scheduleCard = document.createElement('a');
        scheduleCard.href = `video.html?id=${videoInfo.id}`;
        scheduleCard.className = 'schedule-card';
        scheduleCard.innerHTML = `
          <img src="${videoInfo.thumb}" alt="${item.title}" class="schedule-card-img">
          <div class="schedule-card-overlay">
            <div class="schedule-card-time">${item.start}</div>
            <div class="schedule-card-title">${item.title}</div>
          </div>
        `;
        container.appendChild(scheduleCard);
      }
    });
  })
  .catch(error => console.error('處理節目表預告時發生錯誤:', error));

  // --- 全螢幕播放器邏輯 ---
  const fullscreenPlayerEl = document.getElementById("fullscreenPlayer");
  let fullscreenPlayerObject = null;

  document.body.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('video-cta')) {
      const videoId = event.target.dataset.videoid;
      if (videoId) openFullscreenPlayer(videoId);
    }
  });

  if (fullscreenPlayerEl) {
    fullscreenPlayerEl.addEventListener('click', function(event) {
      if (event.target && event.target.classList.contains('close-player-btn')) {
        closeFullscreenPlayer();
      }
    });
  }

  function openFullscreenPlayer(videoId) {
    if (!fullscreenPlayerEl) return;
    document.body.style.overflow = 'hidden';

    // 停止 Hero 計時器，避免背景繼續跳片或重疊聲音
    clearHeroTimer();

    fullscreenPlayerEl.innerHTML = `
      <button class="close-player-btn" title="關閉">&times;</button>
      <div id="main-player"></div>`;
    fullscreenPlayerEl.classList.add("active");
    fullscreenPlayerObject = new YT.Player('main-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: { 'autoplay': 1, 'controls': 1, 'rel': 0, 'modestbranding': 1 },
      events: { 'onReady': onPlayerReady }
    });
  }

  function onPlayerReady(event) {
    event.target.setPlaybackQuality('highres');
    event.target.playVideo();
  }

  function closeFullscreenPlayer() {
    if (!fullscreenPlayerEl) return;
    document.body.style.overflow = '';
    if (fullscreenPlayerObject && typeof fullscreenPlayerObject.destroy === 'function') {
      fullscreenPlayerObject.destroy();
      fullscreenPlayerObject = null;
    }
    fullscreenPlayerEl.innerHTML = "";
    fullscreenPlayerEl.classList.remove("active");

    // 關閉全螢幕後，恢復 Hero 計時器
    startHeroTimer();
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFullscreenPlayer();
  });
});
