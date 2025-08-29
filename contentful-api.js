// Contentful API 整合
class ContentfulAPI {
  constructor() {
    this.spaceId = 'os5wf90ljenp';
    this.deliveryToken = 'YOUR_DELIVERY_TOKEN';
    this.managementToken = null; // 需要從環境變數獲取
    
    // 初始化 Contentful 客戶端
    this.client = contentful.createClient({
      space: this.spaceId,
      accessToken: this.deliveryToken
    });
  }
  
  // 設置 Management Token
  setManagementToken(token) {
    this.managementToken = token;
  }
  
  // 驗證用戶（模擬 - 實際需要 Management API）
  async authenticateUser(email, password) {
    try {
      // 這裡應該調用 Contentful Management API
      // 目前使用模擬驗證
      const authorizedUsers = [
        {
          email: 'admin@travelchannel.com',
          name: '系統管理員',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'publish']
        },
        {
          email: 'editor@travelchannel.com',
          name: '節目編輯',
          role: 'editor',
          permissions: ['read', 'write']
        },
        {
          email: 'viewer@travelchannel.com',
          name: '節目查看者',
          role: 'viewer',
          permissions: ['read']
        }
      ];
      
      const user = authorizedUsers.find(u => u.email === email);
      if (user && password === 'password123') {
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('認證錯誤:', error);
      return null;
    }
  }
  
  // 獲取節目範本
  async getProgramTemplates() {
    try {
      const response = await this.client.getEntries({
        content_type: 'programTemplate',
        include: 2
      });
      
      return response.items.map(item => ({
        id: item.sys.id,
        name: item.fields.templateName,
        titlePattern: item.fields.titlePattern,
        duration: item.fields.duration,
        category: item.fields.category,
        description: item.fields.description,
        status: item.fields.defaultStatus,
        color: item.fields.colorCode,
        videoType: item.fields.videoType,
        tags: item.fields.tags || []
      }));
    } catch (error) {
      console.error('獲取節目範本失敗:', error);
      return [];
    }
  }
  
  // 獲取月曆排程
  async getMonthlySchedule(year, month) {
    try {
      const monthString = month.toString().padStart(2, '0');
      const monthYear = `${year}-${monthString}`;
      
      const response = await this.client.getEntries({
        content_type: 'monthlySchedule',
        'fields.monthYear': monthYear,
        include: 2
      });
      
      if (response.items.length > 0) {
        return response.items[0].fields.programs || [];
      }
      
      return [];
    } catch (error) {
      console.error('獲取月曆排程失敗:', error);
      return [];
    }
  }
  
  // 保存月曆排程
  async saveMonthlySchedule(year, month, programs) {
    try {
      const monthString = month.toString().padStart(2, '0');
      const monthYear = `${year}-${monthString}`;
      
      // 這裡應該使用 Management API 創建或更新內容
      console.log('保存月曆排程:', {
        monthYear,
        programs: programs.length
      });
      
      return true;
    } catch (error) {
      console.error('保存月曆排程失敗:', error);
      return false;
    }
  }
  
  // 獲取影片資源
  async getVideoAssets() {
    try {
      const response = await this.client.getEntries({
        content_type: 'videoAsset',
        include: 2
      });
      
      return response.items.map(item => ({
        id: item.sys.id,
        title: item.fields.title,
        videoFile: item.fields.videoFile?.fields?.file?.url,
        thumbnail: item.fields.thumbnail?.fields?.file?.url,
        duration: item.fields.duration,
        category: item.fields.category,
        description: item.fields.description,
        tags: item.fields.tags || [],
        uploadDate: item.fields.uploadDate
      }));
    } catch (error) {
      console.error('獲取影片資源失敗:', error);
      return [];
    }
  }
  
  // 記錄用戶活動
  async logUserActivity(userEmail, action, target, details) {
    try {
      const activity = {
        userEmail,
        action,
        target,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: 'client-ip' // 實際應用中需要獲取真實 IP
      };
      
      // 這裡應該使用 Management API 創建活動記錄
      console.log('記錄用戶活動:', activity);
      
      return true;
    } catch (error) {
      console.error('記錄用戶活動失敗:', error);
      return false;
    }
  }
  
  // 創建節目內容
  async createProgram(programData) {
    try {
      // 這裡應該使用 Management API 創建節目內容
      console.log('創建節目:', programData);
      
      return {
        id: 'temp-id-' + Date.now(),
        ...programData
      };
    } catch (error) {
      console.error('創建節目失敗:', error);
      return null;
    }
  }
  
  // 更新節目內容
  async updateProgram(programId, programData) {
    try {
      // 這裡應該使用 Management API 更新節目內容
      console.log('更新節目:', { id: programId, ...programData });
      
      return true;
    } catch (error) {
      console.error('更新節目失敗:', error);
      return false;
    }
  }
  
  // 刪除節目內容
  async deleteProgram(programId) {
    try {
      // 這裡應該使用 Management API 刪除節目內容
      console.log('刪除節目:', programId);
      
      return true;
    } catch (error) {
      console.error('刪除節目失敗:', error);
      return false;
    }
  }
  
  // 獲取 YouTube 影片資訊
  async getYouTubeInfo(videoId) {
    try {
      // 這裡可以調用 YouTube API 獲取影片資訊
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      return {
        thumbnail,
        title: `YouTube 影片: ${videoId}`,
        duration: 0
      };
    } catch (error) {
      console.error('獲取 YouTube 資訊失敗:', error);
      return null;
    }
  }
  
  // 驗證 MP4 連結
  async validateMP4Url(url) {
    try {
      // 這裡可以驗證 MP4 連結是否有效
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('驗證 MP4 連結失敗:', error);
      return false;
    }
  }
}

// 創建全域實例
window.contentfulAPI = new ContentfulAPI();
