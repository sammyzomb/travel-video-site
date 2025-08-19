// media.js：HERO 播放 + 全螢幕播放器
(function(){
  let heroVideos = [], currentHeroIndex = 0, heroPlayer;
  let ytIdToIndex = {};
  let heroTimer = null;
  let heroOrder = [];     // 洗牌後的 id 順序
  let heroPos = 0;        // 目前指向
  let lastPlayedId = null;

  document.addEventListener('DOMContentLoaded', () => {
    // 抓 Hero 影片
    contentfulClient.getEntries({
      content_type: 'video',
      'fields.isHero': true,
      order: '-sys.updatedAt',
      limit: 1000
    }).then(response => {
      const mapped = response.items.map(item => ({
        sysId: item.sys.id,
        updatedAt: item.sys.updatedAt,
        id: item.fields.youTubeId || item.fields.youtubeId || '',
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
  });

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
  window.onYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady || onYouTubeIframeAPIReady;

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
})();
