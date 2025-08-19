// upnext.js：首頁「即將播出」（固定欄位 + 星期·時間 + 美化樣式）
(function UpNext(){
  const grid = document.getElementById('schedule-spotlight');
  if (!grid) return;
  const cf = (typeof contentfulClient !== 'undefined') ? contentfulClient : null;
  if (!cf){ console.warn('[upnext] contentfulClient not found'); return; }

  // 欄位固定（依你 Contentful 設定）
  const FIELD = {
    schedule: {
      title: 'title',
      airDate: 'airDate',
      block: 'block',
      slotIndex: 'slotIndex',
      video: 'video',
      isPremiere: 'isPremiere'
    },
    video: { title:'title', description:'description', thumbnail:'thumbnail', youtubeId:'youTubeId' }
  };

  // 工具
  const esc = s => String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const oneLine = s => (s||'').replace(/\s+/g,' ').trim();
  const ellipsis = (s,n)=>{ s = oneLine(s); return s.length>n ? s.slice(0,n).trim()+'…' : s; };
  const hhmm = d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const fmtDate = d => {
    const w = ['週日','週一','週二','週三','週四','週五','週六'][d.getDay()];
    const m  = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${m}.${dd} ${w}`;
  };
  const BLOCK_START = { '00-06':0,'06-12':6,'12-18':12,'18-24':18 };
  const BLOCK_LABEL = { '00-06':'00–06','06-12':'06–12','12-18':'12–18','18-24':'18–24' };
  const BLOCK_CLASS = { '00-06':'blk-00','06-12':'blk-06','12-18':'blk-12','18-24':'blk-18' };
  function normalizeBlock(v){
    if(!v) return '';
    v = String(v).trim().replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\s+/g,'');
    const map={ '0-6':'00-06','00-6':'00-06','6-12':'06-12','12-18':'12-18','18-24':'18-24' };
    return map[v]||v;
  }
  function assetUrl(a){ const u=a?.fields?.file?.url||''; return u?(u.startsWith('http')?u:`https:${u}`):''; }
  function bestThumb(vf, field){
    const u = assetUrl(vf?.[field]);
    if (u) return u;
    const yid = vf?.youTubeId || vf?.youtubeId || vf?.YouTubeID;
    return yid ? `https://i.ytimg.com/vi/${yid}/hqdefault.jpg` : 'https://picsum.photos/1200/675?blur=2';
  }

  // 樣式＋骨架
  injectLocalStyles();
  grid.innerHTML = `<div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div><div class="spot-skel"></div>`;

  // 抓資料 → 渲染
  cf.getEntries({ content_type:'scheduleItem', include:2, limit:1000, order:'fields.airDate' })
    .then(res=>{
      const items = res.items||[];
      const now = new Date();
      const rows = [];

      items.forEach(it=>{
        const f = it.fields||{};
        const air = f[FIELD.schedule.airDate];
        const blk = normalizeBlock(f[FIELD.schedule.block]);
        const slot = Number(f[FIELD.schedule.slotIndex]||0);
        const vref = f[FIELD.schedule.video];
        if (!air || !blk || isNaN(slot) || !vref) return;

        const begin = new Date(air);
        begin.setHours(BLOCK_START[blk] ?? 0, 0, 0, 0);
        begin.setMinutes(begin.getMinutes() + slot*30);
        if (begin <= now) return;

        const vf = (Array.isArray(vref) ? vref[0] : vref)?.fields;
        if (!vf) return;

        const title = vf[FIELD.video.title] || f[FIELD.schedule.title] || '未命名節目';
        const desc  = vf[FIELD.video.description] || '';
        const img   = bestThumb(vf, FIELD.video.thumbnail);

        rows.push({
          at: begin.getTime(),
          date: fmtDate(begin),
          time: hhmm(begin),
          block: blk,
          isPremiere: !!f[FIELD.schedule.isPremiere],
          title: oneLine(title),
          desc:  ellipsis(desc, 72),
          img,
          href: 'videos.html'
        });
      });

      rows.sort((a,b)=>a.at-b.at);
      const list = rows.slice(0, rows.length>=4 ? 4 : Math.min(rows.length,3));
      if (!list.length) {
        grid.innerHTML = `
          <div class="spot-empty">
            目前沒有即將播出的節目
            <a class="spot-btn" href="schedule.html">查看完整節目表</a>
          </div>`;
        return;
      }

      grid.innerHTML = list.map((r,i)=>`
        <a class="spot-card ${BLOCK_CLASS[r.block]||'blk-12'}" href="${r.href}" style="animation-delay:${i*0.05}s">
          <img class="spot-img" loading="lazy" src="${r.img}"
               onerror="this.onerror=null;this.src='https://picsum.photos/1200/675?blur=2';" alt="">
          <div class="spot-grad"></div>
          <div class="spot-chip spot-time">${r.date} · ${r.time}</div>
          <div class="spot-chip spot-block">${BLOCK_LABEL[r.block]||''}</div>
          ${r.isPremiere ? `<div class="spot-badge">首播</div>` : ``}
          <div class="spot-meta">
            <div class="spot-title">${esc(r.title)}</div>
            <div class="spot-desc">${esc(r.desc)}</div>
          </div>
        </a>
      `).join('');
    })
    .catch(err=>{
      console.error('[upnext] load error', err);
      grid.innerHTML = `
        <div class="spot-empty">
          目前沒有即將播出的節目
          <a class="spot-btn" href="schedule.html">查看完整節目表</a>
        </div>`;
    });

  function injectLocalStyles(){
    const old = document.getElementById('upnext-v2-style'); if (old) old.remove();
    const css = document.createElement('style'); css.id='upnext-v2-style';
    css.textContent = `
      .schedule-spotlight-grid{display:grid;gap:20px;grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(min-width:1400px){.schedule-spotlight-grid{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:900px){.schedule-spotlight-grid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:640px){.schedule-spotlight-grid{grid-template-columns:1fr}}
      .spot-card{position:relative;display:block;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,.06);
                 box-shadow:0 10px 24px rgba(0,0,0,.06);transform:translateY(6px);opacity:0;animation:upfade .32s ease forwards}
      @media(prefers-color-scheme:dark){.spot-card{border-color:rgba(255,255,255,.12);box-shadow:0 14px 32px rgba(0,0,0,.25)}}
      .spot-card:hover{transform:translateY(0) scale(1.01)}
      .spot-img{width:100%;aspect-ratio:16/9;height:auto;object-fit:cover;display:block;filter:brightness(.94)}
      .spot-grad{position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,.55) 100%)}
      .spot-meta{position:absolute;left:16px;right:16px;bottom:14px;color:#fff;overflow:hidden;text-shadow:0 1px 4px rgba(0,0,0,.35)}
      .spot-title{font-weight:800;font-size:18px;line-height:1.28;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .spot-desc{opacity:.95;font-size:13px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      @media(max-width:640px){.spot-desc{display:none}}
      .spot-chip{position:absolute;padding:6px 10px;border-radius:999px;font-weight:900;font-size:12px;color:#fff;
                 backdrop-filter:saturate(140%) blur(4px);border:1px solid rgba(255,255,255,.22)}
      .spot-time{left:12px;bottom:12px;background:rgba(8,8,8,.45)}
      .spot-block{right:12px;top:12px}
      .spot-badge{position:absolute;left:12px;top:12px;background:rgba(224,180,106,.95);color:#111;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;border:1px solid rgba(0,0,0,.2)}
      .blk-00 .spot-block{background:linear-gradient(135deg,#4b79a1,#283e51)}
      .blk-06 .spot-block{background:linear-gradient(135deg,#2ea043,#0f5132)}
      .blk-12 .spot-block{background:linear-gradient(135deg,#d39e38,#8c6c1a)}
      .blk-18 .spot-block{background:linear-gradient(135deg,#2563eb,#0f1e5a)}
      .spot-skel{aspect-ratio:16/9;border-radius:20px;background:linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,.1), rgba(0,0,0,.05));animation:sk 1.2s ease-in-out infinite alternate}
      @media(prefers-color-scheme:dark){.spot-skel{background:linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.1), rgba(255,255,255,.06))}}
      .spot-empty{grid-column:1/-1;padding:22px;border:1px dashed rgba(0,0,0,.18);border-radius:14px;text-align:center}
      .spot-btn{margin-left:8px;display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid rgba(0,0,0,.22);text-decoration:none;font-weight:800}
      @keyframes sk{to{filter:brightness(1.15)}}
      @keyframes upfade{to{opacity:1;transform:translateY(0)}}
    `;
    document.head.appendChild(css);
  }
})();
