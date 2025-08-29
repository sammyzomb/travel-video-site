// 版本配置文件
// 統一管理所有頁面的版本資訊

const VERSION_CONFIG = {
  // 當前版本資訊
  current: {
    version: 'v1.2.0',
    releaseDate: '2025/08/28',
    releaseTime: '10:35:00',
    fullVersion: 'v1.2.0 (2025/08/28 10:35:00)',
    description: '後台管理系統完整版'
  },
  
  // 版本歷史
  history: [
    {
      version: 'v1.2.0',
      date: '2025/08/28',
      time: '10:35:00',
      description: '後台管理系統完整版',
      features: [
        '完整的後台管理系統',
        '統一資料同步機制',
        'SSH 認證和換行正規化',
        '每日同步流程指南'
      ]
    },
    {
      version: 'v1.1.0',
      date: '2025/08/27',
      time: '15:25:00',
      description: '後台管理系統基礎版',
      features: [
        '基礎後台管理系統',
        '月曆節目管理',
        '節目表管理',
        '歸檔管理'
      ]
    },
    {
      version: 'v1.0.0',
      date: '2025/08/26',
      time: '09:05:00',
      description: '基礎網站版',
      features: [
        '基礎旅遊電視台網站',
        '節目播放功能',
        '節目表顯示',
        '響應式設計'
      ]
    }
  ],
  
  // 獲取當前版本資訊
  getCurrentVersion() {
    return this.current;
  },
  
  // 獲取完整版本字串
  getFullVersionString() {
    return `${this.current.version} (${this.current.releaseDate} ${this.current.releaseTime})`;
  },
  
  // 獲取版本歷史
  getVersionHistory() {
    return this.history;
  },
  
  // 檢查是否為最新版本
  isLatestVersion(version) {
    return version === this.current.version;
  },
  
  // 格式化版本顯示
  formatVersionDisplay() {
    return `<span style="color: #2b71d2; font-weight: 600;">${this.current.version}</span>`;
  },
  
  // 格式化完整版本顯示
  formatFullVersionDisplay() {
    return `<span style="color: #2b71d2; font-weight: 600;">${this.getFullVersionString()}</span>`;
  }
};

// 如果是在瀏覽器環境中，將配置添加到全域
if (typeof window !== 'undefined') {
  window.VERSION_CONFIG = VERSION_CONFIG;
}

// 如果是在 Node.js 環境中，導出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VERSION_CONFIG;
}
