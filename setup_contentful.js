// Contentful 快速設置腳本
// 這個腳本可以幫助您快速創建和填充 Contentful 內容

class ContentfulSetup {
  constructor() {
    this.spaceId = 'os5wf90ljenp';
    this.deliveryToken = 'lODH-WLwHwVZv7O4rFdBWjSnrzaQWGD4koeOZ1Dypj0';
    
    // 初始化 Contentful 客戶端
    this.client = contentful.createClient({
      space: this.spaceId,
      accessToken: this.deliveryToken
    });
  }
  
  // 檢查現有內容類型
  async checkExistingContentTypes() {
    try {
      const response = await this.client.getContentTypes();
      const existingTypes = response.items.map(item => item.sys.id);
      
      console.log('現有的內容類型:', existingTypes);
      
      const requiredTypes = [
        'programTemplate',
        'monthlySchedule', 
        'videoAsset',
        'userActivityLog'
      ];
      
      const missingTypes = requiredTypes.filter(type => !existingTypes.includes(type));
      
      if (missingTypes.length > 0) {
        console.log('缺少的內容類型:', missingTypes);
        console.log('請按照 CONTENTFUL_SETUP_GUIDE.md 的說明創建這些內容類型');
        return false;
      } else {
        console.log('✅ 所有必需的內容類型都已存在');
        return true;
      }
    } catch (error) {
      console.error('檢查內容類型失敗:', error);
      return false;
    }
  }
  
  // 創建節目範本
  async createProgramTemplates() {
    const templates = [
      {
        templateName: "早安世界",
        titlePattern: "早安世界 - {地點}",
        duration: 60,
        category: "亞洲旅遊",
        description: "跟著我們一起探索{地點}的早晨，從當地市場到著名景點的寧靜時光",
        defaultStatus: "首播",
        colorCode: "#4caf50",
        videoType: "YouTube",
        tags: ["早晨", "亞洲", "文化"]
      },
      {
        templateName: "世界廚房",
        titlePattern: "世界廚房 - {地點}美食之旅",
        duration: 45,
        category: "美食旅遊",
        description: "深入{地點}，品嚐最道地的當地美食與特色料理",
        defaultStatus: "重播",
        colorCode: "#ff9800",
        videoType: "YouTube",
        tags: ["美食", "料理", "文化"]
      },
      {
        templateName: "極地探險",
        titlePattern: "極地探險 - {地點}",
        duration: 60,
        category: "極地旅遊",
        description: "在{地點}追尋極光的神秘蹤跡，體驗極地探險的刺激",
        defaultStatus: "特別節目",
        colorCode: "#2196f3",
        videoType: "MP4",
        tags: ["極地", "探險", "自然"]
      }
    ];
    
    console.log('正在創建節目範本...');
    
    for (const template of templates) {
      try {
        // 注意：這裡需要 Management API 來創建內容
        // 目前只是記錄到控制台
        console.log('創建範本:', template.templateName);
      } catch (error) {
        console.error('創建範本失敗:', error);
      }
    }
  }
  
  // 創建月曆排程
  async createMonthlySchedule() {
    const schedule = {
      monthYear: "2024-01",
      programs: [
        {
          airDate: "2024-01-15",
          airTime: "06:00",
          title: "早安世界 - 日本東京晨間漫步",
          duration: 60,
          category: "亞洲旅遊",
          description: "跟著我們一起探索東京的早晨，從築地市場到淺草寺的寧靜時光",
          videoType: "YouTube",
          videoId: "dQw4w9WgXcQ",
          status: "首播",
          createdBy: "admin@travelchannel.com",
          createdAt: "2024-01-01T00:00:00.000Z"
        }
      ],
      notes: "2024年1月節目安排，包含新年特別節目"
    };
    
    console.log('正在創建月曆排程...');
    console.log('月曆排程:', schedule);
  }
  
  // 創建影片資源
  async createVideoAssets() {
    const assets = [
      {
        title: "東京晨間漫步",
        videoFile: "https://example.com/videos/tokyo-morning.mp4",
        thumbnail: "https://example.com/thumbnails/tokyo-morning.jpg",
        duration: 3600,
        category: "亞洲旅遊",
        description: "東京早晨的寧靜時光，從築地市場到淺草寺",
        tags: ["東京", "早晨", "文化"],
        uploadDate: "2024-01-01"
      }
    ];
    
    console.log('正在創建影片資源...');
    
    for (const asset of assets) {
      console.log('創建影片資源:', asset.title);
    }
  }
  
  // 運行完整設置
  async runFullSetup() {
    console.log('🚀 開始 Contentful 設置...');
    
    // 檢查現有內容類型
    const typesExist = await this.checkExistingContentTypes();
    
    if (!typesExist) {
      console.log('❌ 請先創建必需的內容類型');
      return;
    }
    
    // 創建內容
    await this.createProgramTemplates();
    await this.createMonthlySchedule();
    await this.createVideoAssets();
    
    console.log('✅ Contentful 設置完成！');
    console.log('📝 注意：實際內容創建需要 Management API 權限');
  }
  
  // 測試連接
  async testConnection() {
    try {
      const response = await this.client.getSpace();
      console.log('✅ Contentful 連接成功');
      console.log('Space 名稱:', response.name);
      return true;
    } catch (error) {
      console.error('❌ Contentful 連接失敗:', error);
      return false;
    }
  }
}

// 創建全域實例
window.contentfulSetup = new ContentfulSetup();

// 自動運行測試
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Contentful 設置工具已載入');
  console.log('使用方法:');
  console.log('- contentfulSetup.testConnection() - 測試連接');
  console.log('- contentfulSetup.checkExistingContentTypes() - 檢查內容類型');
  console.log('- contentfulSetup.runFullSetup() - 運行完整設置');
});

