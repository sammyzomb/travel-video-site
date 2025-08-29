# Contentful 節目表設定指南

## 📋 概述

本指南將幫助你在 Contentful 中設定節目表內容模型，讓你可以透過 Contentful 管理節目表資料。

## 🎯 設定步驟

### 1. 登入 Contentful

1. 前往 [Contentful](https://www.contentful.com/)
2. 登入你的帳戶
3. 選擇你的 Space（空間）

### 2. 創建內容類型

#### 步驟 1：創建新的內容類型
1. 在左側選單中點擊「Content model」
2. 點擊「Add content type」
3. 輸入名稱：`Schedule Item`（節目表項目）
4. 輸入 API Identifier：`scheduleItem`
5. 點擊「Create」

#### 步驟 2：添加欄位

按照以下順序添加欄位：

| 欄位名稱 | 欄位類型 | 必填 | API Identifier | 說明 |
|---------|---------|------|---------------|------|
| 節目標題 | Short text | ✓ | 節目標題 | 節目的名稱 |
| 播出日期 | Date | ✓ | 播出日期 | 節目播出的日期 |
| 播出時間 | Short text | ✓ | 播出時間 | 播出時間（格式：HH:MM） |
| 節目時長 | Number | ✓ | 節目時長 | 節目長度（分鐘） |
| 節目分類 | Short text | ✓ | 節目分類 | 如：亞洲旅遊、歐洲旅遊 |
| 節目描述 | Long text | | 節目描述 | 節目的詳細描述 |
| 節目縮圖 | Media | | 節目縮圖 | 節目的圖片 |
| YouTube ID | Short text | | YouTubeID | YouTube 影片的 ID |
| 節目狀態 | Short text | | 節目狀態 | 如：首播、重播、特別節目 |

### 3. 欄位詳細設定

#### 節目標題 (Short text)
- **API Identifier**: `節目標題`
- **必填**: ✓
- **驗證**: 最大長度 100 字元

#### 播出日期 (Date)
- **API Identifier**: `播出日期`
- **必填**: ✓
- **格式**: YYYY-MM-DD

#### 播出時間 (Short text)
- **API Identifier**: `播出時間`
- **必填**: ✓
- **驗證**: 格式為 HH:MM（24小時制）
- **範例**: 14:30, 09:00, 23:45

#### 節目時長 (Number)
- **API Identifier**: `節目時長`
- **必填**: ✓
- **驗證**: 最小值 1，最大值 480
- **單位**: 分鐘

#### 節目分類 (Short text)
- **API Identifier**: `節目分類`
- **必填**: ✓
- **建議值**:
  - 亞洲旅遊
  - 歐洲旅遊
  - 美洲旅遊
  - 非洲旅遊
  - 大洋洲旅遊
  - 美食旅遊
  - 文化旅遊
  - 自然旅遊
  - 冒險旅遊
  - 城市旅遊
  - 海島旅遊
  - 極地旅遊
  - 歷史旅遊
  - 藝術旅遊
  - 攝影旅遊
  - 溫泉旅遊
  - 節慶旅遊
  - 海洋旅遊

#### 節目描述 (Long text)
- **API Identifier**: `節目描述`
- **必填**: ✗
- **驗證**: 最大長度 500 字元

#### 節目縮圖 (Media)
- **API Identifier**: `節目縮圖`
- **必填**: ✗
- **檔案類型**: 圖片
- **建議尺寸**: 400x225 像素

#### YouTube ID (Short text)
- **API Identifier**: `YouTubeID`
- **必填**: ✗
- **說明**: YouTube 影片的 ID（URL 中 v= 後面的部分）

#### 節目狀態 (Short text)
- **API Identifier**: `節目狀態`
- **必填**: ✗
- **建議值**:
  - 首播
  - 重播
  - 特別節目
  - 精選節目

### 4. 發布內容類型

1. 完成所有欄位設定後
2. 點擊「Save」保存
3. 點擊「Publish」發布內容類型

## 📝 添加節目內容

### 步驟 1：創建新內容
1. 點擊「Content」
2. 點擊「Add entry」
3. 選擇「Schedule Item」

### 步驟 2：填寫節目資訊
範例節目：

```
節目標題: 早安世界 - 日本東京晨間漫步
播出日期: 2024-01-15
播出時間: 06:00
節目時長: 60
節目分類: 亞洲旅遊
節目描述: 跟著我們一起探索東京的早晨，從築地市場到淺草寺的寧靜時光
節目狀態: 首播
```

### 步驟 3：上傳縮圖
1. 點擊「節目縮圖」欄位
2. 上傳圖片或選擇現有圖片
3. 建議使用 16:9 比例的圖片

### 步驟 4：發布內容
1. 點擊「Publish」發布內容
2. 或點擊「Save as draft」保存為草稿

## 🔧 程式碼整合

### 確認 API 設定

在 `script.js` 中，確認以下設定：

```javascript
const contentfulClient = contentful.createClient({
  space: '你的_SPACE_ID',
  accessToken: '你的_ACCESS_TOKEN'
});
```

### 測試連線

在瀏覽器開發者工具中檢查：

1. 打開瀏覽器開發者工具（F12）
2. 查看 Console 標籤
3. 應該看到類似訊息：
   ```
   正在從 Contentful 載入節目表，日期: 2024-01-15
   成功載入節目表，共 X 個節目
   ```

## 🚨 常見問題

### 問題 1：找不到節目
**原因**: 日期格式不匹配
**解決**: 確保播出日期格式為 YYYY-MM-DD

### 問題 2：欄位名稱錯誤
**原因**: API Identifier 不匹配
**解決**: 檢查程式碼中的欄位名稱是否與 Contentful 中的 API Identifier 一致

### 問題 3：權限問題
**原因**: Access Token 權限不足
**解決**: 確認 Access Token 有讀取權限

## 📊 內容管理建議

### 1. 批量匯入
- 使用 Contentful CLI 工具批量匯入節目
- 或使用 Contentful 的 Import/Export 功能

### 2. 內容組織
- 使用標籤（Tags）組織節目
- 建立內容範本（Content Templates）

### 3. 工作流程
- 設定內容審核流程
- 使用草稿和發布狀態

## 🔄 自動化建議

### 1. 定期更新
- 設定每週節目表更新提醒
- 使用 Contentful Webhooks 自動通知

### 2. 內容同步
- 與其他系統同步節目資訊
- 自動更新節目狀態

## 📞 支援

如果遇到問題：
1. 檢查 Contentful 官方文件
2. 查看瀏覽器 Console 錯誤訊息
3. 確認網路連線和 API 權限

---

**注意**: 請確保你的 Contentful Space ID 和 Access Token 正確設定在程式碼中。

