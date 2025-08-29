# Contentful Token 更新指南

## 🔑 重新生成 Contentful Token

### 步驟 1：登入 Contentful
1. 前往 [Contentful 管理介面](https://app.contentful.com/)
2. 使用您的帳號登入

### 步驟 2：進入 Space 設定
1. 選擇您的 Space: `os5wf90ljenp`
2. 點擊左側選單的 **Settings** → **API keys**

### 步驟 3：重新生成 Delivery Token
1. 找到現有的 API key 或創建新的
2. 複製 **Content Delivery API - access token**
3. 這個 token 應該以 `lODH-` 開頭

### 步驟 4：重新生成 Management Token
1. 前往 **Settings** → **Content management tokens**
2. 點擊 **Generate personal token**
3. 選擇適當的權限（建議選擇 "Content management"）
4. 複製生成的 token
5. 這個 token 應該以 `CFPAT-` 開頭

### 步驟 5：更新程式碼
將新的 token 更新到以下檔案：
- `contentful-sync.js`
- `admin-dashboard.html` (診斷工具中的顯示)

## ⚠️ 重要提醒
- Token 有安全性，請妥善保管
- 不要將 token 分享給他人
- 定期檢查 token 的有效性
- 如果懷疑 token 洩露，立即重新生成

## 🔍 驗證 Token
更新後，使用診斷工具測試連接是否正常。
