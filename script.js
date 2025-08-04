// 確保整個網頁 DOM 都載入完成後，再執行我們的程式碼
document.addEventListener('DOMContentLoaded', function() {

  // --- Hero 區塊邏輯 ---
  let heroVideos = [], currentHeroIndex = 0, heroPlayer;
  let ytIdToIndex = {};

  // 初始化 Hero 影片
  fetch('hero.json')
    .then(res => {
      if (!res.ok) throw new Error('無法載入 hero.json');
      return res.json();
    })
    .then(data => {
      // 使用 Fisher-Yates (aka Knuth) Shuffle 演算法將影片清單順序打亂
      let currentIndex = data.length, randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [data[currentIndex], data[randomIndex]] = [data[randomIndex], data[currentIndex]];
      }
      
      heroVideos = data; // 使用已經洗牌過的新清單
      heroVideos.forEach((v, i) => ytIdToIndex[v.id] = i);
      
      // 檢查 YouTube IFrame API 是否已載入
      if (window.YT && window.YT.Player) {
        onYouTubeIframeAPIReady();
      } else {
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      }
    })
    .catch(error => console.error('處理 Hero 影片時發生錯誤:', error));

  // YouTube IFrame API 準備好後的回呼函式
  function onYouTubeIframeAPIReady() {
    if (!heroVideos.length) return;
    heroPlayer = new YT.Player('ytPlayer', {
      videoId: heroVideos[0].id,
      playerVars: { 
        autoplay: 1, 
        mute: 1, 
        controls: 0, 
        rel: 0, 
        showinfo: 0, 
        modestbranding: 1, 
        loop: 1, 
        playlist: heroVideos.map(v => v.id).join(',') 
      },
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

  // 播放器狀態改變時的處理
  function onPlayerStateChange(event) {
    const mask = document.getElementById('heroMask');
    if (!mask) return;
    if (event.data === YT.PlayerState.BUFFERING) {
      mask.classList.add('show');
    } else if (event.data === YT.PlayerState.PLAYING) {
      mask.classList.remove('show');
      const currentVideoId = heroPlayer.getVideoData().video_id;
      if (ytIdToIndex.hasOwnProperty(currentVideoId)) {
        currentHeroIndex = ytIdToIndex[currentVideoId];
        updateHeroCaption(currentHeroIndex);
      }
    }
  }

  // 更新 Hero 區塊右下角的標題
  function updateHeroCaption(index) {
    const captionEl = document.getElementById('heroCaption');
    if (captionEl && heroVideos[index]) {
      captionEl.innerHTML = `<div class="cap-title">${heroVideos[index].title || ''}</div><div class="cap-desc">${heroVideos[index].desc || ''}</div>`;
      captionEl.classList.add('visible');
    }
  }


  // --- 精選節目區塊邏輯 ---
  fetch("featured_updated.json")
    .then(res => {
        if (!res.ok) throw new Error('無法載入 featured_updated.json');
        return res.json();
    })
    .then(data => {
      const container = document.getElementById("featured-videos");
      if (!container) return;
      
      container.innerHTML = ''; // 先清空容器，避免重複載入
      data.forEach(video => {
        const card = document.createElement("div");
        card.className = "video-card";
        
        const thumb = video.image ? video.image : `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
        
        card.innerHTML = `
          <div class="video-thumb">
            <img src="${thumb}" alt="${video.title}">
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


  // --- 全螢幕播放器邏輯 ---
  const fullscreenPlayerEl = document.getElementById("fullscreenPlayer");

  // 使用事件代理來處理所有 "立即觀看" 按鈕的點擊
  document.body.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('video-cta')) {
      const videoId = event.target.dataset.videoid;
      if (videoId) {
        openFullscreenPlayer(videoId);
      }
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

  // 監聽鍵盤 Esc 鍵來關閉播放器
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeFullscreenPlayer();
    }
  });

});
