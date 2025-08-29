/* all-videos.js：渲染「所有節目」頁，依 洲→國家/綜合 分組，附國旗（Twemoji 會自動轉 SVG） */

// 小工具
const $ = (s, el=document) => el.querySelector(s);
const escapeHtml = (s='') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const norm = (str='') => String(str).trim().toLowerCase()
  .replace(/\s+/g,' ')
  .replace(/[()．・·‚’'´`’‘"]/g,'')
  .replace(/台/g,'臺');

// 洲（顯示順序）
const CONTINENTS = [
  { key:'asia', label:'亞洲' }, { key:'europe', label:'歐洲' },
  { key:'north_america', label:'北美洲' }, { key:'south_america', label:'南美洲' },
  { key:'africa', label:'非洲' }, { key:'oceania', label:'大洋洲' },
  { key:'antarctica', label:'南極洲' }, { key:'other', label:'其他' },
];

// 區域提示詞（找不到國家時用）
const REGION_HINTS = new Map([
  ['東亞','asia'],['東北亞','asia'],['東南亞','asia'],['南亞','asia'],['中亞','asia'],['西亞','asia'],['中東','asia'],
  ['歐洲','europe'],['北歐','europe'],['東歐','europe'],['西歐','europe'],['中歐','europe'],['地中海','europe'],['巴爾幹','europe'],['斯堪地那維亞','europe'],
  ['北美','north_america'],['南美','south_america'],['中南美','south_america'],
  ['非洲','africa'],['撒哈拉','africa'],['撒哈拉以南非洲','africa'],
  ['大洋洲','oceania'],['南太平洋','oceania'],
  ['南極','antarctica'],['南極洲','antarctica'],
  ['east asia','asia'],['southeast asia','asia'],['south asia','asia'],['central asia','asia'],['middle east','asia'],
  ['europe','europe'],['mediterranean','europe'],['balkans','europe'],['scandinavia','europe'],['nordic','europe'],
  ['north america','north_america'],['south america','south_america'],['latin america','south_america'],
  ['africa','africa'],['sub-saharan','africa'],['oceania','oceania'],['antarctica','antarctica'],
]);

// 國家別名索引（要補新國家就加 aliases）
const COUNTRY_INDEX = [
  { country:'日本', aliases:['日本','にほん','nihon','nippon','japan','jp'], continent:'asia' },
  { country:'韓國', aliases:['韓國','南韓','대한민국','korea','south korea','kr'], continent:'asia' },
  { country:'台灣', aliases:['臺灣','台灣','taiwan','tw'], continent:'asia' },
  { country:'中國', aliases:['中國','中國大陸','china','cn'], continent:'asia' },
  { country:'蒙古', aliases:['蒙古','mongolia','mn'], continent:'asia' },
  { country:'哈薩克', aliases:['哈薩克','哈薩克斯坦','kazakhstan','kz'], continent:'asia' },
  { country:'吉爾吉斯', aliases:['吉爾吉斯','吉爾吉斯斯坦','kyrgyzstan','kg','kirgiz'], continent:'asia' },
  { country:'烏茲別克', aliases:['烏茲別克','烏茲別克斯坦','uzbekistan','uz'], continent:'asia' },
  { country:'塔吉克', aliases:['塔吉克','塔吉克斯坦','tajikistan','tj'], continent:'asia' },
  { country:'土庫曼', aliases:['土庫曼','土庫曼斯坦','turkmenistan','tm'], continent:'asia' },
  { country:'印度', aliases:['印度','india','in'], continent:'asia' },
  { country:'泰國', aliases:['泰國','thailand','th'], continent:'asia' },
  { country:'越南', aliases:['越南','vietnam','vn'], continent:'asia' },
  { country:'馬來西亞', aliases:['馬來西亞','malaysia','my'], continent:'asia' },
  { country:'印尼', aliases:['印尼','印度尼西亞','indonesia','id'], continent:'asia' },
  { country:'尼泊爾', aliases:['尼泊爾','nepal','np'], continent:'asia' },
  { country:'以色列', aliases:['以色列','israel','il'], continent:'asia' },
  { country:'約旦', aliases:['約旦','jordan','jo'], continent:'asia' },
  { country:'土耳其', aliases:['土耳其','turkiye','turkey','tr'], continent:'asia' },

  { country:'俄羅斯', aliases:['俄羅斯','russia','ru'], continent:'europe' },
  { country:'芬蘭', aliases:['芬蘭','finland','fi'], continent:'europe' },
  { country:'挪威', aliases:['挪威','norway','no'], continent:'europe' },
  { country:'瑞典', aliases:['瑞典','sweden','se'], continent:'europe' },
  { country:'英國', aliases:['英國','uk','united kingdom','england','scotland','wales','northern ireland','gb'], continent:'europe' },
  { country:'法國', aliases:['法國','france','fr'], continent:'europe' },
  { country:'德國', aliases:['德國','germany','de'], continent:'europe' },
  { country:'義大利', aliases:['義大利','意大利','italy','it'], continent:'europe' },
  { country:'西班牙', aliases:['西班牙','spain','es'], continent:'europe' },
  { country:'葡萄牙', aliases:['葡萄牙','portugal','pt'], continent:'europe' },
  { country:'捷克', aliases:['捷克','czech','czechia','cz'], continent:'europe' },
  { country:'奧地利', aliases:['奧地利','austria','at'], continent:'europe' },
  { country:'冰島', aliases:['冰島','iceland','is'], continent:'europe' },

  { country:'美國', aliases:['美國','usa','us','united states','america','u.s.'], continent:'north_america' },
  { country:'加拿大', aliases:['加拿大','canada','ca'], continent:'north_america' },
  { country:'墨西哥', aliases:['墨西哥','mexico','mx'], continent:'north_america' },

  { country:'巴西', aliases:['巴西','brazil','br'], continent:'south_america' },
  { country:'阿根廷', aliases:['阿根廷','argentina','ar'], continent:'south_america' },
  { country:'智利', aliases:['智利','chile','cl'], continent:'south_america' },
  { country:'祕魯', aliases:['祕魯','秘魯','peru','pe'], continent:'south_america' },
  { country:'玻利維亞', aliases:['玻利維亞','bolivia','bo'], continent:'south_america' },
  { country:'哥倫比亞', aliases:['哥倫比亞','colombia','co'], continent:'south_america' },

  { country:'南非', aliases:['南非','south africa','za'], continent:'africa' },
  { country:'摩洛哥', aliases:['摩洛哥','morocco','ma'], continent:'africa' },
  { country:'埃及', aliases:['埃及','egypt','eg'], continent:'africa' },
  { country:'坦尚尼亞', aliases:['坦尚尼亞','坦桑尼亞','tanzania','tz'], continent:'africa' },
  { country:'肯亞', aliases:['肯亞','kenya','ke'], continent:'africa' },

  { country:'澳洲', aliases:['澳洲','澳大利亞','australia','au'], continent:'oceania' },
  { country:'紐西蘭', aliases:['紐西蘭','新西蘭','new zealand','nz'], continent:'oceania' },
];

// 國旗（emoji；Twemoji 會轉成 SVG）
const COUNTRY_FLAGS = {
  '日本':'🇯🇵','韓國':'🇰🇷','台灣':'🇹🇼','中國':'🇨🇳','蒙古':'🇲🇳','哈薩克':'🇰🇿','吉爾吉斯':'🇰🇬','烏茲別克':'🇺🇿','塔吉克':'🇹🇯','土庫曼':'🇹🇲',
  '印度':'🇮🇳','泰國':'🇹🇭','越南':'🇻🇳','馬來西亞':'🇲🇾','印尼':'🇮🇩','尼泊爾':'🇳🇵','以色列':'🇮🇱','約旦':'🇯🇴','土耳其':'🇹🇷',
  '俄羅斯':'🇷🇺','芬蘭':'🇫🇮','挪威':'🇳🇴','瑞典':'🇸🇪','英國':'🇬🇧','法國':'🇫🇷','德國':'🇩🇪','義大利':'🇮🇹','西班牙':'🇪🇸','葡萄牙':'🇵🇹','捷克':'🇨🇿','奧地利':'🇦🇹','冰島':'🇮🇸',
  '美國':'🇺🇸','加拿大':'🇨🇦','墨西哥':'🇲🇽',
  '巴西':'🇧🇷','阿根廷':'🇦🇷','智利':'🇨🇱','祕魯':'🇵🇪','玻利維亞':'🇧🇴','哥倫比亞':'🇨🇴',
  '南非':'🇿🇦','摩洛哥':'🇲🇦','埃及':'🇪🇬','坦尚尼亞':'🇹🇿','肯亞':'🇰🇪',
  '澳洲':'🇦🇺','紐西蘭':'🇳🇿'
};
const getFlag = (country) => COUNTRY_FLAGS[country] || '';

// 建查表：精確（tags）與文本（title/desc）
const ALIAS_EXACT = new Map();
const ALIAS_TEXT = [];
for (const row of COUNTRY_INDEX) {
  for (const a of row.aliases) {
    const key = norm(a);
    ALIAS_EXACT.set(key, { country: row.country, continent: row.continent });
    if (key.length > 2) ALIAS_TEXT.push({ alias: key, country: row.country, continent: row.continent });
  }
}
ALIAS_TEXT.sort((a,b)=>b.alias.length-a.alias.length);

// 判斷國家/洲：tags(精確) → title(子字串) → desc(子字串) → 區域提示詞 → 其他
function guessCountryAndContinent({ title='', desc='', tags=[] }) {
  const nt = norm(title), nd = norm(desc);
  const nTags = (Array.isArray(tags) ? tags : []).map(t => norm(String(t))).filter(Boolean);

  for (const t of nTags) { const hit = ALIAS_EXACT.get(t); if (hit) return hit; }
  for (const row of ALIAS_TEXT) if (nt.includes(row.alias)) return row;
  for (const row of ALIAS_TEXT) if (nd.includes(row.alias)) return row;

  for (const t of nTags) { const cont = REGION_HINTS.get(t); if (cont) return { country:null, continent:cont }; }
  for (const [hint, cont] of REGION_HINTS.entries()) {
    const h = norm(hint);
    if (h.length>2 && (nt.includes(h) || nd.includes(h))) return { country:null, continent:cont };
  }
  return { country:null, continent:'other' };
}

function classifyItem(v) {
  const { country, continent } = guessCountryAndContinent({ title:v.title||'', desc:v.desc||'', tags:v.tags||[] });
  const contKey = continent || 'other';
  const contLabel = (CONTINENTS.find(c=>c.key===contKey)||{label:'其他'}).label;
  let countryKey = country ? norm(country) : 'mixed';
  let countryLabel = country || '綜合';
  return { continentKey:contKey, continentLabel:contLabel, countryKey, countryLabel };
}

// 主程式：抓 Contentful → 分組 → 渲染
(async function runAllVideos(){
  const container = $('#all-videos');
  if (!container) return;

  // 確保 Contentful SDK 存在
  if (typeof contentful === 'undefined') {
    container.innerHTML = '<div class="placeholder">❌ 找不到 Contentful SDK，請在 &lt;head&gt; 加入 contentful 的 <script>。</div>';
    return;
  }

  let res;
  try {
    const client = contentful.createClient({
      space: 'os5wf90ljenp',
      accessToken: 'YOUR_DELIVERY_TOKEN'
    });
    res = await client.getEntries({ content_type:'video', order:'-sys.updatedAt', limit:500 });
  } catch (e) {
    console.error('Contentful 連線失敗（all-videos）：', e);
    container.innerHTML = '<div class="placeholder">❌ 目前無法載入所有節目。</div>';
    return;
  }

  const pick = (obj, keys) => { for (const k of keys) if (obj && obj[k]!=null && obj[k]!=='') return obj[k]; return ''; };
  const items = (res.items||[]).map(it=>{
    const f = it.fields||{};
    const title = pick(f,['影片標題','title']);
    const desc  = pick(f,['精選推薦影片說明文字','description']);
    const ytid  = pick(f,['YouTube ID','youTubeId']);
    const mp4   = pick(f,['MP4 影片網址','mp4Url']);
    const tags  = Array.isArray(f.tags)?f.tags:[];
    let thumb   = f.thumbnail?.fields?.file?.url || '';
    if (thumb && !thumb.startsWith('http')) thumb = 'https:' + thumb;
    if (!thumb && ytid) thumb = `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`;
    return { title, desc, ytid, mp4, tags, thumb };
  });

  // 分組
  const groups = {};
  for (const v of items) {
    const slot = classifyItem(v);
    groups[slot.continentKey] ??= { label: slot.continentLabel, countries:{} };
    groups[slot.continentKey].countries[slot.countryKey] ??= { label: slot.countryLabel, items: [] };
    groups[slot.continentKey].countries[slot.countryKey].items.push(v);
  }

  // 渲染
  container.innerHTML = '';

  // 洲別快速錨點
  const nav = document.createElement('div');
  nav.className = 'quick-nav';
  for (const c of CONTINENTS) {
    if (!groups[c.key]) continue;
    const a = document.createElement('a');
    a.href = `#cont-${c.key}`;
    a.textContent = c.label;
    nav.appendChild(a);
  }
  container.appendChild(nav);

  for (const c of CONTINENTS) {
    const node = groups[c.key];
    if (!node) continue;

    const contSection = document.createElement('section');
    contSection.id = `cont-${c.key}`;
    contSection.innerHTML = `<h2 class="continent-title">${node.label}</h2><div class="continent-body"></div>`;
    container.appendChild(contSection);
    const body = contSection.querySelector('.continent-body');

    const entries = Object.entries(node.countries).sort((a,b)=>{
      const A = a[1].label === '綜合' ? '~~~' : a[1].label;
      const B = b[1].label === '綜合' ? '~~~' : b[1].label;
      return String(A).localeCompare(String(B), 'zh-Hant');
    });

    for (const [ckey, bucket] of entries) {
      const flag = bucket.label === '綜合' ? '' : getFlag(bucket.label);
      const block = document.createElement('div');
      block.id = `country-${c.key}-${ckey}`;
      block.innerHTML = `
        <h3 class="country-title">
          ${flag ? `<span class="country-flag">${flag}</span>` : ''}
          ${bucket.label}
        </h3>
        <div class="video-grid"></div>`;
      body.appendChild(block);

      const grid = block.querySelector('.video-grid');
      const frag = document.createDocumentFragment();

      bucket.items.forEach(v=>{
        const safeTitle = escapeHtml(v.title || '未命名影片');
        const safeDesc  = v.desc ? escapeHtml(v.desc) : '';
        const ytFallback = v.ytid ? `https://i.ytimg.com/vi/${v.ytid}/hqdefault.jpg` : '';

        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
          <div class="video-thumb">
            ${v.thumb ? `<img src="${v.thumb}" alt="${safeTitle}" loading="lazy" decoding="async"
                          onerror="this.onerror=null;this.src='${ytFallback}';">`
                      : `<div style="width:100%;height:100%;background:#e5e7eb;"></div>`}
          </div>
          <div class="video-content">
            ${Array.isArray(v.tags)&&v.tags.length ? `<div class="video-tags">${v.tags.map(t=>escapeHtml(String(t))).join(' / ')}</div>` : ``}
            <div class="video-title">${safeTitle}</div>
            ${safeDesc ? `<div class="video-desc">${safeDesc}</div>` : ``}
            ${
              v.ytid
                ? `<button class="video-cta" data-videoid="${escapeHtml(v.ytid)}">立即觀看</button>`
                : (v.mp4 ? `<a class="video-cta" href="${escapeHtml(v.mp4)}" target="_blank" rel="noopener">播放 MP4</a>` : ``)
            }
          </div>`;
        frag.appendChild(card);
      });
      grid.appendChild(frag);
    }
  }

  // 解析國旗 emoji → SVG（解決 Windows 只顯示字母）
  if (window.twemoji) {
    twemoji.parse(document.getElementById('all-videos'), {
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      folder: 'svg',
      ext: '.svg'
    });
  }

  // 點卡片播放（若你的首頁有 openFullscreenPlayer 就沿用，否則開新分頁）
  document.body.addEventListener('click', (e)=>{
    const btn = e.target?.closest?.('.video-cta');
    if (!btn) return;
    const id = btn.dataset.videoid;
    if (!id) return;
    if (typeof window.openFullscreenPlayer === 'function') {
      window.openFullscreenPlayer(id);
    } else {
      window.open(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`, '_blank', 'noopener');
    }
  });
})();
