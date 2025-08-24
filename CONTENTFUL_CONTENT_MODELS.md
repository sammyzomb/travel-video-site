# 📺 Contentful 內容模型設置指南

## 🎯 **目標**
設置完整的旅遊頻道內容管理系統，支援 YouTube 和 MP4 影片格式。

## 📋 **需要新增的內容類型**

### **1. 節目範本 (Program Template)**

**用途：** 預設節目模板，快速創建節目

**欄位設置：**
- **Template Name** (Short text) - 範本名稱
- **Title Pattern** (Short text) - 標題模式，如 "早安世界 - {地點}"
- **Duration** (Number) - 預設時長（分鐘）
- **Category** (Short text) - 節目分類
- **Description** (Long text) - 節目描述
- **Default Status** (Short text) - 預設狀態（首播/重播/特別節目）
- **Color Code** (Short text) - 顏色代碼（#4caf50）
- **Video Type** (Short text) - 影片類型（YouTube/MP4）
- **Tags** (Array) - 標籤陣列

### **2. 月曆排程 (Monthly Schedule)**

**用途：** 管理整個月的節目安排

**欄位設置：**
- **Month Year** (Short text) - 月份年份（格式：2024-01）
- **Programs** (Array) - 節目陣列
  - Air Date (Date) - 播出日期
  - Air Time (Short text) - 播出時間
  - Title (Short text) - 節目標題
  - Duration (Number) - 節目時長
  - Category (Short text) - 節目分類
  - Description (Long text) - 節目描述
  - Video Type (Short text) - 影片類型
  - Video ID (Short text) - 影片 ID（YouTube ID 或 MP4 連結）
  - Status (Short text) - 節目狀態
  - Created By (Short text) - 創建者
  - Created At (Date) - 創建時間
- **Notes** (Long text) - 備註

### **3. 影片資源 (Video Asset)**

**用途：** 管理 MP4 影片檔案

**欄位設置：**
- **Title** (Short text) - 影片標題
- **Video File** (Media) - MP4 檔案
- **Thumbnail** (Media) - 縮圖
- **Duration** (Number) - 影片時長（秒）
- **Category** (Short text) - 分類
- **Description** (Long text) - 描述
- **Tags** (Array) - 標籤
- **Upload Date** (Date) - 上傳日期

### **4. 用戶活動記錄 (User Activity Log)**

**用途：** 記錄用戶操作

**欄位設置：**
- **User Email** (Short text) - 用戶郵箱
- **Action** (Short text) - 操作類型
- **Target** (Short text) - 操作目標
- **Details** (Long text) - 詳細資訊
- **Timestamp** (Date) - 時間戳記
- **IP Address** (Short text) - IP 地址

## 🔧 **設置步驟**

### **步驟 1：登入 Contentful**
1. 前往 https://app.contentful.com
2. 選擇您的 Space：`os5wf90ljenp`

### **步驟 2：創建內容類型**
1. 點擊左側選單 "Content model"
2. 點擊 "Add content type"
3. 依序創建上述 4 個內容類型

### **步驟 3：設置欄位**
1. 為每個內容類型添加對應欄位
2. 設置欄位類型和驗證規則
3. 設置必填欄位

### **步驟 4：設置權限**
1. 進入 "Settings" > "Roles"
2. 為不同角色設置內容類型權限

## 📹 **影片格式支援**

### **YouTube 影片**
```javascript
{
  videoType: "YouTube",
  videoId: "dQw4w9WgXcQ", // YouTube ID
  thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
}
```

### **MP4 影片**
```javascript
{
  videoType: "MP4",
  videoId: "https://your-domain.com/videos/travel-video.mp4", // MP4 連結
  thumbnail: "https://your-domain.com/thumbnails/travel-thumb.jpg"
}
```

## 🎨 **顏色代碼對應**
- 早安世界：`#4caf50` (綠色)
- 世界廚房：`#ff9800` (橙色)
- 極地探險：`#2196f3` (藍色)
- 城市漫步：`#9c27b0` (紫色)
- 自然奇觀：`#8bc34a` (淺綠色)

## ✅ **完成檢查清單**
- [ ] 創建 Program Template 內容類型
- [ ] 創建 Monthly Schedule 內容類型
- [ ] 創建 Video Asset 內容類型
- [ ] 創建 User Activity Log 內容類型
- [ ] 設置所有欄位和驗證規則
- [ ] 設置用戶權限
- [ ] 測試內容創建功能

## 🚀 **下一步**
完成這些設置後，我將更新前端程式碼以整合這些新的內容類型。

---

**進度：** 內容模型指南創建完成 ✅
**下一步：** 更新前端程式碼以支援新的內容類型
