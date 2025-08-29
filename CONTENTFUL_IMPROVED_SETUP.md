# 🎯 Contentful 節目表管理系統 - 改進版

## 📋 系統概述

本指南提供一個完整的月度節目表管理系統，讓您可以輕鬆管理整個月的節目安排，並與首頁的「今日節目表」完美整合。

## 🏗️ 改進的內容模型設計

### 1. 主要內容類型：`Monthly Schedule`（月度節目表）

#### 欄位設定：

| 欄位名稱 | 欄位類型 | 必填 | API Identifier | 說明 |
|---------|---------|------|---------------|------|
| 月份年份 | Short text | ✓ | monthYear | 格式：2024-01 |
| 節目清單 | Array | ✓ | programs | 該月所有節目 |
| 備註 | Long text | | notes | 月度節目表備註 |

#### 節目清單（Array）中的每個項目包含：

| 欄位名稱 | 欄位類型 | 必填 | API Identifier | 說明 |
|---------|---------|------|---------------|------|
| 播出日期 | Date | ✓ | airDate | 節目播出日期 |
| 播出時間 | Short text | ✓ | airTime | 格式：HH:MM |
| 節目時長 | Number | ✓ | duration | 分鐘數 |
| 節目標題 | Short text | ✓ | title | 節目名稱 |
| 節目分類 | Short text | ✓ | category | 旅遊分類 |
| 節目描述 | Long text | | description | 節目簡介 |
| 節目縮圖 | Media | | thumbnail | 節目圖片 |
| YouTube ID | Short text | | youtubeId | YouTube影片ID |
| 節目狀態 | Short text | | status | 首播/重播/特別節目 |
| 節目標籤 | Array | | tags | 節目標籤 |

### 2. 輔助內容類型：`Program Template`（節目範本）

#### 欄位設定：

| 欄位名稱 | 欄位類型 | 必填 | API Identifier | 說明 |
|---------|---------|------|---------------|------|
| 範本名稱 | Short text | ✓ | templateName | 範本識別名稱 |
| 節目標題 | Short text | ✓ | title | 節目名稱 |
| 節目時長 | Number | ✓ | duration | 分鐘數 |
| 節目分類 | Short text | ✓ | category | 旅遊分類 |
| 節目描述 | Long text | | description | 節目簡介 |
| 節目縮圖 | Media | | thumbnail | 節目圖片 |
| YouTube ID | Short text | | youtubeId | YouTube影片ID |
| 節目標籤 | Array | | tags | 節目標籤 |

## 🎨 簡化的後台操作流程

### 步驟 1：建立節目範本
1. 在 Contentful 中創建「Program Template」內容
2. 填寫常用節目的基本信息
3. 發布範本

### 步驟 2：建立月度節目表
1. 創建「Monthly Schedule」內容
2. 選擇月份年份（如：2024-01）
3. 使用範本快速添加節目

### 步驟 3：批量安排節目
1. 複製節目範本
2. 修改播出日期和時間
3. 批量發布

## 🔧 程式碼整合

### 1. 更新 script.js 中的節目表載入邏輯

```javascript
// 載入節目時間表數據
async function loadScheduleData() {
  try {
    // 獲取台灣時間
    const taiwanTime = getTaiwanTime();
    const currentMonth = taiwanTime.toISOString().slice(0, 7); // YYYY-MM 格式
    
    console.log('正在載入節目表，月份:', currentMonth);
    
    // 從 Contentful 載入月度節目表
    const response = await contentfulClient.getEntries({
      content_type: 'monthlySchedule',
      'fields.monthYear': currentMonth,
      include: 2
    });
    
    if (response.items && response.items.length > 0) {
      const monthlySchedule = response.items[0];
      const programs = monthlySchedule.fields.programs || [];
      
      // 過濾今天的節目
      const today = taiwanTime.toISOString().split('T')[0];
      const todayPrograms = programs.filter(program => 
        program.fields.airDate === today
      );
      
      scheduleData = {
        today: {
          date: today,
          dayOfWeek: getDayOfWeek(taiwanTime),
          month: `${taiwanTime.getMonth() + 1}月`,
          day: `${taiwanTime.getDate()}日`,
          schedule: todayPrograms.map(program => ({
            time: program.fields.airTime,
            title: program.fields.title,
            duration: program.fields.duration.toString(),
            category: program.fields.category,
            description: program.fields.description || '',
            thumbnail: program.fields.thumbnail?.fields?.file?.url || '',
            youtubeId: program.fields.youtubeId || '',
            status: program.fields.status || '',
            tags: program.fields.tags || []
          }))
        }
      };
      
      console.log('成功載入節目表，共', scheduleData.today.schedule.length, '個節目');
    } else {
      // 如果沒有找到月度節目表，使用預設數據
      scheduleData = {
        today: {
          date: taiwanTime.toISOString().split('T')[0],
          dayOfWeek: getDayOfWeek(taiwanTime),
          month: `${taiwanTime.getMonth() + 1}月`,
          day: `${taiwanTime.getDate()}日`,
          schedule: getDefaultSchedule(taiwanTime.toISOString().split('T')[0])
        }
      };
    }
    
    updateScheduleDisplay();
    startTimeUpdates();
    
  } catch (error) {
    console.error('載入節目表失敗:', error);
    // 使用預設數據
    const taiwanTime = getTaiwanTime();
    scheduleData = {
      today: {
        date: taiwanTime.toISOString().split('T')[0],
        dayOfWeek: getDayOfWeek(taiwanTime),
        month: `${taiwanTime.getMonth() + 1}月`,
        day: `${taiwanTime.getDate()}日`,
        schedule: getDefaultSchedule(taiwanTime.toISOString().split('T')[0])
      }
    };
    updateScheduleDisplay();
    startTimeUpdates();
  }
}
```

### 2. 更新 schedule.js 支援月度節目表

```javascript
// 載入節目數據
async function loadScheduleData() {
  try {
    const taiwanTime = getTaiwanTime();
    const currentMonth = taiwanTime.toISOString().slice(0, 7);
    
    // 從 Contentful 載入月度節目表
    const response = await contentfulClient.getEntries({
      content_type: 'monthlySchedule',
      'fields.monthYear': currentMonth,
      include: 2
    });
    
    if (response.items && response.items.length > 0) {
      const monthlySchedule = response.items[0];
      scheduleData = {
        monthly: monthlySchedule.fields.programs || [],
        currentMonth: currentMonth
      };
    } else {
      // 使用預設數據
      scheduleData = {
        monthly: [],
        currentMonth: currentMonth
      };
    }
  } catch (error) {
    console.error('載入節目數據失敗:', error);
    scheduleData = {
      monthly: [],
      currentMonth: currentMonth
    };
  }
}

// 載入指定日期的節目表
function loadDaySchedule(day) {
  const contentEl = document.getElementById('schedule-day-content');
  if (!contentEl) return;

  // 計算目標日期
  const taiwanTime = getTaiwanTime();
  const weekStart = new Date(taiwanTime);
  weekStart.setUTCDate(taiwanTime.getUTCDate() - taiwanTime.getUTCDay() + 1 + (currentWeek * 7));
  
  const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day);
  const targetDate = new Date(weekStart);
  targetDate.setUTCDate(weekStart.getUTCDate() + dayIndex);
  
  const targetDateString = targetDate.toISOString().split('T')[0];
  
  // 從月度節目表中篩選該日期的節目
  const dayPrograms = scheduleData.monthly.filter(program => 
    program.fields.airDate === targetDateString
  ).sort((a, b) => a.fields.airTime.localeCompare(b.fields.airTime));
  
  if (dayPrograms.length === 0) {
    contentEl.innerHTML = `
      <div class="schedule-empty">
        <div class="empty-icon">📺</div>
        <h3>暫無節目安排</h3>
        <p>${targetDateString} 目前沒有節目安排</p>
      </div>
    `;
    return;
  }

  // 創建節目表
  const scheduleHTML = `
    <div class="schedule-header">
      <div class="time-header">時間</div>
      <div class="program-header">節目</div>
      <div class="duration-header">時長</div>
    </div>
    <div class="schedule-list">
      ${dayPrograms.map(program => createProgramItem(program)).join('')}
    </div>
  `;

  contentEl.innerHTML = scheduleHTML;
}
```

## 📊 後台管理建議

### 1. 使用 Contentful 的批量操作功能

#### 快速建立月度節目表：
1. 建立節目範本庫
2. 使用範本快速複製節目
3. 批量修改日期和時間
4. 一次性發布整個月

#### 節目範本範例：
```
範本名稱：早安世界
節目標題：早安世界 - {地點}晨間漫步
節目時長：60
節目分類：亞洲旅遊
節目描述：跟著我們一起探索{地點}的早晨...
```

### 2. 使用 Contentful 的 Import/Export 功能

#### CSV 匯入格式：
```csv
airDate,airTime,duration,title,category,description,youtubeId,status
2024-01-15,06:00,60,早安世界 - 日本東京晨間漫步,亞洲旅遊,跟著我們一起探索東京的早晨...,dQw4w9WgXcQ,首播
2024-01-15,07:00,45,世界廚房 - 義大利托斯卡尼美食之旅,美食旅遊,深入托斯卡尼鄉村...,9bZkp7q19f0,重播
```

### 3. 自動化建議

#### 使用 Contentful Webhooks：
1. 設定節目發布通知
2. 自動更新網站節目表
3. 發送節目提醒

#### 定期維護：
1. 每月初建立新月份節目表
2. 定期檢查節目連結有效性
3. 更新節目分類和標籤

## 🎯 使用流程

### 管理員操作步驟：

1. **登入 Contentful 後台**
2. **建立節目範本**（一次性工作）
3. **建立月度節目表**
   - 選擇月份（如：2024-01）
   - 從範本庫選擇節目
   - 設定播出日期和時間
4. **批量發布節目**
5. **檢查網站顯示效果**

### 節目安排建議：

- **週一至週五**：亞洲旅遊、歐洲旅遊、美食旅遊
- **週末**：特別節目、精選節目、長片節目
- **黃金時段**（19:00-22:00）：熱門節目、首播節目

## 🔄 與首頁整合

首頁的「今日節目表」會自動：
1. 載入當前月份的節目表
2. 篩選今天的節目
3. 根據台灣時間顯示當前節目
4. 自動更新節目狀態

這樣您就可以：
- 在 Contentful 後台輕鬆管理整個月的節目
- 首頁自動顯示今天的節目安排
- 節目表頁面顯示完整的週節目表
- 所有時間都基於台灣時區（UTC+8）

---

**注意**：請確保您的 Contentful Space ID 和 Access Token 正確設定，並且有足夠的權限來讀取和寫入內容。
