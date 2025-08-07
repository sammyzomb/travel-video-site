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
    sideMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    body.classList.toggle('menu-open');
  }

  hamburgerBtn.addEventListener('click', toggleMenu);
  menuOverlay.addEventListener('click', toggleMenu);


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

  themeSwitcher.addEventListener('click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark-theme');
    let currentTheme = body.classList.contains('dark-theme') ? 'dark-theme' : '';
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon(currentTheme);
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
 // --- Hero 區塊邏輯 ---
let heroVideos = [], currentHeroIndex = 0, heroPlayer, heroTimer;
let ytIdToIndex = {};

contentfulClient.getEntries({
  content_type: 'video',
  'fields.isHero': true,
  order: '-sys.updatedAt'
}).then(response => {
  const data = response.items
    .map(item => ({
      id: item.fields.youTubeId || item.fields.youtubeId || '',
      title: item.fields.heroTitle || item.fields.title || '',
      desc: item.fields.heroText || item.fields.description || '',
      thumb: item.fields.thumbnail?.fields?.file?.url || '',
    }))
    .filter(item => !!item.id);
  heroVideos = shuffleArray(data); // 初次進來隨機
  heroVideos.forEach((v, i) => ytIdToIndex[v.id] = i);
  if (window.YT && window.YT.Player) onYouTubeIframeAPIReady();
  else window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}).catch(error => console.error('處理 Hero 影片時發生錯誤:', error));

function shuffleArray(array) {
  let arr = array.slice();
  let currentIndex = arr.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

function onYouTubeIframeAPIReady() {
  if (!heroVideos.length) return;
  if (heroPlayer) heroPlayer.destroy();
  heroPlayer = new YT.Player('ytPlayer', {
    videoId: heroVideos[0].id,
    playerVars: { autoplay: 1, mute: 1, controls: 0, rel: 0, showinfo: 0, modestbranding: 1, loop: 0 },
    events: {
      onReady: (e) => {
        e.target.mute();
        setHDQuality(e.target);
        e.target.playVideo();
        updateHeroCaption(0);
        setupHeroTimer();
      },
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  const mask = document.getElementById('heroMask');
  if (!mask) return;
  if (event.data === YT.PlayerState.BUFFERING) mask.classList.add('show');
  else if (event.data === YT.PlayerState.PLAYING) {
    mask.classList.remove('show');
    setHDQuality(event.target);
  }
}

function setHDQuality(player) {
  // 設定最高畫質
  const qualities = ["highres", "hd2160", "hd1440", "hd1080", "hd720"];
  for (let q of qualities) {
    player.setPlaybackQuality(q);
  }
}

// === 12 秒自動切換＋全部播完才亂數重排 ===
function setupHeroTimer() {
  clearTimeout(heroTimer);
  heroTimer = setTimeout(() => {
    playNextHero();
  }, 12000); // 12 秒
}

function playNextHero() {
  currentHeroIndex++;
  if (currentHeroIndex >= heroVideos.length) {
    // 一輪結束，亂數重排再播
    heroVideos = shuffleArray(heroVideos);
    currentHeroIndex = 0;
  }
  heroPlayer.loadVideoById(heroVideos[currentHeroIndex].id);
  updateHeroCaption(currentHeroIndex);
  setupHeroTimer();
}

function updateHeroCaption(index) {
  const captionEl = document.getElementById('heroCaption');
  if (captionEl && heroVideos[index]) {
    captionEl.innerHTML = `<div class="cap-title">${heroVideos[index].title || ''}</div><div class="cap-desc">${heroVideos[index].desc || ''}</div>`;
    captionEl.classList.add('visible');
  }
}



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
        
        // --- 圖片載入邏輯已更新 ---
        const highResThumb = `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`;
        const standardThumb = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
        const thumb = video.image ? video.image : highResThumb;

        card.innerHTML = `
          <div class="video-thumb">
            <img src="${thumb}" alt="${video.title}" onerror="this.onerror=null;this.src='${standardThumb}';">
          </div>
          <div class="video-content">
            <div class="video-tags">${video.tags.join(' / ')}</div>
            <div class="video-title">${video.title}</div>
            <div class="video-desc">${video.description}</div>
            <button class="video-cta" data-videoid="${video.youtubeId}">${video.cta}</button>
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

  fullscreenPlayerEl.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('close-player-btn')) {
      closeFullscreenPlayer();
    }
  });

  function openFullscreenPlayer(videoId) {
    if (!fullscreenPlayerEl) return;
    document.body.style.overflow = 'hidden';
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
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFullscreenPlayer();
  });
});
