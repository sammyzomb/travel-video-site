// 確保整個網頁 DOM 都載入完成後，再執行我們的程式碼
document.addEventListener('DOMContentLoaded', function() {

  // --- 主題切換邏輯 ---
  const themeSwitcher = document.getElementById('theme-switcher');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const body = document.body;

  // 檢查 localStorage 中是否已存有主題偏好
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
    updateThemeIcon(savedTheme);
  }

  themeSwitcher.addEventListener('click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark-theme');
    
    let currentTheme;
    if (body.classList.contains('dark-theme')) {
      currentTheme = 'dark-theme';
    } else {
      currentTheme = ''; // 代表淺色主題
    }
    
    localStorage.setItem('theme', currentTheme); // 儲存選擇
    updateThemeIcon(currentTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark-theme') {
      themeIconSun.style.display = 'none';
      themeIconMoon.style.display = 'inline-block';
    } else {
      themeIconSun.style.display = 'inline-block';
      themeIconMoon.style.display = 'none';
    }
  }


  // --- Hero 區塊邏輯 ---
  let heroVideos = [], currentHeroIndex = 0, heroPlayer;
  let ytIdToIndex = {};

  fetch('hero.json')
    .then(res => res.ok ? res.json() : Promise.reject('無法載入 hero.json'))
    .then(data => {
      let currentIndex = data.length, randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [data[currentIndex], data[randomIndex]] = [data[randomIndex], data[currentIndex]];
      }
      heroVideos = data;
      heroVideos.forEach((v, i) => ytIdToIndex[v.id] = i);
      if (window.YT && window.YT.Player) onYouTubeIframeAPIReady();
      else window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    })
    .catch(error => console.error('處理 Hero 影片時發生錯誤:', error));

  function onYouTubeIframeAPIReady() {
    if (!heroVideos.length) return;
    heroPlayer = new YT.Player('ytPlayer', {
      videoId: heroVideos[0].id,
      playerVars: { autoplay: 1, mute: 1, controls: 0, rel: 0, showinfo: 0, modestbranding: 1, loop: 1, playlist: heroVideos.map(v => v.id).join(',') },
      events: {
        onReady: e => {
          e.target.mute();
          e.target.setPlaybackQuality('hd1080');
          e.target.playVideo();
          updateHeroCaption(0);
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
      const currentVideoId = heroPlayer.getVideoData().video_id;
      if (ytIdToIndex.hasOwnProperty(currentVideoId)) {
        currentHeroIndex = ytIdToIndex[currentVideoId];
        updateHeroCaption(currentHeroIndex);
      }
    }
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
        const thumb = video.image ? video.image : `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
        card.innerHTML = `
          <div class="video-thumb"><img src="${thumb}" alt="${video.title}"></div>
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

  // --- 全螢幕播放器邏輯 ---
  const fullscreenPlayerEl = document.getElementById("fullscreenPlayer");
  document.body.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('video-cta')) {
      const videoId = event.target.dataset.videoid;
      if (videoId) openFullscreenPlayer(videoId);
    }
  });

  function openFullscreenPlayer(videoId) {
    if (!fullscreenPlayerEl) return;
    fullscreenPlayerEl.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    fullscreenPlayerEl.classList.add("active");
  }

  function closeFullscreenPlayer() {
    if (!fullscreenPlayerEl) return;
    fullscreenPlayerEl.innerHTML = "";
    fullscreenPlayerEl.classList.remove("active");
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFullscreenPlayer();
  });
});
