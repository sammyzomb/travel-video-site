# 🎛️ 後台管理系統流程說明

## 📋 系統架構

### 登入系統
- **登入頁面**: `admin-login.html`
- **主控台**: `admin-dashboard.html`
- **管理模組**: 
  - `admin-calendar.html` - 月曆節目管理
  - `admin-schedule.html` - 節目表管理
  - `admin-archive.html` - 歸檔管理
- **測試工具**: `admin-test.html`

## 🔄 完整流程

### 1. 登入流程
```
用戶訪問 → admin-login.html → 輸入帳號密碼 → 驗證成功 → 跳轉到 admin-dashboard.html
```

### 2. 主控台選擇
```
admin-dashboard.html → 用戶選擇管理模組：
├── 📅 月曆節目管理 (admin-calendar.html)
├── 🎯 節目表管理 (admin-schedule.html)
└── 📺 歸檔管理 (admin-archive.html)
```

### 3. 模組間導航
```
各管理模組 ←→ admin-dashboard.html (返回主控台)
```

## 🔐 登入驗證

### 測試帳號
- **管理員**: `admin@travelchannel.com` / `password123`
- **編輯者**: `editor@travelchannel.com` / `password123`
- **查看者**: `viewer@travelchannel.com` / `password123`

### 驗證機制
- 使用 `sessionStorage` 儲存登入狀態
- 登入有效期：8小時
- 自動檢查登入狀態，過期自動跳轉到登入頁面

## 📱 各模組功能

### 📅 月曆節目管理 (admin-calendar.html)
- **特色**: 視覺化月曆介面
- **功能**: 
  - 月曆形式顯示節目
  - 拖拽編輯節目時間
  - 範本套用功能
  - 批量操作
- **適用**: 節目排程規劃

### 🎯 節目表管理 (admin-schedule.html)
- **特色**: 傳統列表式管理
- **功能**:
  - 節目列表管理
  - CSV匯入匯出
  - 範本功能
  - 批量添加
- **適用**: 大量節目資料處理

### 📺 歸檔管理 (admin-archive.html)
- **特色**: 已播出節目管理
- **功能**:
  - 節目歸檔分類
  - 統計分析
  - 篩選搜尋
  - 批量編輯
- **適用**: 節目資料長期管理

## 🛠️ 系統工具

### admin-test.html
- 登入狀態檢查
- 清除登入資料
- 快速導航
- 系統診斷

## 🔧 技術特點

### 前端技術
- 純 HTML/CSS/JavaScript
- 響應式設計
- 現代化 UI/UX
- 動畫效果

### 資料管理
- Contentful CMS 整合
- 模擬資料系統
- 本地儲存 (sessionStorage)

### 安全性
- 登入驗證
- 權限控制
- 會話管理
- 自動登出

## 📊 使用建議

### 新用戶
1. 先使用 `admin-test.html` 測試登入
2. 登入後從主控台開始探索
3. 根據需求選擇合適的管理模組

### 日常使用
1. 登入系統 → 主控台
2. 選擇管理模組
3. 完成工作後返回主控台
4. 登出系統

### 故障排除
1. 使用 `admin-test.html` 檢查登入狀態
2. 清除瀏覽器快取
3. 重新登入系統

## 🚀 未來擴展

### 計劃功能
- 真實 Contentful API 整合
- 用戶權限管理
- 資料備份還原
- 系統監控
- 多語言支援

### 技術改進
- 前端框架整合 (React/Vue)
- 後端 API 開發
- 資料庫優化
- 效能監控

---

## 📞 支援

如有問題，請檢查：
1. 瀏覽器是否支援 sessionStorage
2. 網路連線是否正常
3. 登入帳號是否正確
4. 系統時間是否準確

使用 `admin-test.html` 進行系統診斷。
