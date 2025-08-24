/**
 * 📺 節目歸檔與分類系統
 * 自動將播完的節目歸檔並按多維度分類
 */

class ProgramArchiveSystem {
  constructor() {
    this.contentful = null;
    this.archivedPrograms = [];
    this.filters = {
      country: '',
      category: '',
      week: '',
      rating: 0,
      viewCount: 0,
      status: ''
    };
  }

  // 初始化系統
  async init(contentfulClient) {
    this.contentful = contentfulClient;
    await this.loadArchivedPrograms();
    this.setupEventListeners();
  }

  // 載入已歸檔節目
  async loadArchivedPrograms() {
    try {
      const response = await this.contentful.getEntries({
        content_type: 'programArchive',
        order: '-sys.createdAt',
        limit: 1000
      });
      
      this.archivedPrograms = response.items.map(item => ({
        id: item.sys.id,
        title: item.fields.originalProgram?.fields?.title || '未知節目',
        airDate: item.fields.airDate,
        weekNumber: item.fields.weekNumber,
        country: item.fields.country,
        category: item.fields.category,
        subCategory: item.fields.subCategory,
        tags: item.fields.tags || [],
        rating: item.fields.rating || 0,
        viewCount: item.fields.viewCount || 0,
        favoriteCount: item.fields.favoriteCount || 0,
        status: item.fields.status,
        videoId: item.fields.originalProgram?.fields?.videoId,
        description: item.fields.originalProgram?.fields?.description,
        duration: item.fields.originalProgram?.fields?.duration
      }));
      
      console.log(`載入 ${this.archivedPrograms.length} 個歸檔節目`);
    } catch (error) {
      console.error('載入歸檔節目失敗:', error);
    }
  }

  // 自動歸檔節目
  async autoArchivePrograms() {
    try {
      // 獲取已播出但未歸檔的節目
      const airedPrograms = await this.getAiredPrograms();
      
      for (const program of airedPrograms) {
        if (!await this.isArchived(program.sys.id)) {
          await this.createArchiveEntry(program);
        }
      }
      
      console.log(`自動歸檔完成，處理了 ${airedPrograms.length} 個節目`);
    } catch (error) {
      console.error('自動歸檔失敗:', error);
    }
  }

  // 獲取已播出的節目
  async getAiredPrograms() {
    const now = new Date();
    const response = await this.contentful.getEntries({
      content_type: '排表項目',
      'fields.airDate[lt]': now.toISOString(),
      'fields.status': 'aired',
      limit: 1000
    });
    
    return response.items;
  }

  // 檢查節目是否已歸檔
  async isArchived(programId) {
    const response = await this.contentful.getEntries({
      content_type: 'programArchive',
      'fields.originalProgram.sys.id': programId,
      limit: 1
    });
    
    return response.items.length > 0;
  }

  // 創建歸檔記錄
  async createArchiveEntry(program) {
    const archiveData = {
      originalProgram: {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: program.sys.id
        }
      },
      airDate: program.fields.airDate,
      weekNumber: this.getWeekNumber(program.fields.airDate),
      country: this.extractCountry(program.fields.title),
      category: program.fields.category,
      subCategory: this.determineSubCategory(program.fields),
      tags: this.generateTags(program.fields),
      rating: 0,
      viewCount: 0,
      favoriteCount: 0,
      status: 'archived',
      notes: ''
    };

    try {
      const entry = await this.contentful.createEntry('programArchive', archiveData);
      await entry.publish();
      console.log(`節目 "${program.fields.title}" 已歸檔`);
      return entry;
    } catch (error) {
      console.error('創建歸檔記錄失敗:', error);
    }
  }

  // 從標題提取國家資訊
  extractCountry(title) {
    const countryPatterns = {
      '日本': ['日本', '東京', '大阪', '京都', '北海道', '奈良', '神戶', '橫濱', '福岡', '札幌'],
      '韓國': ['韓國', '首爾', '釜山', '濟州島', '大邱', '仁川', '光州', '大田'],
      '泰國': ['泰國', '曼谷', '清邁', '普吉島', '芭達雅', '華欣', '蘇梅島'],
      '越南': ['越南', '河內', '胡志明市', '峴港', '會安', '下龍灣'],
      '新加坡': ['新加坡', '新加坡市'],
      '馬來西亞': ['馬來西亞', '吉隆坡', '檳城', '馬六甲', '蘭卡威'],
      '印尼': ['印尼', '雅加達', '峇里島', '日惹', '萬隆'],
      '法國': ['法國', '巴黎', '里昂', '馬賽', '尼斯', '波爾多', '圖盧茲'],
      '義大利': ['義大利', '羅馬', '米蘭', '佛羅倫斯', '威尼斯', '那不勒斯'],
      '德國': ['德國', '柏林', '慕尼黑', '漢堡', '法蘭克福', '科隆'],
      '英國': ['英國', '倫敦', '曼徹斯特', '利物浦', '愛丁堡', '格拉斯哥'],
      '西班牙': ['西班牙', '馬德里', '巴塞隆納', '塞維利亞', '瓦倫西亞'],
      '美國': ['美國', '紐約', '洛杉磯', '芝加哥', '舊金山', '邁阿密'],
      '加拿大': ['加拿大', '多倫多', '溫哥華', '蒙特婁', '卡加利'],
      '澳洲': ['澳洲', '雪梨', '墨爾本', '布里斯本', '伯斯', '阿德雷德'],
      '紐西蘭': ['紐西蘭', '奧克蘭', '威靈頓', '基督城', '皇后鎮']
    };

    const normalizedTitle = title.toLowerCase();
    
    for (const [country, patterns] of Object.entries(countryPatterns)) {
      if (patterns.some(pattern => normalizedTitle.includes(pattern.toLowerCase()))) {
        return country;
      }
    }
    
    return '其他';
  }

  // 確定子分類
  determineSubCategory(fields) {
    const title = fields.title?.toLowerCase() || '';
    const description = fields.description?.toLowerCase() || '';
    const tags = fields.tags || [];
    
    const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
    
    if (content.includes('美食') || content.includes('料理') || content.includes('餐廳')) return '美食';
    if (content.includes('文化') || content.includes('歷史') || content.includes('古蹟')) return '文化';
    if (content.includes('自然') || content.includes('風景') || content.includes('景觀')) return '自然';
    if (content.includes('藝術') || content.includes('博物館') || content.includes('畫廊')) return '藝術';
    if (content.includes('海洋') || content.includes('海灘') || content.includes('潛水')) return '海洋';
    if (content.includes('溫泉') || content.includes('泡湯') || content.includes('spa')) return '溫泉';
    if (content.includes('節慶') || content.includes('祭典') || content.includes('慶典')) return '節慶';
    if (content.includes('購物') || content.includes('市場') || content.includes('商店')) return '購物';
    if (content.includes('冒險') || content.includes('探險') || content.includes('極限')) return '冒險';
    
    return '其他';
  }

  // 生成標籤
  generateTags(fields) {
    const tags = new Set();
    
    // 從標題提取關鍵字
    const title = fields.title || '';
    const keywords = title.match(/[a-zA-Z\u4e00-\u9fa5]+/g) || [];
    keywords.forEach(keyword => {
      if (keyword.length > 1) tags.add(keyword);
    });
    
    // 從描述提取標籤
    const description = fields.description || '';
    const descKeywords = description.match(/[a-zA-Z\u4e00-\u9fa5]+/g) || [];
    descKeywords.forEach(keyword => {
      if (keyword.length > 1 && tags.size < 10) tags.add(keyword);
    });
    
    return Array.from(tags).slice(0, 10);
  }

  // 獲取週別
  getWeekNumber(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((d - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  // 篩選節目
  filterPrograms(filters = {}) {
    this.filters = { ...this.filters, ...filters };
    
    return this.archivedPrograms.filter(program => {
      if (this.filters.country && program.country !== this.filters.country) return false;
      if (this.filters.category && program.category !== this.filters.category) return false;
      if (this.filters.week && program.weekNumber !== this.filters.week) return false;
      if (this.filters.rating && program.rating < this.filters.rating) return false;
      if (this.filters.viewCount && program.viewCount < this.filters.viewCount) return false;
      if (this.filters.status && program.status !== this.filters.status) return false;
      
      return true;
    });
  }

  // 排序節目
  sortPrograms(programs, sortBy = 'airDate', order = 'desc') {
    return programs.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'airDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (order === 'desc') {
        return bVal - aVal;
      } else {
        return aVal - bVal;
      }
    });
  }

  // 獲取統計數據
  getStatistics() {
    const stats = {
      total: this.archivedPrograms.length,
      byCountry: {},
      byCategory: {},
      byWeek: {},
      byStatus: {},
      averageRating: 0,
      totalViews: 0,
      totalFavorites: 0
    };

    this.archivedPrograms.forEach(program => {
      // 國家統計
      stats.byCountry[program.country] = (stats.byCountry[program.country] || 0) + 1;
      
      // 分類統計
      stats.byCategory[program.category] = (stats.byCategory[program.category] || 0) + 1;
      
      // 週別統計
      stats.byWeek[program.weekNumber] = (stats.byWeek[program.weekNumber] || 0) + 1;
      
      // 狀態統計
      stats.byStatus[program.status] = (stats.byStatus[program.status] || 0) + 1;
      
      // 累計數據
      stats.totalViews += program.viewCount;
      stats.totalFavorites += program.favoriteCount;
    });

    // 計算平均評分
    const ratedPrograms = this.archivedPrograms.filter(p => p.rating > 0);
    if (ratedPrograms.length > 0) {
      stats.averageRating = ratedPrograms.reduce((sum, p) => sum + p.rating, 0) / ratedPrograms.length;
    }

    return stats;
  }

  // 設置事件監聽器
  setupEventListeners() {
    // 篩選器變更事件
    document.addEventListener('filterChange', (e) => {
      this.updateDisplay();
    });

    // 排序變更事件
    document.addEventListener('sortChange', (e) => {
      this.updateDisplay();
    });
  }

  // 更新顯示
  updateDisplay() {
    const filteredPrograms = this.filterPrograms();
    const sortedPrograms = this.sortPrograms(filteredPrograms, 'airDate', 'desc');
    
    this.renderPrograms(sortedPrograms);
    this.updateStatistics();
  }

  // 渲染節目列表
  renderPrograms(programs) {
    const container = document.getElementById('archived-programs');
    if (!container) return;

    container.innerHTML = programs.map(program => `
      <div class="program-card" data-id="${program.id}">
        <div class="program-thumbnail">
          <img src="https://img.youtube.com/vi/${program.videoId}/mqdefault.jpg" alt="${program.title}">
          <div class="program-duration">${program.duration}分鐘</div>
        </div>
        <div class="program-info">
          <h3 class="program-title">${program.title}</h3>
          <div class="program-meta">
            <span class="program-date">${new Date(program.airDate).toLocaleDateString('zh-TW')}</span>
            <span class="program-country">${program.country}</span>
            <span class="program-category">${program.category}</span>
          </div>
          <div class="program-stats">
            <span class="rating">⭐ ${program.rating.toFixed(1)}</span>
            <span class="views">👁️ ${program.viewCount}</span>
            <span class="favorites">❤️ ${program.favoriteCount}</span>
          </div>
          <div class="program-tags">
            ${program.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  // 更新統計資訊
  updateStatistics() {
    const stats = this.getStatistics();
    const statsContainer = document.getElementById('archive-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">總節目數</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.averageRating.toFixed(1)}</div>
          <div class="stat-label">平均評分</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.totalViews}</div>
          <div class="stat-label">總觀看次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.totalFavorites}</div>
          <div class="stat-label">總收藏數</div>
        </div>
      </div>
    `;
  }
}

// 全域實例
window.programArchiveSystem = new ProgramArchiveSystem();

// 自動歸檔定時器（每日凌晨執行）
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    window.programArchiveSystem.autoArchivePrograms();
  }
}, 60000); // 每分鐘檢查一次

export default ProgramArchiveSystem;
