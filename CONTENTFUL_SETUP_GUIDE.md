# 🎯 Contentful 內容類型設置完整指南

## 📋 **設置前準備**
- 確保您已登入 Contentful 帳號
- 選擇正確的 Space：`os5wf90ljenp`
- 準備好約 30 分鐘時間完成設置

---

## 🚀 **步驟 1：創建節目範本 (Program Template)**

### **1.1 進入內容模型**
1. 點擊左側選單 **"Content model"**
2. 點擊 **"Add content type"**
3. 輸入名稱：`Program Template`
4. 點擊 **"Create"**

### **1.2 添加欄位**
依序添加以下欄位：

| 欄位名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| Template Name | Short text | ✅ | 範本名稱 |
| Title Pattern | Short text | ✅ | 標題模式 |
| Duration | Number | ✅ | 預設時長（分鐘） |
| Category | Short text | ✅ | 節目分類 |
| Description | Long text | ❌ | 節目描述 |
| Default Status | Short text | ✅ | 預設狀態 |
| Color Code | Short text | ✅ | 顏色代碼 |
| Video Type | Short text | ✅ | 影片類型 |
| Tags | Array | ❌ | 標籤陣列 |

### **1.3 設置驗證規則**
- **Duration**: 最小值 15，最大值 180
- **Video Type**: 限制為 "YouTube" 或 "MP4"
- **Color Code**: 格式為 #XXXXXX

---

## 🚀 **步驟 2：創建月曆排程 (Monthly Schedule)**

### **2.1 創建內容類型**
1. 點擊 **"Add content type"**
2. 輸入名稱：`Monthly Schedule`
3. 點擊 **"Create"**

### **2.2 添加欄位**
| 欄位名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| Month Year | Short text | ✅ | 月份年份 |
| Programs | Array | ❌ | 節目陣列 |
| Notes | Long text | ❌ | 備註 |

### **2.3 設置 Programs 陣列**
在 Programs 陣列中添加以下欄位：

| 欄位名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| Air Date | Date | ✅ | 播出日期 |
| Air Time | Short text | ✅ | 播出時間 |
| Title | Short text | ✅ | 節目標題 |
| Duration | Number | ✅ | 節目時長 |
| Category | Short text | ✅ | 節目分類 |
| Description | Long text | ❌ | 節目描述 |
| Video Type | Short text | ✅ | 影片類型 |
| Video ID | Short text | ✅ | 影片 ID |
| Status | Short text | ✅ | 節目狀態 |
| Created By | Short text | ✅ | 創建者 |
| Created At | Date | ✅ | 創建時間 |

---

## 🚀 **步驟 3：創建影片資源 (Video Asset)**

### **3.1 創建內容類型**
1. 點擊 **"Add content type"**
2. 輸入名稱：`Video Asset`
3. 點擊 **"Create"**

### **3.2 添加欄位**
| 欄位名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| Title | Short text | ✅ | 影片標題 |
| Video File | Media | ✅ | MP4 檔案 |
| Thumbnail | Media | ❌ | 縮圖 |
| Duration | Number | ✅ | 影片時長（秒） |
| Category | Short text | ✅ | 分類 |
| Description | Long text | ❌ | 描述 |
| Tags | Array | ❌ | 標籤 |
| Upload Date | Date | ✅ | 上傳日期 |

---

## 🚀 **步驟 4：創建用戶活動記錄 (User Activity Log)**

### **4.1 創建內容類型**
1. 點擊 **"Add content type"**
2. 輸入名稱：`User Activity Log`
3. 點擊 **"Create"**

### **4.2 添加欄位**
| 欄位名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| User Email | Short text | ✅ | 用戶郵箱 |
| Action | Short text | ✅ | 操作類型 |
| Target | Short text | ✅ | 操作目標 |
| Details | Long text | ❌ | 詳細資訊 |
| Timestamp | Date | ✅ | 時間戳記 |
| IP Address | Short text | ❌ | IP 地址 |

---

## 📝 **步驟 5：添加範例數據**

### **5.1 進入內容區域**
1. 點擊左側選單 **"Content"**
2. 選擇對應的內容類型
3. 點擊 **"Add entry"**

### **5.2 使用範例數據**
打開 `contentful_sample_data.json` 檔案，複製對應的數據填入欄位。

### **5.3 發布內容**
1. 填寫完所有欄位後，點擊 **"Publish"**
2. 確認發布成功

---

## 🔧 **步驟 6：設置權限**

### **6.1 進入設置**
1. 點擊左側選單 **"Settings"**
2. 選擇 **"Roles"**

### **6.2 設置角色權限**
為不同角色設置內容類型權限：

| 角色 | 權限 | 內容類型 |
|------|------|----------|
| Admin | 讀取、寫入、刪除、發布 | 所有內容類型 |
| Editor | 讀取、寫入 | Program Template, Monthly Schedule, Video Asset |
| Viewer | 讀取 | 所有內容類型 |

---

## ✅ **完成檢查清單**

- [ ] 創建 Program Template 內容類型
- [ ] 創建 Monthly Schedule 內容類型
- [ ] 創建 Video Asset 內容類型
- [ ] 創建 User Activity Log 內容類型
- [ ] 設置所有欄位和驗證規則
- [ ] 添加範例數據
- [ ] 設置用戶權限
- [ ] 測試內容創建功能

---

## 🚨 **常見問題**

### **Q: 如何設置陣列欄位？**
A: 在添加欄位時選擇 "Array" 類型，然後設置陣列元素的欄位結構。

### **Q: 如何設置驗證規則？**
A: 在欄位設置中點擊 "Validations" 標籤，添加相應的驗證規則。

### **Q: 如何設置必填欄位？**
A: 在欄位設置中勾選 "Required" 選項。

---

## 📞 **需要協助？**

如果在設置過程中遇到問題：
1. 檢查 Contentful 文檔：https://www.contentful.com/developers/docs/
2. 查看錯誤訊息並重新檢查欄位設置
3. 確保所有必填欄位都已填寫

---

**完成時間：** 約 30-45 分鐘
**下一步：** 測試前端整合功能
