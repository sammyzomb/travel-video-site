# 簡化版管理員系統使用指南

## 系統概述

這是一個簡化的管理員認證系統，採用手動方式管理最高管理者和一般管理員，無需電子郵件驗證。

## 系統架構

### 用戶角色
- **最高管理者 (super_admin)**：擁有最高權限，可以創建其他管理員
- **管理員 (admin)**：一般管理員，可以管理節目內容
- **編輯者 (editor)**：可以編輯節目內容
- **檢視者 (viewer)**：只能檢視節目內容

### 權限設定
- **節目管理**：管理節目內容
- **節目表管理**：管理節目表
- **歸檔管理**：管理已歸檔的節目
- **用戶管理**：管理用戶帳號（僅最高管理者）
- **系統設定**：系統配置（僅最高管理者）

## 使用流程

### 1. 創建最高管理者

1. 訪問登入頁面：`admin-login.html`
2. 點擊「👑 創建最高管理者」連結
3. 填寫表單：
   - **電子郵件**：管理員的電子郵件地址
   - **姓名**：管理員的姓名
   - **密碼**：符合安全要求的密碼
   - **確認密碼**：再次輸入相同密碼
   - **安全代碼**：輸入 `SUPER_ADMIN_2024`
4. 點擊「創建最高管理者」

### 2. 登入系統

1. 使用創建的最高管理者帳號登入
2. 系統會自動跳轉到主控台

### 3. 創建其他管理員

1. 在主控台頁面，最高管理者會看到「👤 創建管理員」按鈕
2. 點擊按鈕進入創建管理員頁面
3. 填寫表單：
   - **電子郵件**：新管理員的電子郵件
   - **姓名**：新管理員的姓名
   - **角色**：選擇角色（管理員/編輯者/檢視者）
   - **密碼**：符合安全要求的密碼
   - **確認密碼**：再次輸入相同密碼
   - **權限設定**：勾選需要的權限
4. 點擊「創建管理員」

## 密碼要求

密碼必須符合以下要求：
- 至少 8 個字符
- 至少 1 個大寫字母
- 至少 1 個小寫字母
- 至少 1 個數字
- 至少 1 個特殊字符 (!@#$%^&*)

## 安全機制

### 最高管理者保護
- 只有知道安全代碼 `SUPER_ADMIN_2024` 的人才能創建最高管理者
- 只有最高管理者才能創建其他管理員帳號

### 登入安全
- 登入狀態有效期限為 8 小時
- 超過期限需要重新登入
- 所有登入活動都會記錄在 Contentful 中

### 權限控制
- 不同角色擁有不同的權限
- 只有最高管理者可以管理用戶帳號
- 權限設定可以精細控制

## 檔案結構

```
├── admin-login.html              # 登入頁面
├── admin-dashboard.html          # 主控台
├── create-super-admin-simple.html # 創建最高管理者
├── create-admin-simple.html      # 創建管理員
├── email-verification-system.js  # 核心認證系統
├── admin-calendar.html           # 月曆節目管理
├── admin-schedule.html           # 節目表管理
├── admin-archive.html            # 歸檔管理
└── admin-users.html              # 用戶管理
```

## Contentful 設定

### 必要的內容模型

#### adminUser 內容類型
- `email` (Short text) - 電子郵件
- `name` (Short text) - 姓名
- `role` (Short text) - 角色
- `passwordHash` (Short text) - 密碼雜湊
- `status` (Short text) - 狀態
- `permissions` (Short text) - 權限
- `avatar` (Media) - 頭像
- `createdAt` (Date & time) - 創建時間
- `lastLogin` (Date & time) - 最後登入時間
- `verificationToken` (Short text) - 驗證令牌
- `verificationExpiry` (Date & time) - 驗證過期時間
- `isEmailVerified` (Boolean) - 郵件驗證狀態
- `resetToken` (Short text) - 重置令牌
- `resetExpiry` (Date & time) - 重置過期時間

#### userActivity 內容類型
- `userId` (Short text) - 用戶ID
- `userEmail` (Short text) - 用戶郵件
- `action` (Short text) - 操作
- `success` (Boolean) - 成功狀態
- `ipAddress` (Short text) - IP地址
- `timestamp` (Date & time) - 時間戳
- `userAgent` (Short text) - 用戶代理
- `details` (Long text) - 詳細資訊

### API 設定
- **Content Delivery API**：用於讀取用戶資料
- **Content Management API**：用於創建和更新用戶資料
- **Management Token**：`CFPAT-VAHLNkSOPB68fl6e1hVEGzGGXkhStgF4Ez3jxVP3LY`

## 故障排除

### 常見問題

1. **無法創建最高管理者**
   - 檢查安全代碼是否正確：`SUPER_ADMIN_2024`
   - 確認密碼符合所有要求
   - 檢查 Contentful API 設定

2. **無法登入**
   - 確認帳號密碼正確
   - 檢查登入是否超過 8 小時
   - 清除瀏覽器快取後重試

3. **看不到創建管理員按鈕**
   - 確認當前用戶是最高管理者角色
   - 重新登入系統

4. **Contentful 錯誤**
   - 檢查 API Token 是否有效
   - 確認內容模型已正確設定
   - 檢查網路連線

### 技術支援

如果遇到技術問題，請檢查：
1. 瀏覽器控制台的錯誤訊息
2. Contentful 的 API 日誌
3. 網路連線狀態
4. 瀏覽器版本是否支援

## 版本資訊

- **當前版本**：v1.2.0
- **發布日期**：2025/08/28
- **最後更新**：2025/08/28
- **系統狀態**：已準備就緒
