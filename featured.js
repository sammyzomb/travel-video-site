// featured.js：精選節目（每頁 8 個，導到 videos.html）
(function(){
  document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('featured-videos');
    if (!container) return;

    const pick = (f, keys) => {
      for (const k of keys) { if (f && f[k] != null && f[k] !== '') return f[k]; }
      return '';
    };
    const limitText = (txt, max) => !txt ? '' : (txt.length > max ? txt.slice(0, max) + '…' : txt);

    try {
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
        const ytid  = pick(f, ['YouTube ID','youTubeId','youtubeId']);
        const mp4   = pick(f, ['MP4 影片網址','mp4Url']);
        const tags  = Array.isArray(f.tags) ? f.tags : [];
        let thumb = '';
        const cfThumb = f.thumbnail?.fields?.file?.url;
        if (cfThumb) thumb = cfThumb.startsWith('http') ? cfThumb : `https:${cfThumb}`;
        else if (ytid) thumb = `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`;
        return { title, desc, ytid, mp4, tags, thumb };
      });

      const PAGE_SIZE = 8;
      let rendered = 0;

      const moreWrap = document.createElement('div');
      moreWrap.id = 'featured-actions';
      moreWrap.style = 'text-align:center;margin-top:16px;';
      const moreLink = document.createElement('a');
      moreLink.id = 'featured-more';
      moreLink.href = 'videos.html';
      moreLink.className = 'video-more-btn';
      moreLink.textContent = '所有節目';
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
        moreWrap.style.display = allItems.length ? '' : 'none';
      }

      container.innerHTML = '';
      if (allItems.length === 0) {
        container.innerHTML = `<p style="color:#999;">目前無法載入精選節目。</p>`;
        moreWrap.style.display = 'none';
      } else {
        renderNextPage();
      }
    } catch (err) {
      console.error('Contentful 連線失敗（featured）：', err);
      if (container) container.innerHTML = `<p style="color:#999;">目前無法載入精選節目。</p>`;
    }
  });
})();
