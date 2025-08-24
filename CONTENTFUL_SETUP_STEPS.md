# 📺 Contentful 設置步驟指南

## 🎯 **第一步：登入 Contentful**

1. 前往：https://app.contentful.com
2. 登入您的帳戶
3. 選擇 Space：`os5wf90ljenp`

## 🎯 **第二步：創建節目範本 (Program Template)**

### 2.1 創建內容類型
1. 點擊左側選單 **"Content model"**
2. 點擊 **"Add content type"**
3. 輸入資訊：
   - **Name**: `Program Template`
   - **API Identifier**: `programTemplate`
   - **Description**: `預設節目模板，快速創建節目`

### 2.2 添加欄位
點擊 **"Add field"** 依序添加以下欄位：

#### 欄位 1：Template Name
- **Field name**: `Template Name`
- **Field ID**: `templateName`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 最大長度 100 字元

#### 欄位 2：Title Pattern
- **Field name**: `Title Pattern`
- **Field ID**: `titlePattern`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Help text**: `標題模式，如 "早安世界 - {地點}"`

#### 欄位 3：Duration
- **Field name**: `Duration`
- **Field ID**: `duration`
- **Field type**: `Number`
- **Required**: ✅ 勾選
- **Validations**: 最小值 1，最大值 480

#### 欄位 4：Category
- **Field name**: `Category`
- **Field ID**: `category`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 預設值選項：
  - 早安世界
  - 世界廚房
  - 極地探險
  - 城市漫步
  - 自然奇觀

#### 欄位 5：Description
- **Field name**: `Description`
- **Field ID**: `description`
- **Field type**: `Long text`
- **Required**: ❌ 不勾選
- **Help text**: `節目描述`

#### 欄位 6：Default Status
- **Field name**: `Default Status`
- **Field ID**: `defaultStatus`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 預設值選項：
  - 首播
  - 重播
  - 特別節目

#### 欄位 7：Color Code
- **Field name**: `Color Code`
- **Field ID**: `colorCode`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 預設值選項：
  - #4caf50 (早安世界)
  - #ff9800 (世界廚房)
  - #2196f3 (極地探險)
  - #9c27b0 (城市漫步)
  - #8bc34a (自然奇觀)

#### 欄位 8：Video Type
- **Field name**: `Video Type`
- **Field ID**: `videoType`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 預設值選項：
  - YouTube
  - MP4

#### 欄位 9：Tags
- **Field name**: `Tags`
- **Field ID**: `tags`
- **Field type**: `Array`
- **Array items**: `Short text`
- **Required**: ❌ 不勾選

### 2.3 保存內容類型
點擊 **"Save"** 保存節目範本內容類型

## 🎯 **第三步：創建月曆排程 (Monthly Schedule)**

### 3.1 創建內容類型
1. 點擊 **"Add content type"**
2. 輸入資訊：
   - **Name**: `Monthly Schedule`
   - **API Identifier**: `monthlySchedule`
   - **Description**: `管理整個月的節目安排`

### 3.2 添加欄位

#### 欄位 1：Month Year
- **Field name**: `Month Year`
- **Field ID**: `monthYear`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 格式：YYYY-MM (如 2024-01)

#### 欄位 2：Programs
- **Field name**: `Programs`
- **Field ID**: `programs`
- **Field type**: `Array`
- **Array items**: `Object`
- **Required**: ✅ 勾選

**Object 欄位設置**：
- **Air Date**: `Date` (必填)
- **Air Time**: `Short text` (必填，格式 HH:MM)
- **Title**: `Short text` (必填)
- **Duration**: `Number` (必填，分鐘)
- **Category**: `Short text` (必填)
- **Description**: `Long text` (選填)
- **Video Type**: `Short text` (必填)
- **Video ID**: `Short text` (必填)
- **Status**: `Short text` (必填)
- **Created By**: `Short text` (必填)
- **Created At**: `Date` (必填)

#### 欄位 3：Notes
- **Field name**: `Notes`
- **Field ID**: `notes`
- **Field type**: `Long text`
- **Required**: ❌ 不勾選

### 3.3 保存內容類型
點擊 **"Save"** 保存月曆排程內容類型

## 🎯 **第四步：創建影片資源 (Video Asset)**

### 4.1 創建內容類型
1. 點擊 **"Add content type"**
2. 輸入資訊：
   - **Name**: `Video Asset`
   - **API Identifier**: `videoAsset`
   - **Description**: `管理 MP4 影片檔案`

### 4.2 添加欄位

#### 欄位 1：Title
- **Field name**: `Title`
- **Field ID**: `title`
- **Field type**: `Short text`
- **Required**: ✅ 勾選

#### 欄位 2：Video File
- **Field name**: `Video File`
- **Field ID**: `videoFile`
- **Field type**: `Media`
- **Required**: ✅ 勾選
- **Validations**: 只允許 MP4 檔案

#### 欄位 3：Thumbnail
- **Field name**: `Thumbnail`
- **Field ID**: `thumbnail`
- **Field type**: `Media`
- **Required**: ❌ 不勾選
- **Validations**: 只允許圖片檔案

#### 欄位 4：Duration
- **Field name**: `Duration`
- **Field ID**: `duration`
- **Field type**: `Number`
- **Required**: ✅ 勾選
- **Help text**: `影片時長（秒）`

#### 欄位 5：Category
- **Field name**: `Category`
- **Field ID**: `category`
- **Field type**: `Short text`
- **Required**: ✅ 勾選

#### 欄位 6：Description
- **Field name**: `Description`
- **Field ID**: `description`
- **Field type**: `Long text`
- **Required**: ❌ 不勾選

#### 欄位 7：Tags
- **Field name**: `Tags`
- **Field ID**: `tags`
- **Field type**: `Array`
- **Array items**: `Short text`
- **Required**: ❌ 不勾選

#### 欄位 8：Upload Date
- **Field name**: `Upload Date`
- **Field ID**: `uploadDate`
- **Field type**: `Date`
- **Required**: ✅ 勾選

### 4.3 保存內容類型
點擊 **"Save"** 保存影片資源內容類型

## 🎯 **第五步：創建用戶活動記錄 (User Activity Log)**

### 5.1 創建內容類型
1. 點擊 **"Add content type"**
2. 輸入資訊：
   - **Name**: `User Activity Log`
   - **API Identifier**: `userActivityLog`
   - **Description**: `記錄用戶操作`

### 5.2 添加欄位

#### 欄位 1：User Email
- **Field name**: `User Email`
- **Field ID**: `userEmail`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 電子郵件格式

#### 欄位 2：Action
- **Field name**: `Action`
- **Field ID**: `action`
- **Field type**: `Short text`
- **Required**: ✅ 勾選
- **Validations**: 預設值選項：
  - 登入
  - 創建節目
  - 編輯節目
  - 刪除節目
  - 查看節目表

#### 欄位 3：Target
- **Field name**: `Target`
- **Field ID**: `target`
- **Field type**: `Short text`
- **Required**: ❌ 不勾選
- **Help text**: `操作目標`

#### 欄位 4：Details
- **Field name**: `Details`
- **Field ID**: `details`
- **Field type**: `Long text`
- **Required**: ❌ 不勾選
- **Help text**: `詳細資訊`

#### 欄位 5：Timestamp
- **Field name**: `Timestamp`
- **Field ID**: `timestamp`
- **Field type**: `Date`
- **Required**: ✅ 勾選

#### 欄位 6：IP Address
- **Field name**: `IP Address`
- **Field ID**: `ipAddress`
- **Field type**: `Short text`
- **Required**: ❌ 不勾選

### 5.3 保存內容類型
點擊 **"Save"** 保存用戶活動記錄內容類型

## ✅ **完成檢查清單**

- [ ] 創建 Program Template 內容類型
- [ ] 創建 Monthly Schedule 內容類型
- [ ] 創建 Video Asset 內容類型
- [ ] 創建 User Activity Log 內容類型
- [ ] 設置所有欄位和驗證規則
- [ ] 測試內容創建功能

## 🚀 **下一步**

完成這些設置後，我們將：
1. 更新前端程式碼以整合新的內容類型
2. 測試 API 連接
3. 完善管理介面功能

---

**進度**：設置步驟指南創建完成 ✅

