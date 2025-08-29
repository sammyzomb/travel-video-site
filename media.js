// media.js：HERO 播放 + 全螢幕播放器
(function(){
  let heroVideos = [], currentHeroIndex = 0, heroPlayer;
  let ytIdToIndex = {};
  let heroTimer = null;
  let heroOrder = [];     // 洗牌後的 id 順序
  let heroPos = 0;        // 目前指向
  let lastPlayedId = null;

  // 初始化 Contentful client
  const contentfulClient = contentful.createClient({
    space: 'os5wf90ljenp',
          accessToken: 'YOUR_DELIVERY_TOKEN'
  });

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
      initializeHeroPlayer();
    }).catch(err => {
      console.error('處理 Hero 影片時發生錯誤:', err);
      // 如果 Contentful 載入失敗，使用預設 Hero 影片
      console.log('使用預設 Hero 影片');
      const defaultHeroVideos = [
        {
          id: 'dQw4w9WgXcQ',
          title: '探索世界 從這裡開始',
          desc: 'Live 世界旅遊新視野'
        },
        {
          id: '9bZkp7q19f0',
          title: '世界旅遊精選',
          desc: '帶您環遊世界的美好時光'
        },
        {
          id: 'jfKfPfyJRdk',
          title: '日本京都楓葉季',
          desc: '感受日本傳統文化的優雅與寧靜'
        },
        {
          id: 'BQ0mxQXmLsk',
          title: '冰島極光之旅',
          desc: '在冰島追尋北極光的神秘蹤跡'
        },
        {
          id: 'mWzJMuJY8tk',
          title: '義大利托斯卡尼',
          desc: '深入托斯卡尼鄉村，品嚐最道地的義大利美食'
        },
        {
          id: 'kXf3YY9k5Io',
          title: '巴黎塞納河畔',
          desc: '沿著塞納河漫步，感受花都巴黎的浪漫情懷'
        },
        {
          id: 'YQHsXMglC9A',
          title: '紐西蘭米佛峽灣',
          desc: '探索世界第八大奇觀，米佛峽灣的壯麗景色'
        },
        {
          id: 'dQw4w9WgXcQ',
          title: '摩洛哥馬拉喀什',
          desc: '穿梭在馬拉喀什的傳統市集中，體驗摩洛哥的異國風情'
        },
        {
          id: '9bZkp7q19f0',
          title: '泰國清邁古城',
          desc: '漫步清邁古城，感受泰北蘭納王朝的歷史文化'
        },
        {
          id: 'jfKfPfyJRdk',
          title: '馬爾地夫水上別墅',
          desc: '在馬爾地夫的透明海水中，體驗最奢華的水上別墅生活'
        },
        {
          id: 'BQ0mxQXmLsk',
          title: '埃及金字塔之謎',
          desc: '深入探索古埃及金字塔的建造之謎與法老文明'
        },
        {
          id: 'mWzJMuJY8tk',
          title: '秘魯馬丘比丘',
          desc: '登上印加帝國的失落之城，感受安地斯山脈的神秘'
        },
        {
          id: 'kXf3YY9k5Io',
          title: '義大利佛羅倫斯',
          desc: '在文藝復興的發源地，欣賞米開朗基羅與達文西的傑作'
        },
        {
          id: 'YQHsXMglC9A',
          title: '希臘聖托里尼日落',
          desc: '在愛琴海的夕陽下，欣賞聖托里尼島的絕美日落'
        },
        {
          id: 'dQw4w9WgXcQ',
          title: '日本京都楓葉季',
          desc: '在京都的楓葉季節，體驗日本傳統文化的優雅'
        },
        {
          id: '9bZkp7q19f0',
          title: '杜拜哈里發塔夜景',
          desc: '從世界最高建築俯瞰杜拜的璀璨夜景'
        },
        {
          id: 'jfKfPfyJRdk',
          title: '北極圈極光攝影',
          desc: '跟隨專業攝影師，捕捉北極光最震撼的瞬間'
        },
        {
          id: 'BQ0mxQXmLsk',
          title: '印度泰姬瑪哈陵',
          desc: '在月光下欣賞世界七大奇觀之一的泰姬瑪哈陵'
        },
        {
          id: 'mWzJMuJY8tk',
          title: '澳洲大堡礁海底世界',
          desc: '潛入大堡礁的海底世界，探索珊瑚礁的生態奧秘'
        },
        {
          id: 'kXf3YY9k5Io',
          title: '冰島藍湖溫泉',
          desc: '在冰島的藍湖溫泉中，享受北極圈下的溫暖時光'
        },
        {
          id: 'YQHsXMglC9A',
          title: '巴西里約熱內盧嘉年華',
          desc: '感受里約嘉年華的熱情與活力，體驗巴西的狂歡文化'
        },
        {
          id: 'dQw4w9WgXcQ',
          title: '瑞士阿爾卑斯山',
          desc: '在瑞士阿爾卑斯山脈中，體驗最純淨的自然風光'
        },
        {
          id: '9bZkp7q19f0',
          title: '加拿大班夫國家公園',
          desc: '探索加拿大落磯山脈的壯麗景色與野生動物'
        },
        {
          id: 'jfKfPfyJRdk',
          title: '挪威峽灣之旅',
          desc: '在挪威的峽灣中，感受北歐的自然奇觀'
        },
        {
          id: 'BQ0mxQXmLsk',
          title: '西班牙巴塞隆納',
          desc: '在高第的建築藝術中，體驗加泰隆尼亞的熱情'
        },
        {
          id: 'mWzJMuJY8tk',
          title: '葡萄牙里斯本',
          desc: '在里斯本的古老街道中，感受葡萄牙的歷史魅力'
        },
        {
          id: 'kXf3YY9k5Io',
          title: '荷蘭阿姆斯特丹',
          desc: '在運河與風車中，體驗荷蘭的獨特文化'
        },
        {
          id: 'YQHsXMglC9A',
          title: '德國新天鵝堡',
          desc: '在童話般的城堡中，感受德國浪漫主義的藝術'
        },
        {
          id: 'dQw4w9WgXcQ',
          title: '奧地利維也納',
          desc: '在音樂之都維也納，體驗奧地利的藝術與文化'
        },
        {
          id: '9bZkp7q19f0',
          title: '捷克布拉格',
          desc: '在布拉格的古老廣場中，感受中歐的歷史風情'
        },
        {
          id: 'jfKfPfyJRdk',
          title: '匈牙利布達佩斯',
          desc: '在多瑙河畔，體驗匈牙利的溫泉與建築藝術'
        },
        {
          id: 'BQ0mxQXmLsk',
          title: '克羅埃西亞杜布羅夫尼克',
          desc: '在亞得里亞海畔，感受克羅埃西亞的海岸風光'
        },
        {
          id: 'mWzJMuJY8tk',
          title: '斯洛維尼亞布萊德湖',
          desc: '在阿爾卑斯山脈中，體驗斯洛維尼亞的自然美景'
        },
        {
          id: 'kXf3YY9k5Io',
          title: '波蘭克拉科夫',
          desc: '在波蘭的古都中，感受中歐的歷史與文化'
        },
        {
          id: 'YQHsXMglC9A',
          title: '立陶宛維爾紐斯',
          desc: '在波羅的海三國中，體驗立陶宛的獨特魅力'
        }
      ];
      
      heroVideos = defaultHeroVideos;
      heroOrder = heroVideos.map(v => v.id);
      heroPos = 0;
      ytIdToIndex = {};
      heroVideos.forEach((v, idx) => ytIdToIndex[v.id] = idx);

      if (!heroOrder.length) return;
      initializeHeroPlayer();
    });
  });

  function initializeHeroPlayer() {
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      // 設定全域回調函數
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  }

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
