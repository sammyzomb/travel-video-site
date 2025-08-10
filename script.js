// --- Hero 區塊邏輯 ---
let heroVideos = [], currentHeroIndex = 0, heroPlayer;
let ytIdToIndex = {};
let heroTimer = null;
let heroOrder = [];     // 這一輪的播放順序（洗牌後的 id）
let heroPos = 0;        // 目前播放到第幾支
let lastPlayedId = null; // 上一支播放的是哪一支（用來避免連播）

contentfulClient.getEntries({
  content_type: 'video',
  'fields.isHero': true,
  order: '-sys.updatedAt',
  limit: 1000
}).then(response => {
  // 映射欄位並濾掉沒有 YouTube ID 的項目
  const mapped = response.items.map(item => ({
    sysId: item.sys.id,
    updatedAt: item.sys.updatedAt,
    id: item.fields.youTubeId || '',
    title: item.fields.heroTitle || item.fields.title || '',
    desc: item.fields.heroText || item.fields.description || '',
    thumb: item.fields.thumbnail?.fields?.file?.url || '',
  })).filter(v => v.id);

  // 以 youTubeId 去重（同一支影片保留較新的）
  const byId = new Map();
  for (const v of mapped) {
    const has = byId.get(v.id);
    if (!has || new Date(v.updatedAt) > new Date(has.updatedAt)) byId.set(v.id, v);
  }
  let data = Array.from(byId.values());

  // 洗牌（Fisher–Yates）
  let currentIndex = data.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [data[currentIndex], data[randomIndex]] = [data[randomIndex], data[currentIndex]];
  }

  heroVideos = data;
  heroOrder = heroVideos.map(v => v.id);
  heroPos = 0;
  ytIdToIndex = {};
  heroVideos.forEach((v, i) => ytIdToIndex[v.id] = i);

  if (heroOrder.length === 0) return;

  if (window.YT && window.YT.Player) onYouTubeIframeAPIReady();
  else window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}).catch(err => console.error('處理 Hero 影片時發生錯誤:', err));

function onYouTubeIframeAPIReady() {
  if (!heroVideos.length || !heroOrder.length) return;

  // 先蓋遮罩，避免看到縮圖牆（CSS 請確保 .show 會讓遮罩可見）
  const mask = document.getElementById('heroMask');
  if (mask) mask.classList.add('show');

  heroPlayer = new YT.Player('ytPlayer', {
    videoId: heroOrder[0],  // 第一支
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
      onError: () => { try { nextHero(); } catch (e) {} } // 影片錯誤就跳下一支
    }
  });
}

function onPlayerStateChange(event) {
  const mask = document.getElementById('heroMask');

  // 任何狀態變化都先清除舊計時器
  if (heroTimer) { clearTimeout(heroTimer); heroTimer = null; }

  // 預設顯示遮罩；只有 PLAYING 才移除
  if (mask) mask.classList.add('show');

  // 影片已載入（CUED）但尚未播放 → 立刻播放，避免停在縮圖牆
  if (event.data === YT.PlayerState.CUED) {
    try { heroPlayer.playVideo(); } catch (e) {}
    return; // 等 PLAYING 再處理其他邏輯
  }

  if (event.data === YT.PlayerState.PLAYING) {
    if (mask) mask.classList.remove('show');

    const currentVideoId = heroPlayer.getVideoData().video_id;
    if (ytIdToIndex.hasOwnProperty(currentVideoId)) {
      currentHeroIndex = ytIdToIndex[currentVideoId];
      heroPos = heroOrder.indexOf(currentVideoId); // 與實際播放同步
      updateHeroCaption(currentHeroIndex);
      lastPlayedId = currentVideoId;                // 記錄剛播放的影片
    }

    // 播放中：10 秒後切下一支（用我們自己的序列）
    heroTimer = setTimeout(() => { try { nextHero(); } catch (e) {} }, 10000);
  }

  // 自然播畢也直接切下一支，避免停在縮圖牆
  if (event.data === YT.PlayerState.ENDED) {
    try { nextHero(); } catch (e) {}
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
  // 前進一支
  heroPos++;

  // 到尾端就重洗新一輪
  if (heroPos >= heroOrder.length) {
    let arr = heroOrder.slice();
    let currentIndex = arr.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
    // 避免新一輪第一支剛好又是上一支
    if (arr.length > 1 && lastPlayedId && arr[0] === lastPlayedId) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    heroOrder = arr;
    heroPos = 0;
  }

  // 取得下一支；若不巧等於上一支，再往後推一格
  let nextId = heroOrder[heroPos];
  if (lastPlayedId && nextId === lastPlayedId && heroOrder.length > 1) {
    heroPos = (heroPos + 1) % heroOrder.length;
    nextId = heroOrder[heroPos];
  }

  // 切片前先蓋遮罩
  const mask = document.getElementById('heroMask');
  if (mask) mask.classList.add('show');

  heroPlayer.loadVideoById(nextId);
  try { heroPlayer.playVideo(); } catch (e) {} // 強制播放，避免停在 CUED
}
